const mongoose = require("mongoose");

const WinningNumberSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  bet_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BetType",
    required: true,
  },
  number: { type: Number, required: true },
});

module.exports = mongoose.model("WinningNumber", WinningNumberSchema);
