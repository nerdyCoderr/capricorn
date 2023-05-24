const socketIO = require("socket.io");
const { getWatchlist, generateCacheKey } = require("../utils/watchlist");
const getTransactionOverview = require("../utils/getTransactionOverview");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const changeStream = Transaction.watch();
let lastEmitTime = Date.now();

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
      const user = await User.findOne({ username });

      let room = io.of("/").adapter.rooms.get("logged in");
      if (room && user.role !== "admin") {
        for (let id of room) {
          let s = io.sockets.sockets.get(id);
          let user = s.user;
          if (user && user.username === username) {
            callback({ error: "User is already connected" });
            return;
          }
        }
      }

      if (!user) {
        callback({ error: "Invalid credentials" });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        callback({ error: "Invalid credentials" });
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

      socket.user = user;
      socket.join("logged in");

      if (user.role === "admin" || user.role === "super-admin") {
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
