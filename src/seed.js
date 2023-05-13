const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const bcrypt = require("bcrypt");

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database");

    const hashedPassword = await bcrypt.hash("password", 10);
    const superAdmin = new User({
      first_name: "Super",
      last_name: "Seed",
      phone_number: "777",
      role: "super-admin",
      username: "super",
      password: hashedPassword,
    });

    const admin = new User({
      first_name: "Japheth Louie",
      last_name: "Gofredo",
      phone_number: "000",
      role: "admin",
      username: "admin",
      password: hashedPassword,
    });

    // console.log(superAdmin);
    await superAdmin.save();
    await admin.save();
    console.log("Super-admin and Admin created.");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
