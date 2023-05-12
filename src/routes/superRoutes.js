const express = require("express");
const router = express.Router();

const superController = require("../controllers/superController");
const { authenticate, authorize } = require("../utils/authMiddleware");

// Public routes
router.post(
  "/admin-signup",
  authenticate,
  authorize(["super-admin"]),
  superController.userSignup
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  superController.deleteAdmin
);

router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  superController.updateAdmin
);

router.get(
  "/accounts",
  authenticate,
  authorize(["admin"]),
  superController.getUsers
);

router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  adminController.getAcctInfo
);

module.exports = router;
