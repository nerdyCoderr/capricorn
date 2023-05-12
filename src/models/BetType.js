const mongoose = require("mongoose");

const BetTypeSchema = new mongoose.Schema(
  {
    bet_type: { type: String, required: true, unique: true },
    lower: { type: Number, required: true },
    upper: { type: Number, required: true },
    amt_const: { type: Number, required: true },
    win_multiplier: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BetType", BetTypeSchema);
