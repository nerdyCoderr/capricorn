const getCurrentDateString = require("../utils/getCurrentDateString");
const { batchID } = require("../utils/isWithinTimeRange");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getTransactionOverview = async (username) => {
  try {
    const user = await User.findOne({ username: username });
    const from = getCurrentDateString();
    const to = getCurrentDateString();

    const startOfDay = new Date(from);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    const createdAt = { $gte: startOfDay, $lte: endOfDay };

    let transact_query = {};
    transact_query.createdAt = createdAt;
    transact_query.batch_id = batchID([
      [0, 0, 14, 10],
      [14, 10, 17, 10],
      [17, 10, 23, 59],
    ]);

    let user_query = {};

    if (user.role === "admin") {
      user_query["user.ref_code"] = user.ref_code;
    }

    const aggregateQuery = Transaction.aggregate([
      // distinct by user
      // filter by transaction (createdAt, batch_id), by user (username, ref_code)
      {
        $match: transact_query,
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
        $project: {
          "user.password": 0,
        },
      },
      {
        $match: user_query,
      },
      {
        $lookup: {
          from: "transactions",
          localField: "user._id",
          foreignField: "user",
          pipeline: [
            {
              $match: transact_query,
            },
          ],
          as: "transactions",
        },
      },
      {
        $addFields: {
          total_amount: {
            $sum: "$transactions.total_amount",
          },
          total_win_amount: {
            $sum: "$transactions.total_win_amount",
          },
          actual_win_amount: {
            $sum: "$transactions.actual_win_amount",
          },
          latest_transaction: {
            $max: "$transactions.createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$user._id",
          user: { $first: "$user" },
          // transactions: { $first: "$transactions" },
          total_amount: { $first: "$total_amount" },
          total_win_amount: {
            $first: "$total_win_amount",
          },
          actual_win_amount: {
            $first: "$actual_win_amount",
          },
          latest_transaction: {
            $first: "$latest_transaction",
          },
        },
      },
      {
        $facet: {
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

    const result = await aggregateQuery.exec();
    const total = result[0].totalCount[0]?.count || 0;
    const grandTotalAmount = result[0].grandTotalAmount[0]?.total || 0;
    const grandTotalWinAmount = result[0].grandTotalWinAmount[0]?.total || 0;
    const grandActualWinAmount = result[0].grandActualWinAmount[0]?.total || 0;

    return {
      message: "Transaction overview fetched successfully",
      total,
      grandTotalAmount,
      grandTotalWinAmount,
      grandActualWinAmount,
    };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

module.exports = getTransactionOverview;
