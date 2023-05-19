const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

exports.userSignup = async (req, res) => {
  try {
    const { username, password, first_name, last_name, phone_number } =
      req.body;
    const ref_code = req.user.ref_code;

    let newUser;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    newUser = new User({
      first_name,
      last_name,
      phone_number,
      role: "user",
      ref_code: ref_code,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const userToDelete = await User.findOne({
      _id: loggedInUserId,
      role: "admin",
    });

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (loggedInUserId !== userToDelete._id.toString()) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to perform this action",
      });
    }

    await User.deleteOne({ _id: userToDelete._id }); // Replace the `remove` function with `deleteOne`
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { updates } = req.body;
    const loggedInUserRole = req.user.role;
    const loggedInUserId = req.user.id;

    if (!updates) {
      return res.status(400).json({ message: "Updates are required" });
    }

    const adminToUpdate = await User.findOne({ _id: loggedInUserId });

    if (!adminToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const canUpdate =
      (loggedInUserRole === "super-admin" &&
        adminToUpdate.role !== "super-admin") ||
      (loggedInUserRole !== "super-admin" &&
        loggedInUserId === adminToUpdate._id.toString());

    if (canUpdate) {
      for (const key in updates) {
        if (
          updates.hasOwnProperty(key) &&
          key !== "role" &&
          key !== "username" &&
          key !== "_id" &&
          key !== "ref_code" // not clear if user can't edit ref_code
        ) {
          if (key === "password") {
            const hashedPassword = await bcrypt.hash(updates[key], 10);
            adminToUpdate[key] = hashedPassword;
          } else {
            adminToUpdate[key] = updates[key];
          }
        }
      }

      adminToUpdate.__v += 1;
      await adminToUpdate.updateOne(adminToUpdate);
      res
        .status(200)
        .json({ message: "Admin updated successfully", user: adminToUpdate });
    } else {
      res.status(403).json({
        message: "Forbidden: You do not have permission to perform this action",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating admin", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const page_limit = parseInt(req.query.limit) || 10;
    const id = req.query.id;
    const ref_code = req.user.ref_code;

    if (id) {
      // Fetch a specific user by ID
      const user = await User.findOne(
        { _id: id, ref_code: ref_code, role: "user" },
        { password: 0 }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User fetched successfully", user });
    } else if (req.query.page || req.query.limit) {
      // Pagination: Fetch users with page and limit
      const users = await User.find(
        { role: "user", ref_code: ref_code },
        { password: 0 }
      )
        .skip((page - 1) * page_limit)
        .limit(page_limit)
        .exec();

      const total = await User.countDocuments(
        { role: "user", ref_code: ref_code },
        { password: 0 }
      );

      res.status(200).json({
        message: "Users fetched successfully with pagination",
        total,
        totalPages: Math.ceil(total / page_limit),
        currentPage: page,
        page_limit,
        users,
      });
    } else {
      // Fetch all users
      const users = await User.find(
        { role: "user", ref_code: ref_code },
        { password: 0 }
      ).exec();
      res
        .status(200)
        .json({ message: "All users fetched successfully", users });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

exports.getAcctInfo = async (req, res) => {
  try {
    // Fetch the user with the given req.user.id
    const user = await User.findById(req.user.id, { password: 0 }).exec();

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin fetched successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching admin", error: error.message });
  }
};

// Implement other user-related controllers as needed
