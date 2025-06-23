const User = require("../models/userModel");
const Lead = require("../models/leadModel");
const authUtils = require("../utils/authUtils");

const createUser = async (userData, role) => {
  const {
    name,
    email,
    password,
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
  return { accessToken, refreshToken };
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

const addLead = async (email) => {
  const existingLead = await Lead.findOne({ email });
  if (existingLead) {
    const error = new Error("A lead with that email already exists.");
    error.code = 409;
    throw error;
  }

  const lead = await Lead.create({ email });
  return lead;
};

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  logoutUser,
  fetchUser,
  addLead
};
