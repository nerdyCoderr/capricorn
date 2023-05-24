const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, active: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        ref_code: user.ref_code ? user.ref_code : null,
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Logged in successfully",
      token,
      id: user._id,
      role: user.role,
      ref_code: user.ref_code ? user.ref_code : null,
      username: user.username,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { updates } = req.body;
  const loggedInUserRole = req.user.role;
  const loggedInUserId = req.user.id;

  try {
    if (!updates) {
      return res.status(400).json({ message: "Updates are required" });
    }

    const userToUpdate = await User.findOne({
      _id: loggedInUserId,
      active: true,
    });

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const canUpdate =
      (loggedInUserRole === "super-admin" &&
        userToUpdate.role !== "super-admin") ||
      (loggedInUserRole !== "super-admin" &&
        loggedInUserId === userToUpdate._id.toString());

    if (canUpdate) {
      for (const key in updates) {
        if (
          updates.hasOwnProperty(key) &&
          key !== "role" &&
          key !== "username" &&
          key !== "_id" &&
          key !== "ref_code" &&
          key !== "active"
        ) {
          if (key === "password") {
            const hashedPassword = await bcrypt.hash(updates[key], 10);
            userToUpdate[key] = hashedPassword;
          } else {
            userToUpdate[key] = updates[key];
          }
        }
      }

      userToUpdate.__v += 1;
      await userToUpdate.updateOne(userToUpdate);
      res
        .status(200)
        .json({ message: "User updated successfully", user: userToUpdate });
    } else {
      res.status(403).json({
        message: "Forbidden: You do not have permission to perform this action",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

exports.getAcctInfo = async (req, res) => {
  try {
    // Fetch the user with the given req.user.id
    const user = await User.findById(req.user.id, { password: 0 }).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

exports.getRefCode = async (req, res) => {
  let query = {};
  try {
    query.role = "admin";
    query.active = true;
    const admin_ref_codes = await User.find(query, {
      ref_code: 1,
      first_name: 1,
      last_name: 1,
      _id: 0,
    });
    if (!admin_ref_codes) {
      return res.status(404).json({ message: "Ref_codes not found" });
    }
    res.status(200).json({
      message: "Ref_codes fetched successfully",
      admin_ref_codes,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching ref_codes", error: error.message });
  }
};
