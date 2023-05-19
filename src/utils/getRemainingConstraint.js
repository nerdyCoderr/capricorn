const Bet = require("../models/Bet");

const getRemainingConstraints = async (currentDate, batch_id) => {
  try {
    if (!currentDate || !batch_id) {
      return {
        status: "error",
        message: "Missing required parameters",
      };
    }

    const specificDate = new Date(currentDate);
    const startDate = new Date(specificDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(specificDate);
    endDate.setHours(23, 59, 59, 999);

    let query = {};
    query.createdAt = { $gte: startDate, $lte: endDate };
    query.batch_id = parseInt(batch_id);

    let totalBetAmount = Bet.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "bettypes",
          localField: "bet_type",
          foreignField: "_id",
          as: "bettype",
        },
      },
      {
        $unwind: {
          path: "$bettype",
        },
      },
      {
        $group: {
          _id: {
            bet_type: "$bet_type",
            bet_num: "$bet_num",
          },
          bet_type: {
            $first: "$bettype.bet_type",
          },
          bet_num: {
            $first: "$bet_num",
          },
          total_amt: {
            $sum: "$bet_amt",
          },
          amt_const: {
            $first: "$bettype.amt_const",
          },
        },
      },
      {
        $addFields: {
          key: {
            $concat: [
              {
                $toString: "$bet_type",
              },
              ":",
              {
                $toString: "$bet_num",
              },
            ],
          },
          remaining_const: {
            $subtract: ["$amt_const", "$total_amt"],
          },
        },
      },
    ]);

    const result = await totalBetAmount.exec();

    return { result };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
};

module.exports = { getRemainingConstraints };
