const Bet = require("../models/Bet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const WinNumber = require("../models/WinningNumber");
const generatePaginationLinks = require("../utils/generatePaginationLinks");
const getCurrentDateString = require("../utils/getCurrentDateString");
const generateTrans_no = require("../utils/generateTrans_no");
const {
  updateWatchlist,
  getWatchlist,
  generateCacheKey,
  createWatchlistKeyObject,
} = require("../utils/watchlist");
const io = require("../sockets/socket");
const BetType = require("../models/BetType");
const { default: mongoose, mongo } = require("mongoose");

exports.createBet = async (req, res) => {
  const { bets } = req.body;
  let new_trans_no;
  let isUnique = false;
  let new_bets = [];
  let new_bet;
  let transaction;
  let bet_type;
  let exceed = {};
  try {
    // validation
    if (!bets) {
      return res.status(400).json({ message: "No bets provided" });
    }

    for (const bet of bets) {
      bet_type = await BetType.findOne({ bet_type: bet.bet_type });

      if (!bet_type) {
        return res.status(400).json({
          message: "Invalid bet type",
        });
      }

      if (
        bet_type.upper < parseInt(bet.bet_num) &&
        bet_type.lower > parseInt(bet.bet_num)
      ) {
        return res.status(400).json({
          message: `Invalid bet number (${parseInt(bet.bet_num)}) for ${
            bet.bet_type
          }: bet number should be between ${bet_type.lower} and ${
            bet_type.upper
          }`,
        });
      }

      if (bet_type.amt_const < bet.bet_amt) {
        return res.status(400).json({
          message: `Invalid bet amount (${bet.bet_amt}) for ${bet.bet_type}`,
        });
      }

      const watch_list = getWatchlist(generateCacheKey());
      const watch_list_key = createWatchlistKeyObject(bet);

      if (watch_list.hasOwnProperty(watch_list_key)) {
        if (watch_list[watch_list_key].remaining_const < bet.bet_amt) {
          exceed[watch_list_key] = watch_list[watch_list_key];
        }
      }
    }

    if (Object.keys(exceed).length) {
      return res.status(400).json({
        message: "Bet amount exceeds remaining const",
        exceed: exceed,
      });
    }

    // create transaction
    const user = await User.findOne({ _id: req.user.id });
    while (!isUnique) {
      new_trans_no = generateTrans_no();
      const existingTrans_no = await Transaction.findOne({
        trans_no: new_trans_no,
      });
      if (!existingTrans_no) {
        isUnique = true;
        let total_amount = 0;
        let total_win_amount = 0;

        for (const bet of bets) {
          bet_type = await BetType.findOne({ bet_type: bet.bet_type });
          total_amount += parseInt(bet.bet_amt);
          total_win_amount +=
            parseInt(bet.bet_amt) * parseInt(bet_type.win_multiplier);
        }

        transaction = new Transaction({
          trans_no: new_trans_no,
          user: user._id,
          total_amount: total_amount,
          total_win_amount,
          status: "pending",
        });

        (await transaction.save()).populate("user", { password: 0 });
      }
    }

    for (const bet of bets) {
      bet_type = await BetType.findOne({ bet_type: bet.bet_type });

      new_bet = new Bet({
        user: user._id,
        ref_code: user.ref_code,
        transaction: transaction._id,
        bet_type: bet_type._id,
        bet_num: bet.bet_num,
        bet_amt: bet.bet_amt,
        win_amt: bet_type.win_multiplier * bet.bet_amt,
      });

      new_bet = await new_bet.save();
      new_bet = await Bet.populate(new_bet, { path: "bet_type" });
      new_bet.amt_const = bet_type.amt_const;
      updateWatchlist(generateCacheKey(), new_bet);

      new_bets.push(new_bet);
    }

    await Transaction.updateOne(
      { _id: transaction._id },
      { status: "completed" }
    );
    res.status(201).json({
      message: "Bet/s created successfully",
      transaction: transaction,
      bet: new_bets,
    });

    let room = io.of("/").adapter.rooms.get("watchlist");
    if (room) {
      for (let id of room) {
        let s = io.sockets.sockets.get(id);
        let user = s.user;
        if (user) {
          const data = getWatchlist(generateCacheKey());
          s.emit("watchlist", data);
          lastEmitTime = Date.now();
          return;
        }
      }
    }

    // io.emit("watchlist", getWatchlist(generateCacheKey()));
  } catch (error) {
    try {
      await Transaction.deleteOne({ _id: transaction._id });
      await Bet.deleteMany({ transaction: transaction._id });
    } catch (error) {
      console.log(error);
    }
    res
      .status(500)
      .json({ message: "Error creating bet", error: error.message });
  }
};

exports.getSuperBets = async (req, res) => {
  let query = {};
  let aggregateQuery;
  let createdAt = req.query.createdAt;

  const page = parseInt(req.query.page) || 1;
  const page_limit = parseInt(req.query.limit) || 10;
  const ref_code = req.query.ref_code;
  const batch_id = req.query.batch_id;
  try {
    // validation
    if (!req.params.table) {
      return res.status(400).json({ message: "No table provided" });
    }

    const table = parseInt(req.params.table);

    if (table < 0 && table > 3) {
      return res.status(400).json({ message: "Invalid table" });
    }

    // create transaction

    if (batch_id) {
      query.batch_id = parseInt(batch_id);
    }

    if (!createdAt) {
      createdAt = getCurrentDateString();
    }

    const specificDate = new Date(createdAt);
    const startOfDay = new Date(specificDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(specificDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.createdAt = { $gte: startOfDay, $lte: endOfDay };

    if (table === 0) {
      aggregateQuery = Bet.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            let: { bet_ref_code: "$ref_code" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$ref_code", "$$bet_ref_code"] },
                  role: "admin",
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$ref_code",
            first_name: { $first: "$user.first_name" },
            last_name: { $first: "$user.last_name" },
            role: { $first: "$user.role" },
            total_bet_amt: { $sum: "$bet_amt" },
          },
        },
        {
          $project: {
            _id: 0,
            ref_code: "$_id",
            first_name: 1,
            last_name: 1,
            role: 1,
            total_bet_amt: 1,
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
    }
    if (table === 1) {
      if (ref_code) {
        query.ref_code = ref_code;
      } else {
        return res.status(400).json({ message: "No ref_code provided" });
      }

      aggregateQuery = Bet.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users", // the name of the User collection (make sure it's correct)
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            "user.password": 0, // Exclude the password field from the user object
          },
        },
        {
          $group: {
            _id: "$user",
            first_name: { $first: "$user.first_name" },
            last_name: { $first: "$user.last_name" },
            total_bet_amt: { $sum: "$bet_amt" },
          },
        },
        {
          $project: {
            _id: 0,
            user: "$_id",
            first_name: 1,
            last_name: 1,
            total_bet_amt: 1,
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
    } else if (table === 2) {
      if (!req.query._id) {
        return res.status(400).json({ message: "No _id provided" });
      }

      query.user = new mongoose.Types.ObjectId(req.query._id);

      aggregateQuery = Bet.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transaction",
          },
        },
        { $unwind: "$transaction" },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$transaction._id",
            trans_no: { $first: "$transaction.trans_no" },
            total_bet_amt: { $sum: "$bet_amt" },
            user: { $first: "$user" },
          },
        },
        {
          $project: {
            _id: 0,
            transaction_id: "$_id",
            trans_no: 1,
            total_bet_amt: 1,
            user: {
              _id: "$user._id",
              first_name: "$user.first_name",
              last_name: "$user.last_name",
              username: "$user.username",
            },
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
    } else if (table === 3) {
      if (!req.query.transaction_id) {
        return res.status(400).json({ message: "No transaction_id provided" });
      }

      query.transaction = new mongoose.Types.ObjectId(req.query.transaction_id);

      aggregateQuery = Bet.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            user: {
              password: 0,
            },
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transaction",
          },
        },
        { $unwind: "$transaction" },
        {
          $lookup: {
            from: "bettypes",
            localField: "bet_type",
            foreignField: "_id",
            as: "bet_type",
          },
        },
        { $unwind: "$bet_type" },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
    }

    const result = await aggregateQuery.exec();
    const data = result[0].paginatedResults;
    const total = result[0].totalCount[0]?.count || 0;

    const totalPages = Math.ceil(total / page_limit);

    // Generate pagination links
    const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const paginationLinks = generatePaginationLinks(baseUrl, page, totalPages);

    res.status(200).json({
      message:
        table === 0
          ? "Bet/s distinct by ref_code fetched successfully with pagination"
          : table === 1
          ? "Bet/s distinct by username fetched successfully with pagination"
          : table === 2
          ? "Bet/s distinct by trans_no fetched successfully with pagination"
          : `Bet/s with trans_no ${req.query.trans_no} fetched successfully with pagination`,
      total,
      totalPages,
      currentPage: page,
      page_limit,
      data,
      links: paginationLinks,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error getting bet/s", error: error.message });
  }
};

exports.getAdminBets = async (req, res) => {
  // empty vars
  let transact_query = {};
  let user_query = {};
  let bet_query = {};
  let bet_type_query = {};
  let query = {};
  let aggregateQuery;

  // query params
  let from = req.query.from;
  let to = req.query.to;
  let page = parseInt(req.query?.page) || 1;
  let page_limit = parseInt(req.query?.limit) || 10;
  let batch_id = parseInt(req.query?.batch_id);
  let sort_dir = parseInt(req.query?.sort_dir) || -1;
  let bet_type = req.query.bet_type;
  let bet_number = parseInt(req.query?.bet_num);
  let bet_result = parseInt(req.query?.bet_result);
  let transaction_num = req.query.trans_no;
  const table = parseInt(req.params?.table);

  // user specific
  let user_id;
  let ref_code;
  let role = req.user.role;

  try {
    if (role === "super-admin") {
      user_id = req.query.user_id
        ? new mongoose.Types.ObjectId(req.query.user_id)
        : null;

      if (table < 0 && table > 4) {
        return res.status(400).json({ message: "Invalid table" });
      }
    } else if (role === "admin") {
      let user;
      if (req.query.username) {
        user = await User.findOne({ username: req.query.username });
        user_id = user._id;
      } else {
        user_id = req.query.user_id
          ? new mongoose.Types.ObjectId(req.query.user_id)
          : null;
      }

      ref_code = req.user.ref_code;

      if (table < 1 && table > 4) {
        return res.status(400).json({ message: "Invalid table" });
      }
    } else if (role === "user") {
      user_id = req.user.id;
      ref_code = req.user.ref_code;

      if (table < 2 && table > 4) {
        return res.status(400).json({ message: "Invalid table" });
      }
    }

    //filter, sort and validation
    if (!table) {
      return res.status(400).json({ message: "No table provided" });
    }

    if (!from && !to) {
      from = getCurrentDateString();
      to = getCurrentDateString();
    }

    const startOfDay = new Date(from);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    const createdAt = { $gte: startOfDay, $lte: endOfDay };

    if (table === 0) {
    } else if (table === 1) {
      if (user_id) {
        transact_query.user = user_id;
      }

      if (ref_code) {
        user_query.ref_code = ref_code;
      }

      if (batch_id) {
        transact_query.batch_id = batch_id;
      }

      transact_query.createdAt = createdAt;
    } else if (table === 2) {
      if (!user_id) {
        return res.status(400).json({ message: "No user_id provided" });
      }

      if (batch_id) {
        query.batch_id = batch_id;
      }

      query.user = new mongoose.Types.ObjectId(user_id);
      query.createdAt = createdAt;
    } else if (table === 3 || table === 4) {
      if (!transaction_num && table === 3) {
        return res.status(400).json({ message: "No trans_no provided" });
      } else if (transaction_num) {
        const trans_no = await Transaction.findOne({
          trans_no: transaction_num,
        });
        bet_query.transaction = trans_no?._id;
      }

      if (user_id !== "") {
        bet_query.user = new mongoose.Types.ObjectId(user_id);
      }

      if (batch_id) {
        bet_query.batch_id = batch_id;
      }

      if (bet_type) {
        const betType = await BetType.findOne({ bet_type: bet_type });

        bet_type_query["bet_type._id"] = betType?._id;
      }

      if (bet_number) {
        bet_query.bet_num = bet_number;
      }

      if (!isNaN(bet_result)) {
        bet_query.result = Boolean(bet_result);
      }

      bet_query.ref_code = ref_code;
      bet_query.createdAt = createdAt;
    }

    //transaction_queries
    if (table === 1) {
      aggregateQuery = Transaction.aggregate([
        // distinct by user
        // filter by transaction (createdAt, batch_id), by user (username, ref_code)
        {
          $match: transact_query,
        },
        {
          $lookup: {
            from: "users",
            let: {
              ["user_id"]: "$user", //user_query.user_id,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$user_id"],
                  },
                  ref_code: user_query.ref_code,
                },
              },
              {
                $project: {
                  "user.password": 0,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $group: {
            _id: "$user._id",
            user: {
              $first: "$user",
            },
            total_amount: {
              $sum: "$total_amount",
            },
            total_win_amount: {
              $sum: "$total_win_amount",
            },
            actual_win_amount: {
              $sum: "$actual_win_amount",
            },
            latest_transaction: {
              $max: "$createdAt",
            },
          },
        },
        {
          $sort: { latest_transaction: sort_dir },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
            grandTotalAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$total_amount" },
                },
              },
            ],
            grandTotalWinAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$total_win_amount" },
                },
              },
            ],
            grandActualWinAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$actual_win_amount" },
                },
              },
            ],
          },
        },
      ]);
    } else if (table === 2) {
      aggregateQuery = Transaction.aggregate([
        // distinct by transaction
        // filter by transaction (createdAt, batch_id), by user (username, ref_code)
        {
          $match: query,
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $sort: { createdAt: sort_dir },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
            grandTotalAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$total_amount" },
                },
              },
            ],
            grandTotalWinAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$total_win_amount" },
                },
              },
            ],
            grandActualWinAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$actual_win_amount" },
                },
              },
            ],
          },
        },
      ]);
    } else if (table === 3 || table === 4) {
      aggregateQuery = Bet.aggregate([
        {
          $match: bet_query,
        },
        {
          $lookup: {
            from: "bettypes",
            localField: "bet_type",
            foreignField: "_id",
            as: "bet_type",
          },
        },
        {
          $unwind: "$bet_type",
        },
        {
          $match: bet_type_query,
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transaction",
          },
        },
        {
          $unwind: "$transaction",
        },
        {
          $sort: {
            createdAt: sort_dir,
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
            grandTotalAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$bet_amt" },
                },
              },
            ],
            grandTotalWinAmount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$win_amt" },
                },
              },
            ],
            grandActualWinAmount: [
              {
                $match: { result: true },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$win_amt" },
                },
              },
            ],
          },
        },
      ]);
    }

    const result = await aggregateQuery.exec();
    const data = result[0].paginatedResults;
    const total = result[0].totalCount[0]?.count || 0;
    const grandTotalAmount = result[0].grandTotalAmount[0]?.total || 0;
    const grandTotalWinAmount = result[0].grandTotalWinAmount[0]?.total || 0;
    const grandActualWinAmount = result[0].grandActualWinAmount[0]?.total || 0;

    const totalPages = Math.ceil(total / page_limit);

    // Generate pagination links
    const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const paginationLinks = generatePaginationLinks(baseUrl, page, totalPages);

    res.status(200).json({
      message:
        table === 1
          ? "User/s who made transaction/s fetched successfully with pagination"
          : table === 2
          ? "Transaction/s per user fetched successfully with pagination"
          : table === 3
          ? `Bet/s with trans_no ${req.query.trans_no} fetched successfully with pagination`
          : "Bet/s distinct by admin fetched successfully with pagination",
      total,
      totalPages,
      currentPage: page,
      page_limit,
      links: paginationLinks,
      grandTotalAmount,
      grandTotalWinAmount,
      grandActualWinAmount,
      data,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error getting bet/s", error: error.message });
  }
};

exports.getUserBets = async (req, res) => {
  let query = {};
  let aggregateQuery;
  let createdAt = req.query.createdAt;

  const page = parseInt(req.query.page) || 1;
  const page_limit = parseInt(req.query.limit) || 10;
  const ref_code = req.user.ref_code;
  const batch_id = req.query.batch_id;
  const _id = req.user.id;

  try {
    if (!req.params.table) {
      return res.status(400).json({ message: "No table provided" });
    }

    const table = parseInt(req.params.table);

    if (table > 2 && table < 3) {
      return res.status(400).json({ message: "Invalid table" });
    }

    if (ref_code) {
      query.ref_code = ref_code;
    }

    if (batch_id) {
      query.batch_id = parseInt(batch_id);
    }

    if (!createdAt) {
      createdAt = getCurrentDateString();
    }

    const specificDate = new Date(createdAt);
    const startOfDay = new Date(specificDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(specificDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.createdAt = { $gte: startOfDay, $lte: endOfDay };

    if (table === 2) {
      if (!_id) {
        return res.status(400).json({ message: "No _id provided" });
      }

      query.user = new mongoose.Types.ObjectId(_id);

      aggregateQuery = Bet.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transaction",
          },
        },
        { $unwind: "$transaction" },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$transaction._id",
            trans_no: { $first: "$transaction.trans_no" },
            total_bet_amt: { $sum: "$bet_amt" },
            user: { $first: "$user" },
          },
        },
        {
          $project: {
            _id: 0,
            transaction_id: "$_id",
            trans_no: 1,
            total_bet_amt: 1,
            user: {
              _id: "$user._id",
              first_name: "$user.first_name",
              last_name: "$user.last_name",
              username: "$user.username",
            },
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
    } else if (table === 3) {
      if (!req.query.transaction_id) {
        return res.status(400).json({ message: "No transaction_id provided" });
      }

      query.transaction = new mongoose.Types.ObjectId(req.query.transaction_id);

      aggregateQuery = Bet.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            user: {
              password: 0,
            },
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transaction",
          },
        },
        { $unwind: "$transaction" },
        {
          $lookup: {
            from: "bettypes",
            localField: "bet_type",
            foreignField: "_id",
            as: "bet_type",
          },
        },
        { $unwind: "$bet_type" },
        {
          $facet: {
            paginatedResults: [
              { $skip: page_limit * (page - 1) },
              { $limit: page_limit },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
    }

    const result = await aggregateQuery.exec();
    const data = result[0].paginatedResults;
    const total = result[0].totalCount[0]?.count || 0;

    const totalPages = Math.ceil(total / page_limit);

    // Generate pagination links
    const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const paginationLinks = generatePaginationLinks(baseUrl, page, totalPages);

    res.status(200).json({
      message:
        table === 1
          ? "Bet/s distinct by user fetched successfully with pagination"
          : table === 2
          ? "Bet/s distinct by transaction fetched successfully with pagination"
          : table === 3
          ? `Bet/s with trans_no ${req.query.trans_no} fetched successfully with pagination`
          : "Bet/s distinct by admin fetched successfully with pagination",
      total,
      totalPages,
      currentPage: page,
      page_limit,
      data,
      links: paginationLinks,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error getting bet/s", error: error.message });
  }
};

exports.createWinNumber = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { win_nums } = req.body;
    let winningNums = [];

    if (!win_nums) {
      throw new Error("Win numbers not provided");
    }

    for (const [index, win_num] of win_nums.entries()) {
      const { createdAt, batch_id, bet_type, bet_num } = win_num;

      if (!(createdAt && batch_id && bet_type && bet_num)) {
        throw new Error(
          `Object at index ${index} does not have all required properties.`
        );
      }

      const startOfDay = new Date(createdAt);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(createdAt);
      endOfDay.setHours(23, 59, 59, 999);
      const createdAt_ = { $gte: startOfDay, $lte: endOfDay };

      let query = {
        createdAt: createdAt_,
        batch_id: batch_id,
        bet_type: new mongoose.Types.ObjectId(bet_type),
        bet_num: bet_num,
      };

      const findWinNumber = await WinNumber.findOne(query).session(session);

      if (findWinNumber) {
        throw new Error("Win number already exists");
      }

      query.createdAt = startOfDay;
      const winNumber = await WinNumber.create([query], { session });
      console.log(
        "🚀 ~ file: betController.js:1076 ~ exports.createWinNumber= ~ winNumber:",
        winNumber
      );
      winningNums.push(winNumber);
      query.createdAt = createdAt_;
      const winningBets = await Bet.find(query).session(session);
      console.log(
        "🚀 ~ file: betController.js:1084 ~ exports.createWinNumber= ~ winningBets:",
        winningBets
      );

      if (!winningBets) {
        console.log("No winning bets found");
        continue;
      }

      const transactionIds = winningBets.map((bet) => bet.transaction);

      const testbetupdate = await Bet.updateMany(
        {
          _id: { $in: winningBets.map((bet) => bet._id) },
        },
        {
          $set: { result: true },
        },
        { session }
      );
      console.log(
        "🚀 ~ file: betController.js:1101 ~ exports.createWinNumber= ~ testbetupdate:",
        testbetupdate
      );

      for (const transactionId of transactionIds) {
        const winSum = await Bet.aggregate([
          {
            $match: {
              transaction: new mongoose.Types.ObjectId(transactionId),
              result: true,
            },
          },
          {
            $group: {
              _id: "$transaction",
              totalWinAmt: { $sum: "$win_amt" },
            },
          },
        ]).session(session);

        if (winSum[0] && winSum[0].totalWinAmt) {
          await Transaction.updateOne(
            { _id: transactionId },
            { actual_win_amount: winSum[0].totalWinAmt },
            { session }
          );
        }
      }
    }

    await session.commitTransaction();

    return res.status(201).json({
      message: "Win number created successfully",
      winningNums,
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating win number", error: error.message });
  } finally {
    session.endSession();
  }
};
