const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const { copyDataToCloud } = require("./utils/cloudBackup");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import the necessary routes
const { userPublicRoutes, userPrivateRoutes } = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const {
  betTypePrivateRoutes,
  betTypePublicRoutes,
} = require("./routes/betTypeRoutes");
const {
  userBetRouter,
  adminBetRouter,
  superBetRouter,
  superWinNumRouter,
} = require("./routes/betRoutes");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// initialize bet constraints watchlist
const { initializeWatchlist } = require("./utils/watchlist");
initializeWatchlist();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware for parsing JSON in request bodies
app.use(express.json());

// API Versioning
const apiVersion = "/api/v1";

// Public Routes
app.use(`${apiVersion}/`, userPublicRoutes, betTypePublicRoutes);

// User routes
app.use(`${apiVersion}/users`, userPrivateRoutes, userBetRouter);

// Admin routes
app.use(`${apiVersion}/admins`, adminRoutes, adminBetRouter);

// Bet type routes
app.use(
  `${apiVersion}/super`,
  betTypePrivateRoutes,
  superBetRouter,
  superWinNumRouter
);

// Import the socket.js file and attach it to the HTTP server
const httpServer = require("http").createServer(app);
const io = require("./sockets/socket");

io.attach(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

cron.schedule("0 0 * * *", () => {
  console.log("Running data copy process...");
  copyDataToCloud(process.env.MONGODB_URI_CLOUD);
});
