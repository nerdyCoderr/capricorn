const BetType = require("../models/BetType");

exports.createBetType = async (req, res) => {
  try {
    const { bet_type, lower, upper, amt_const, win_multiplier } = req.body;

    const betType = new BetType({
      bet_type,
      lower,
      upper,
      amt_const,
      win_multiplier,
    });
    await betType.save();

    res.status(201).json({ message: "BetType created successfully", betType });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating betType", error: error.message });
  }
};

exports.updateBetType = async (req, res) => {
  const { bet_type, updates } = req.body;
  try {
    if (!bet_type || !updates) {
      return res
        .status(400)
        .json({ message: "BetType and updates are required" });
    }

    const betTypeToUpdate = await BetType.findOne({ bet_type: bet_type });

    if (!betTypeToUpdate) {
      return res.status(404).json({ message: "BetType not found" });
    }

    for (const key in updates) {
      if (updates.hasOwnProperty(key) && key !== "bet_type") {
        betTypeToUpdate[key] = updates[key];
      }
    }
    await betTypeToUpdate.updateOne(betTypeToUpdate);
    res.status(200).json({
      message: "BetType updated successfully",
      betType: betTypeToUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating betType", error: error.message });
  }
};

exports.deleteBetType = async (req, res) => {
  const { bet_type } = req.body;
  try {
    if (!bet_type) {
      return res.status(400).json({ message: "BetType is required" });
    }

    const betTypeToDelete = await BetType.findOne({ bet_type });

    if (!betTypeToDelete) {
      return res.status(404).json({ message: "BetType not found" });
    }
    await betTypeToDelete.deleteOne(betTypeToDelete);
    res.status(200).json({
      message: "BetType deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting betType", error: error.message });
  }
};

exports.getBetTypes = async (req, res) => {
  try {
    const betTypes = await BetType.find();
    res
      .status(200)
      .json({ message: "BetTypes retrieved successfully", betTypes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting betTypes", error: error.message });
  }
};
