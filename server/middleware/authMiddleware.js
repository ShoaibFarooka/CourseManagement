const User = require("../models/userModel");
const authUtils = require("../utils/authUtils");

const authenticateRequest = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      const error = new Error("Invalid or missing token!");
      error.code = 401;
      throw error;
    }

    const payload = authUtils.verifyAccessToken(token);
    if (!payload) {
      const error = new Error("Invalid or missing token!");
      error.code = 401;
      throw error;
    }

    req.user = payload;
    next();

  } catch (error) {
    throw error;
  }
};

const verifyRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);

      if (!user) {
        const error = new Error("User not found!");
        error.code = 404;
        throw error;
      }

      if (!requiredRoles.includes(user.role)) {
        const error = new Error("Insufficient role!");
        error.code = 403;
        throw error;
      }

      next();
    } catch (error) {
      throw error;
    }
  };
};

module.exports = {
  authenticateRequest,
  verifyRole
};
