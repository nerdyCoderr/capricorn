const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

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

const superRoutes = require("./routes/superRoutes");

const uri =
  process.env.DB_LOC === "local"
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI_CLOUD;

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if the connection was successful
    const db = mongoose.connection;
    if (db.readyState === 1) {
      console.log("Connected to MongoDB!");
    } else {
      console.log("Failed to connect to MongoDB.");
    }
  } catch (error) {
    console.log(error.message);
  }
}

run();

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
  superWinNumRouter,
  superRoutes
);

// Import the socket.js file and attach it to the HTTP server
const httpServer = require("http").createServer(app);
const io = require("./sockets/socket");

io.attach(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
