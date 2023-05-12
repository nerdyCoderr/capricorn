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
      first_name: "Japheth Louie",
      last_name: "Gofredo",
      phone_number: "09487674385",
      role: "super-admin",
      username: "super",
      password: hashedPassword,
    });

    // console.log(superAdmin);
    await superAdmin.save();
    console.log("Super-admin user created.");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
