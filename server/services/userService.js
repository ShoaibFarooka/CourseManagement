const User = require("../models/userModel");
const authUtils = require("../utils/authUtils");
const crypto = require("crypto");

const createUser = async (userData, role) => {
  const {
    name,
    email,
    password,
    phone,
    country,
  } = userData;

  let existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error(
      "A user with that email has already been registered!"
    );
    error.code = 409;
    throw error;
  }
  let passwordDigest = await authUtils.hashPassword(password);
  const user = await User.create({
    name,
    phone,
    country,
    email,
    password: passwordDigest,
    role,
  });

  return user;
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found!");
    error.code = 404;
    throw error;
  }
  let passwordMatched = await authUtils.comparePassword(
    user.password,
    password
  );
  if (!passwordMatched) {
    const error = new Error("Invalid credentials!");
    error.code = 400;
    throw error;
  }
  let payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  let accessToken = authUtils.createAccessToken(payload);
  let refreshToken = authUtils.createRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken, role: user.role };
};

const refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token not found!");
    error.code = 401;
    throw error;
  }
  const payload = authUtils.verifyRefreshToken(refreshToken);
  if (!payload?.id) {
    const error = new Error("Invalid refresh token!");
    error.code = 401;
    throw error;
  }
  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error("Invalid refresh token!");
    error.code = 401;
    throw error;
  }
  const newPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
  const newAccessToken = authUtils.createAccessToken(newPayload);
  const newRefreshToken = authUtils.createRefreshToken(newPayload);
  user.refreshToken = newRefreshToken;
  await user.save();
  return { newAccessToken, newRefreshToken };
};

const logoutUser = async (refreshToken) => {
  const payload = authUtils.verifyRefreshToken(refreshToken);
  if (payload && payload.id) {
    const user = await User.findById(payload.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
};

const fetchUser = async (userId) => {
  const userProjection = {
    name: 1,
    email: 1,
    role: 1,
  };
  const user = await User.findById(userId, userProjection);
  if (!user) {
    const error = new Error("User not found!");
    error.code = 404;
    throw error;
  }
  return user;
};

const createResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("No account found with that email");
    error.code = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 1000 * 60 * 15;

  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();
  return { user, resetToken };
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error("Invalid or expired token");
    error.code = 400;
    throw error;
  }

  let passwordDigest = await authUtils.hashPassword(newPassword);
  user.password = passwordDigest;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();
};

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  logoutUser,
  fetchUser,
  createResetToken,
  resetPassword,
};
