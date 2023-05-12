const express = require("express");
const betTypePublicRoutes = express.Router();
const betTypePrivateRoutes = express.Router();

const betTypeController = require("../controllers/betTypeController");
const { authenticate, authorize } = require("../utils/authMiddleware");

// Private Routes
betTypePrivateRoutes.post(
  "/bet-types",
  authenticate,
  authorize(["super-admin"]),
  betTypeController.createBetType
);

betTypePrivateRoutes.put(
  "/bet-types",
  authenticate,
  authorize(["super-admin"]),
  betTypeController.updateBetType
);

betTypePrivateRoutes.delete(
  "/bet-types",
  authenticate,
  authorize(["super-admin"]),
  betTypeController.deleteBetType
);

// Public routes
betTypePublicRoutes.get(
  "/bet-types",
  authenticate,
  authorize(["super-admin", "user", "admin"]),
  betTypeController.getBetTypes
);

module.exports = { betTypePrivateRoutes, betTypePublicRoutes };
