const express = require("express");
const userPublicRoutes = express.Router();
const userPrivateRoutes = express.Router();

const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../utils/authMiddleware");

// Public routes
userPublicRoutes.post("/login", userController.login);
userPublicRoutes.get("/ref-codes", userController.getRefCode);

// Private routes
userPrivateRoutes.post("/signup", userController.userSignup);
userPrivateRoutes.delete(
  "/",
  authenticate,
  authorize(["user"]),
  userController.deleteUser
);
userPrivateRoutes.put(
  "/",
  authenticate,
  authorize(["user"]),
  userController.updateUser
);
userPrivateRoutes.get(
  "/",
  authenticate,
  authorize(["user"]),
  userController.getAcctInfo
);

module.exports = { userPublicRoutes, userPrivateRoutes };
