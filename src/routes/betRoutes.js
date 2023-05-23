const express = require("express");
const userBetRouter = express.Router();
const adminBetRouter = express.Router();
const superBetRouter = express.Router();
const superWinNumRouter = express.Router();

const betController = require("../controllers/betController");
const { authenticate, authorize } = require("../utils/authMiddleware");
const { getRemainingConstraints } = require("../utils/getRemainingConstraint");

// User routes
userBetRouter.post(
  "/bets",
  authenticate,
  authorize(["user"]),
  betController.createBet
);

userBetRouter.get(
  "/bets/:table",
  authenticate,
  authorize(["user"]),
  betController.getAdminBets
);

userBetRouter.get(
  "/remaining-constraints",
  authenticate,
  authorize(["user"]),
  async (req, res) => {
    const result = await getRemainingConstraints(
      req.query.date_created,
      req.query.batch_id
    );

    return res.status(200).json(result);
  }
);

// Admin Routes
adminBetRouter.get(
  "/bets/:table",
  authenticate,
  authorize(["admin"]),
  betController.getAdminBets
);

// Super Routes
superBetRouter.get(
  "/bets/:table",
  authenticate,
  authorize(["super-admin"]),
  betController.getAdminBets
);

superWinNumRouter.post(
  "/win-numbers",
  authenticate,
  authorize(["super-admin"]),
  betController.createWinNumber
);

superWinNumRouter.get(
  "/win-numbers",
  authenticate,
  authorize(["super-admin"]),
  betController.getWinNumber
);

module.exports = {
  userBetRouter,
  adminBetRouter,
  superBetRouter,
  superWinNumRouter,
};
