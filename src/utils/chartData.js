const { batchID } = require("./isWithinTimeRange");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const getCurrentDateString = require("./getCurrentDateString");

function queryBuilder(
  user,
  from = getCurrentDateString(),
  to = getCurrentDateString(),
  fromHr = 0,
  toHr = 23,
  batch_id = batchID([
    [0, 0, 14, 10],
    [14, 10, 17, 10],
    [17, 10, 23, 59],
  ])
) {
  let transact_query = {};
  let user_query = {};
  let admin_query = {};

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
  return { transact_query, user_query, admin_query };
}

function aggregateBuilder({ transact_query, user_query, admin_query }) {
  let aggregateQuery;

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
              first_name: 0,
              last_name: 0,
              phone_number: 0,
              createdAt: 0,
              updatedAt: 0,
              active: 0,
              __v: 0,
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
        _id: {
          ref_code: "$ref_code",
          user: "$user",
        },
        transactions: {
          $push: {
            _id: "$_id",
            trans_no: "$trans_no",
            // user: "$user",
            total_amount: "$total_amount",
            total_win_amount: "$total_win_amount",
            actual_win_amount: "$actual_win_amount",
            // status: "$status",
            createdAt: "$createdAt",
            // updatedAt: "$updatedAt",
            // batch_id: "$batch_id",
            // __v: "$__v",
            ref_code: "$ref_code",
          },
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
      $sort: {
        latest_transaction: -1,
      },
    },
    {
      $group: {
        _id: "$_id.ref_code",
        trans_by_user: {
          $push: {
            user: "$_id.user",
            // transactions: "$transactions",
            total_amount: "$total_amount",
            total_win_amount: "$total_win_amount",
            actual_win_amount: "$actual_win_amount",
            latest_transaction: "$latest_transaction",
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
              first_name: 0,
              last_name: 0,
              phone_number: 0,
              createdAt: 0,
              updatedAt: 0,
              active: 0,
              __v: 0,
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
          $sum: "$trans_by_user.total_amount",
        },
        total_win_amount: {
          $sum: "$trans_by_user.total_win_amount",
        },
        actual_win_amount: {
          $sum: "$trans_by_user.actual_win_amount",
        },
        latest_transaction: {
          $max: "$trans_by_user.latest_transaction",
        },
      },
    },
    {
      $sort: {
        latest_transaction: -1,
      },
    },
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
  return aggregateQuery;
}

function resultsBuilder(results, keys) {
  let data;
  let total;
  let grandTotalAmount;
  let grandTotalWinAmount;
  let grandActualWinAmount;

  return results.reduce((acc, result, index) => {
    data = result[0].paginatedResults;
    total = result[0].totalCount[0]?.count || 0;
    grandTotalAmount = result[0].grandTotalAmount[0]?.total || 0;
    grandTotalWinAmount = result[0].grandTotalWinAmount[0]?.total || 0;
    grandActualWinAmount = result[0].grandActualWinAmount[0]?.total || 0;

    acc[keys[index]] = {
      message: "Transaction overview fetched successfully",
      total,
      grandTotalAmount,
      grandTotalWinAmount,
      grandActualWinAmount,
      data,
    };

    return acc;
  }, {});
}

async function chartData(username, days) {
  let chart_data = {};
  let results;
  let hour;
  let timeFormat;
  let newDateString;
  let queries;
  let aggregates = [];
  let keys = [];

  const dateString = getCurrentDateString();
  const date = new Date(dateString);
  const user = await User.findOne({ username: username });

  if (days === 1) {
    for (let x = 21; x >= 6; x--) {
      hour = x;
      date.setHours(hour, 0, 0, 0);
      timeFormat = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      keys.push(timeFormat);

      queries = queryBuilder(user.username, dateString, dateString, x, x, null);
      aggregates.push(aggregateBuilder(queries));
    }
    results = await Promise.all(
      aggregates.map((aggregate) => aggregate.exec())
    );

    chart_data = resultsBuilder(results, keys);

    return {
      message: "1 day historical data",
      data_points: chart_data,
    };
  } else {
    for (let x = 0; x < days; x++) {
      minus = x ? 1 : 0;
      date.setDate(date.getDate() - minus);
      newDateString = date.toISOString().split("T")[0];

      keys.push(newDateString);

      queries = queryBuilder(
        user.username,
        newDateString,
        newDateString,
        6,
        21,
        null
      );
      aggregates.push(aggregateBuilder(queries));
    }

    results = await Promise.all(
      aggregates.map((aggregate) => aggregate.exec())
    );

    chart_data = resultsBuilder(results, keys);

    return {
      message: `${days} days historical data`,
      data_points: chart_data,
    };
  }
}

module.exports = chartData;
