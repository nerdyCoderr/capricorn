const socketIO = require("socket.io");
const { getWatchlist, generateCacheKey } = require("../utils/watchlist");
const NodeCache = require("node-cache");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const loginCache = new NodeCache({ stdTTL: 0 });

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

const io = socketIO({
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log(`$User ${socket.id} connected`);

  socket.on("watchlist", async (data) => {
    const { token } = data;
    const { role } = await authenticateSocket(token);

    if (!role) {
      socket.emit("watchlist", { message: "Authentication failed" });
      return;
    }

    const allowedRoles = ["super-admin", "admin", "user"];
    if (!authorizeSocket(role, allowedRoles)) {
      socket.emit("watchlist", {
        message: "Forbidden: You do not have permission to perform this action",
      });
      return;
    }

    socket.emit("watchlist", getWatchlist(generateCacheKey()));
  });

  socket.on("login", async (credentials) => {
    const { username, password } = credentials;

    const existingSession = loginCache.get(username);
    if (existingSession) {
      socket.emit("login", "User is already connected");
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      socket.emit("login", "Invalid credentials");
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      socket.emit("login", "Invalid credentials");
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

    loginCache.set(username, socket.id);

    socket.emit("login", {
      message: "Logged in successfully",
      token,
      id: user._id,
      role: user.role,
      ref_code: user.ref_code ? user.ref_code : null,
      username: user.username,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");

    for (const username of loginCache.keys()) {
      const userSocketId = loginCache.get(username);
      if (userSocketId === socket.id) {
        loginCache.del(username);
        break;
      }
    }
  });
});

module.exports = io;
