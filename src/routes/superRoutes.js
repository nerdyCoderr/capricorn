const express = require("express");
const router = express.Router();

const superController = require("../controllers/superController");
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../utils/authMiddleware");

// Public routes
router.post(
  "/accounts/admin-signup",
  authenticate,
  authorize(["super-admin"]),
  superController.adminSignup
);

router.post(
  "/accounts/user-signup",
  authenticate,
  authorize(["super-admin"]),
  superController.userSignup
);

// update user and admin account info
router.put(
  "/accounts/:username",
  authenticate,
  authorize(["super-admin"]),
  superController.updateAccount
);

router.get(
  "/accounts",
  authenticate,
  authorize(["super-admin"]),
  superController.getUsers
);

router.get(
  "/",
  authenticate,
  authorize(["super-admin"]),
  adminController.getAcctInfo
);

// update own account info
router.put(
  "/",
  authenticate,
  authorize(["super-admin"]),
  superController.updateOwnAccount
);

module.exports = router;
