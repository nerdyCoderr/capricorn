const mongoose = require("mongoose");
const { isWithinTimeRange, batchID } = require("../utils/isWithinTimeRange");

const BetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ref_code: { type: String, required: true },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    batch_id: { type: Number },
    bet_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BetType",
      required: true,
    },
    bet_num: { type: Number, required: true },
    bet_amt: { type: Number, required: true },
    win_amt: { type: Number, required: true },
    result: { type: Boolean, default: null },
    paid: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BetSchema.pre("save", function (next) {
  const batch = batchID();

  if (batch) {
    this.batch_id = batch;
  } else {
    // Throw an error if date_created is not within the specified time ranges
    const err = new Error(
      "Invalid date_created: not within allowed time ranges"
    );
    next(err);
    return;
  }

  next();
});

module.exports = mongoose.model("Bet", BetSchema);
