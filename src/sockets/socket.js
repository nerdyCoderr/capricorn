const socketIO = require("socket.io");
const { getWatchlist, generateCacheKey } = require("../utils/watchlist");
const getCurrentDateString = require("../utils/getCurrentDateString");
const { isWithinTimeRange } = require("../utils/isWithinTimeRange");
const NodeCache = require("node-cache");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const loginCache = new NodeCache({ stdTTL: 0 });
const transOverviewCache = new NodeCache({ stdTTL: 0 });

const changeStream = Transaction.watch();
let lastEmitTime = Date.now();

const authenticateSocket = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      id: decoded.id,
      role: decoded.role,
      ref_code: decoded.ref_code,
      username: decoded.username,
    };
  } catch (error) {
    return { error: error };
  }
};

const authorizeSocket = (role, allowedRoles) => {
  return allowedRoles.includes(role);
};

function batchID() {
  const date = new Date();
  let batch_id = null;
  if (isWithinTimeRange(date, 0, 0, 14, 10)) {
    batch_id = 1;
  } else if (isWithinTimeRange(date, 14, 10, 17, 45)) {
    batch_id = 2;
  } else if (isWithinTimeRange(date, 17, 45, 23, 59)) {
    batch_id = 3;
  }

  return batch_id;
}

const getTransactionOverview = async (username) => {
  try {
    const user = await User.findOne({ username: username });
    const from = getCurrentDateString();
    const to = getCurrentDateString();

    const startOfDay = new Date(from);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    const createdAt = { $gte: startOfDay, $lte: endOfDay };

    let transact_query = {};
    transact_query.createdAt = createdAt;
    transact_query.batch_id = batchID();

    let user_query = {};
    user_query["user.ref_code"] = user.ref_code;

    const aggregateQuery = Transaction.aggregate([
      // distinct by user
      // filter by transaction (createdAt, batch_id), by user (username, ref_code)
      {
        $match: transact_query,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $project: {
          "user.password": 0,
        },
      },
      {
        $match: user_query,
      },
      {
        $lookup: {
          from: "transactions",
          localField: "user._id",
          foreignField: "user",
          as: "transactions",
        },
      },
      {
        $addFields: {
          total_amount: {
            $sum: "$transactions.total_amount",
          },
          total_win_amount: {
            $sum: "$transactions.total_win_amount",
          },
          actual_win_amount: {
            $sum: "$transactions.actual_win_amount",
          },
          latest_transaction: {
            $max: "$transactions.createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$user._id",
          user: { $first: "$user" },
          // transactions: { $first: "$transactions" },
          total_amount: { $first: "$total_amount" },
          total_win_amount: {
            $first: "$total_win_amount",
          },
          actual_win_amount: {
            $first: "$actual_win_amount",
          },
          latest_transaction: {
            $first: "$latest_transaction",
          },
        },
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          grandTotalAmount: [
            {
              $group: {
                _id: null,
                total: { $sum: "$total_amount" },
              },
            },
          ],
          grandTotalWinAmount: [
            {
              $group: {
                _id: null,
                total: { $sum: "$total_win_amount" },
              },
            },
          ],
          grandActualWinAmount: [
            {
              $group: {
                _id: null,
                total: { $sum: "$actual_win_amount" },
              },
            },
          ],
        },
      },
    ]);

    const result = await aggregateQuery.exec();
    const total = result[0].totalCount[0]?.count || 0;
    const grandTotalAmount = result[0].grandTotalAmount[0]?.total || 0;
    const grandTotalWinAmount = result[0].grandTotalWinAmount[0]?.total || 0;
    const grandActualWinAmount = result[0].grandActualWinAmount[0]?.total || 0;

    return {
      message: "Transaction overview fetched successfully",
      total,
      grandTotalAmount,
      grandTotalWinAmount,
      grandActualWinAmount,
    };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

const io = socketIO({
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

changeStream.on("change", async (change) => {
  // Only emit the change if more than 10 seconds have passed since the last emit
  try {
    if (Date.now() - lastEmitTime > 10000) {
      console.log("Emitting transaction overview");

      let room = io.of("/").adapter.rooms.get("transactionOverview");
      if (room) {
        for (let id of room) {
          let s = io.sockets.sockets.get(id);
          let user = s.user;
          if (user) {
            const data = await getTransactionOverview(user.username);
            s.emit("admin:transactionOverview", data);
            lastEmitTime = Date.now();
            return;
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

io.on("connection", (socket) => {
  console.log(`$User ${socket.id} connected`);

  socket.on("login", async (credentials, callback) => {
    try {
      const { username, password } = credentials;

      let room = io.of("/").adapter.rooms.get("logged in");
      if (room) {
        for (let id of room) {
          let s = io.sockets.sockets.get(id);
          let user = s.user;
          if (user && user.username === username) {
            callback({ error: "User is already connected" });
            // socket.emit("login", { error: "User is already connected" });
            return;
          }
        }
      }

      const user = await User.findOne({ username });
      if (!user) {
        callback({ error: "Invalid credentials" });
        // socket.emit("login", { error: "Invalid credentials" });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        callback({ error: "Invalid credentials" });
        // socket.emit("login", { error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          ref_code: user.ref_code ? user.ref_code : null,
          username: user.username,
        },
        JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      // loginCache.set(username, socket.id);

      socket.user = user;
      socket.join("logged in");

      if (user.role === "admin") {
        transOverviewCache.set(username, socket.id);
        socket.join("transactionOverview");
      } else if (user.role === "user") {
        socket.join("watchlist");
      }

      callback({
        message: "Logged in successfully",
        token,
        id: user._id,
        role: user.role,
        ref_code: user.ref_code ? user.ref_code : null,
        username: user.username,
      });
      // socket.emit("login", {
      //   message: "Logged in successfully",
      //   token,
      //   id: user._id,
      //   role: user.role,
      //   ref_code: user.ref_code ? user.ref_code : null,
      //   username: user.username,
      // });
    } catch (error) {
      console.log(error);
      callback({ error: error });
      socket.emit("login", { error: error });
      return;
    }
  });

  socket.on("logout", () => {
    console.log(`$User ${socket.id} logged out`);
    socket.disconnect();
  });

  socket.on("watchlist", async (data, callback) => {
    try {
      let room = io.of("/").adapter.rooms.get("watchlist");
      if (room) {
        for (let id of room) {
          let s = io.sockets.sockets.get(id);
          let user = s.user;
          if (user) {
            const watch = getWatchlist(generateCacheKey());
            callback(watch);
            lastEmitTime = Date.now();
            return;
          }
        }
      }
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  });

  socket.on("admin:transactionOverview", async (data, callback) => {
    try {
      let room = io.of("/").adapter.rooms.get("transactionOverview");
      if (room) {
        for (let id of room) {
          let s = io.sockets.sockets.get(id);
          let user = s.user;
          if (user) {
            const trans = await getTransactionOverview(user.username);
            callback({ trans });
            lastEmitTime = Date.now();
            return;
          }
        }
      }
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  });

  socket.on("disconnect", () => {
    console.log(`$User ${socket.id} disconnected`);
  });
});

module.exports = io;
