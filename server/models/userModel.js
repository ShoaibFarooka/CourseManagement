const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      required: true
    },
    phone: {
      type: Number,
      trim: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    language: {
      type: String,
      required: false,
      default: "eng",
      enum: ["eng", "fr", "ar"],
    },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "user"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    resetToken: {
      type: String,
      default: null
    },
    resetTokenExpiry: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
