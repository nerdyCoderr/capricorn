const mongoose = require("mongoose");

const WinningNumberSchema = new mongoose.Schema({
  createdAt: { type: Date, required: true },
  batch_id: { type: Number, required: true },
  bet_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BetType",
    required: true,
  },
  bet_num: { type: Number, required: true },
});

module.exports = mongoose.model("WinningNumber", WinningNumberSchema);
