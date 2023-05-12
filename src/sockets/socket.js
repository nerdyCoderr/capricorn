// sockets/socket.js
const socketIO = require("socket.io");
const { getWatchlist, generateCacheKey } = require("../utils/watchlist");
const { verifyToken } = require("../utils/authMiddleware");

const io = socketIO({
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const decoded = verifyToken(socket.handshake.query.token);
    if (decoded) {
      socket.decoded = decoded;
      return next();
    }
  }
  return next(new Error("Authentication failed"));
});

io.on("connection", (socket) => {
  console.log(`${socket.decoded.username} connected`);

  socket.on("watchlist:get", () => {
    socket.emit("watchlist:update", getWatchlist(generateCacheKey()));
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

module.exports = io;
