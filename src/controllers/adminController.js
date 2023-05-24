const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generatePaginationLinks = require("../utils/generatePaginationLinks");

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

exports.updateAdmin = async (req, res) => {
  const { updates } = req.body;
  const loggedInUserRole = req.user.role;
  const loggedInUserId = req.user.id;
  try {
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
          key !== "ref_code" && // not clear if user can't edit ref_code
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
    let query = {};
    let aggregateQuery = {};
    const page = parseInt(req.query.page) || 1;
    const page_limit = parseInt(req.query.limit) || 10;
    const { _id, username, active } = req.query;
    const role = "user";
    const ref_code = req.user.ref_code;

    query.ref_code = ref_code;
    query.role = role;

    if (active !== undefined) {
      query.active = Boolean(parseInt(active));
    }

    if (_id) {
      query._id = _id;
    }

    if (username) {
      query.username = username;
    }

    aggregateQuery = User.aggregate([
      // filter by createdAt, batch_id, admin ref_code
      {
        $match: query,
      },
      {
        $sort: {
          createdAt: -1,
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
      .json({ message: "Error fetching Account", error: error.message });
  }
};
