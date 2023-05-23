const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generatePaginationLinks = require("../utils/generatePaginationLinks");
const { default: mongoose, mongo } = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;

exports.userSignup = async (req, res) => {
  const { username, password, first_name, last_name, phone_number, ref_code } =
    req.body;

  try {
    if (!ref_code) {
      return res.status(400).json({ message: "ref_code is required" });
    }

    const existingRef = await User.findOne({ ref_code, role: "admin" });

    if (!existingRef) {
      return res.status(400).json({ message: "Invalid ref_code" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
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

exports.adminSignup = async (req, res) => {
  const { username, password, first_name, last_name, phone_number } = req.body;

  let newUser;
  const existingUser = await User.findOne({ username });
  try {
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    newUser = new User({
      first_name,
      last_name,
      phone_number,
      role: "admin",
      username,
      password: hashedPassword,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Admin created successfully", data: newUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating admin", error: error.message });
  }
};

exports.updateAccount = async (req, res) => {
  let query = {};
  const { updates } = req.body;
  const username = req.params.username;

  try {
    if (!updates) {
      return res.status(400).json({ message: "Updates are required" });
    }

    if (username) {
      query.username = username;
    } else {
      return res.status(400).json({ message: "Username is required" });
    }

    const userToUpdate = await User.findOne({ query, role: "super-admin" });

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    if (updates.hasOwnProperty("ref_code") && userToUpdate.role === "user") {
      const ref_code = await User.findOne({
        ref_code: updates.ref_code,
        role: "admin",
      });
      if (!ref_code) {
        return res.status(400).json({ message: "Invalid ref_code" });
      }
    }

    if (userToUpdate.role === "super-admin") {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to perform this action",
      });
    }

    for (const key in updates) {
      if (
        updates.hasOwnProperty(key) &&
        key !== "role" &&
        key !== "username" &&
        key !== "_id" &&
        !(key === "ref_code" && userToUpdate.role === "admin")
      ) {
        if (key === "password") {
          const hashedPassword = await bcrypt.hash(updates[key], 10);
          userToUpdate[key] = hashedPassword;
        } else if (key === "active") {
          userToUpdate[key] = Boolean(parseInt(updates[key]));
        } else {
          userToUpdate[key] = updates[key];
        }
      }
    }

    await userToUpdate.updateOne(userToUpdate);
    res
      .status(200)
      .json({ message: "Account  updated successfully", user: userToUpdate });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating account", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    let query = {};
    let aggregateQuery = {};
    const page = parseInt(req.query.page) || 1;
    const page_limit = parseInt(req.query.limit) || 10;
    const { _id, username, ref_code, role, active } = req.query;

    // change to if statements
    if (active !== undefined) {
      query.active = Boolean(parseInt(active));
    }

    if (_id) {
      query._id = _id;
    }

    if (username) {
      query.username = username;
    }

    if (ref_code) {
      query.ref_code = ref_code;
    }

    if (role && role !== "super-admin") {
      query.role = role;
    }

    aggregateQuery = User.aggregate([
      // filter by createdAt, batch_id, admin ref_code
      {
        $match: {
          role: {
            $ne: "super-admin",
          },
          ...query,
        },
      },
      {
        $facet: {
          paginatedResults: [
            {
              $skip: page_limit * (page - 1),
            },
            {
              $limit: page_limit,
            },
          ],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    const result = await aggregateQuery.exec();
    const data = result[0].paginatedResults;
    const total = result[0].totalCount[0]?.count || 0;

    const totalPages = Math.ceil(total / page_limit);

    // Generate pagination links
    const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const paginationLinks = generatePaginationLinks(baseUrl, page, totalPages);

    res.status(200).json({
      message: "Users fetched successfully",
      total,
      totalPages,
      currentPage: page,
      page_limit,
      links: paginationLinks,
      data,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

exports.updateOwnAccount = async (req, res) => {
  try {
    const { updates } = req.body;
    const loggedInUserId = req.user.id;

    if (!updates) {
      return res.status(400).json({ message: "Updates are required" });
    }
    const adminToUpdate = await User.findById(
      new mongoose.Types.ObjectId(loggedInUserId)
    );

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
          adminToUpdate[key] = hashedPassword;
        } else {
          adminToUpdate[key] = updates[key];
        }
      }
    }

    await adminToUpdate.updateOne(adminToUpdate);
    res
      .status(200)
      .json({ message: "Account updated successfully", user: adminToUpdate });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating account", error: error.message });
  }
};

exports.getAcctInfo = async (req, res) => {
  try {
    // Fetch the user with the given req.user.id
    const user = await User.findById(req.user.id, { password: 0 }).exec();

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({ message: "Account fetched successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching account", error: error.message });
  }
};

// Implement other user-related controllers as needed
