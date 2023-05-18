const mongoose = require("mongoose");
const { batchID } = require("../utils/isWithinTimeRange");

const TransactionSchema = new mongoose.Schema(
  {
    trans_no: { type: String, required: true, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_amount: { type: Number, required: true },
    total_win_amount: { type: Number, required: true },
    actual_win_amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
    },
    batch_id: { type: Number },
  },
  { timestamps: true }
);

TransactionSchema.pre("save", function (next) {
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

module.exports = mongoose.model("Transaction", TransactionSchema);
