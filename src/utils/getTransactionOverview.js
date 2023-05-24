const getCurrentDateString = require("./getCurrentDateString");
const { batchID } = require("./isWithinTimeRange");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getTransactionOverview = async (
  username,
  from = getCurrentDateString(),
  to = getCurrentDateString(),
  fromHr = 0,
  toHr = 23,
  batch_id = batchID([
    [0, 0, 14, 10],
    [14, 10, 17, 10],
    [17, 10, 23, 59],
  ])
) => {
  try {
    const user = await User.findOne({ username: username });

    let transact_query = {};
    let user_query = {};
    let admin_query = {};
    let aggregateQuery;

    // query params
    const startOfDay = new Date(from);
    startOfDay.setHours(parseInt(fromHr), 0, 0, 0);
    const endOfDay = new Date(to);
    endOfDay.setHours(parseInt(toHr), 59, 59, 999);
    const createdAt = { $gte: startOfDay, $lte: endOfDay };

    // user specific
    let role = user?.role;
    let ref_code;
    let admin_ref_code;

    if (role === "admin") {
      ref_code = user.ref_code;
      admin_ref_code = user.ref_code;
    }

    if (ref_code) {
      user_query.ref_code = ref_code;
    }

    if (batch_id) {
      transact_query.batch_id = batch_id;
    }

    if (admin_ref_code) {
      admin_query.ref_code = admin_ref_code;
    }

    transact_query.createdAt = createdAt;

    aggregateQuery = Transaction.aggregate([
      // filter by createdAt, batch_id, admin ref_code
      {
        $match: transact_query,
      },
      {
        $lookup: {
          from: "users",
          let: {
            user_id: "$user",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$user_id"],
                },
                ...admin_query,
              },
            },
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          ref_code: "$user.ref_code",
        },
      },
      {
        $group: {
          _id: "$ref_code",
          transactions: {
            $push: {
              _id: "$_id",
              trans_no: "$trans_no",
              user: "$user",
              total_amount: "$total_amount",
              total_win_amount: "$total_win_amount",
              actual_win_amount: "$actual_win_amount",
              status: "$status",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              batch_id: "$batch_id",
              __v: "$__v",
              ref_code: "$ref_code",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            ref_code: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$ref_code", "$$ref_code"],
                },
                role: "admin",
              },
            },
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "admin",
        },
      },
      {
        $unwind: "$admin",
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
        $sort: {
          latest_transaction: -1,
        },
      },
      // {
      //   $project: {
      //     transactions: 0,
      //   },
      // },
      {
        $facet: {
          paginatedResults: [],
          totalCount: [
            {
              $count: "count",
            },
          ],
          grandTotalAmount: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$total_amount",
                },
              },
            },
          ],
          grandTotalWinAmount: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$total_win_amount",
                },
              },
            },
          ],
          grandActualWinAmount: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$actual_win_amount",
                },
              },
            },
          ],
        },
      },
    ]);

    const result = await aggregateQuery.exec();
    const data = result[0].paginatedResults;
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
      data,
    };
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

module.exports = getTransactionOverview;
