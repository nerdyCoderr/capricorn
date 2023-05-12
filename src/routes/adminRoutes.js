const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../utils/authMiddleware");

// Public routes
router.post(
  "/user-signup",
  authenticate,
  authorize(["admin"]),
  adminController.userSignup
);

router.delete(
  "/",
  authenticate,
  authorize(["admin"]),
  adminController.deleteAdmin
);

router.put(
  "/",
  authenticate,
  authorize(["admin"]),
  adminController.updateAdmin
);

router.get(
  "/user-accts",
  authenticate,
  authorize(["admin"]),
  adminController.getUsers
);

router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  adminController.getAcctInfo
);

module.exports = router;
