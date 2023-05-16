const Bet = require("../models/Bet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
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

    if (bet_type.upper < bet.bet_num || bet_type.lower > bet.bet_num) {
      return res.status(400).json({
        message: `Invalid bet number (${bet.bet_num}) for ${bet.bet_type}: bet number should be between ${bet_type.lower} and ${bet_type.upper}`,
      });
    }

    if (bet_type.bet_amt < bet.bet_amt) {
      return res.status(400).json({
        message: `Invalid bet amount (${bet.bet_amt}) for ${bet.bet_type}: bet amount should be less than or equal to ${bet_type.bet_amt}`,
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
  try {
    const user = await User.findOne({ _id: req.user.id });
    while (!isUnique) {
      new_trans_no = generateTrans_no();
      const existingTrans_no = await Transaction.findOne({
        trans_no: new_trans_no,
      });
      if (!existingTrans_no) {
        isUnique = true;
        let total_amount = 0;

        for (const bet of bets) {
          total_amount += parseInt(bet.bet_amt);
        }

        transaction = new Transaction({
          trans_no: new_trans_no,
          user: user._id,
          total_amount: total_amount,
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

    io.emit("watchlist", getWatchlist(generateCacheKey()));
  } catch (error) {
    try {
      await Transaction.deleteOne({ _id: transaction._id });
      await Bet.deleteMany({ transaction: transaction._id });
    } catch (error) {
      console.log(error.message);
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

  // validation
  if (!req.params.table) {
    return res.status(400).json({ message: "No table provided" });
  }

  const table = parseInt(req.params.table);

  if (table < 0 && table > 3) {
    return res.status(400).json({ message: "Invalid table" });
  }

  // create transaction
  try {
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
  let query = {};
  let aggregateQuery;
  let createdAt = req.query.createdAt;

  const page = parseInt(req.query.page) || 1;
  const page_limit = parseInt(req.query.limit) || 10;
  const ref_code = req.user.ref_code;
  const batch_id = req.query.batch_id;

  if (!req.params.table) {
    return res.status(400).json({ message: "No table provided" });
  }

  const table = parseInt(req.params.table);

  if (table < 1 && table > 3) {
    return res.status(400).json({ message: "Invalid table" });
  }

  try {
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

    if (table === 1) {
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
    } else if (table === 4) {
      if (req.query.bet_type_id) {
        query.bet_type = new mongoose.Types.ObjectId(req.query.bet_type_id);
      }

      if (req.query.bet_num) {
        query.bet_num = parseInt(req.query.bet_num);
      }

      if (req.query.trans_no) {
        const trans_no = await Transaction.findOne({
          trans_no: req.query.trans_no,
        });
        query.transaction = trans_no._id;
      }

      // for user

      // let user = {};
      // if (req.query.first_name) {
      //   user.first_name = req.query.first_name;
      // }

      // if (req.query.last_name) {
      //   user.last_name = req.query.last_name;
      // }

      // // const userData = await User.find(user);

      // // //map the userData to query.user
      // // query.user = userData.map(
      // //   (user) => new mongoose.Types.ObjectId(user._id)
      // // );

      // // query.user = userData ? new mongoose.Types.ObjectId(userData._id) : "";

      aggregateQuery = Bet.aggregate([
        {
          $match: query,
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
