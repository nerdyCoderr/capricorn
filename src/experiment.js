const User = require("../src/models/User");
const Transaction = require("../src/models/Transaction");
const Bet = require("../src/models/Bet");
const BetType = require("../src/models/BetType");

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function test() {
  const loggedInAdmin = await User.findById("645b871714b0e0ad077ebdcf");
  const users = await User.find({ ref_code: loggedInAdmin.ref_code });

  let req = {};

  // Request query parameters
  const page = 1;
  const pageSize = 10;
  const sortField = "createdAt";
  const sortOrder = "desc";
  const betTypeFilter = null;
  const betNum = null;

  // Search filters
  const startDate = new Date("2023-05-11");
  const endDate = new Date("2023-05-11");

  let filter = {
    user: { $in: users.map((user) => user._id) },
  };

  // if (startDate && endDate) {
  //   filter.createdAt = { $gte: startDate, $lte: endDate };
  // } else if (startDate) {
  //   filter.createdAt = { $gte: startDate };
  // } else if (endDate) {
  //   filter.createdAt = { $lte: endDate };
  // }

  const totalCount = await Transaction.countDocuments(filter);

  let transactions = await Transaction.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("user");

  const transactionsWithBets = [];

  for (const transaction of transactions) {
    let betFilter = {
      transaction: transaction._id,
      user: transaction.user._id,
    };

    if (betTypeFilter) {
      betFilter.bet_type = betTypeFilter;
    }

    if (betNum) {
      betFilter.bet_num = betNum;
    }

    const bets = await Bet.find(betFilter).populate("bet_type");

    // Create a new object with the transaction data and bets
    const transactionWithBets = transaction.toObject();
    transactionWithBets.bets = bets;
    transactionsWithBets.push(transactionWithBets);
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  console.log(JSON.stringify(transactionsWithBets, null, 2));

  return 0;
}

async function anothertest() {
  let query = {
    // _id: "653b8c7c14b0e0ad077ebdce",
    ref_code: "XO8RP",
  };

  const bet = await Bet.find(query)
    .populate(["bet_type", "user", "transaction"])
    .then((res) => {
      console.log(res);
    });
}

anothertest();
