const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    ip: {
      type: String,
      default: "unknown"
    },
    userAgent: {
      type: String,
      default: "unknown"
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true
    },
    reason: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
