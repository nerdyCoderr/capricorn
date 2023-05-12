const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: function () {
        return this.isNew;
      },
    },
    last_name: {
      type: String,
      required: function () {
        return this.isNew;
      },
    },
    phone_number: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["super-admin", "admin", "user"],
    },
    ref_code: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      unique: {
        type: Boolean,
        default: function () {
          return this.role === "admin" || this.role === "super-admin";
        },
      },
      sparse: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Custom function to generate a ref_code
function generateRefCode() {
  const length = 5;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

// Function to generate a unique ref_code
async function generateUniqueRefCode(model) {
  let ref_code;
  let isUnique = false;

  while (!isUnique) {
    ref_code = generateRefCode(); // Use the custom function to generate ref_code
    // Check if the ref_code already exists in the database
    const userWithRefCode = await model.findOne({ ref_code });
    if (!userWithRefCode) {
      isUnique = true;
    }
  }

  return ref_code;
}

UserSchema.pre("save", async function (next) {
  if (
    (this.role === "admin" || this.role === "super-admin") &&
    !this.ref_code
  ) {
    // Generate a unique ref_code for admins and super-admins
    this.ref_code = await generateUniqueRefCode(this.constructor);
  }

  next();
});

module.exports = mongoose.model("User", UserSchema);
