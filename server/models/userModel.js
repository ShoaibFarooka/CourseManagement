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
    // Google only supplies name, email and a photo, so an account created through
    // Google sign in has no country, phone or password. These stay required for normal
    // signups — the condition only relaxes them for authProvider: "google".
    country: {
      type: String,
      trim: true,
      required: function () {
        return this.authProvider !== "google";
      }
    },
    phone: {
      type: Number,
      trim: true,
      unique: true,
      // Sparse so the several Google accounts that have no phone are simply left out of
      // the unique index. Without this, only one document could omit phone.
      sparse: true,
      required: function () {
        return this.authProvider !== "google";
      }
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider !== "google";
      },
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: {
      type: String
    },
    otpExpiry: {
      type: Date
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
