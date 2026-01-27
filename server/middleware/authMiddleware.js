const User = require("../models/userModel");
const authUtils = require("../utils/authUtils");
const UserAllowedDevice = require("../models/userAllowedDeviceModel");
const Payment = require('../models/paymentModel');

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



const verifyDevice = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const visitorId = req.headers["x-device-id"];

    if (!visitorId) {
      return res.status(400).json({ message: "Device ID missing" });
    }

    const userDevices = await UserAllowedDevice.findOne({ user: userId });
    const isAllowed = userDevices?.allowedDevices.some(
      d => d.deviceId === visitorId
    );

    if (!isAllowed) {
      return res.status(403).json({ message: "Device not authorized" });
    }

    next();
  } catch (error) {
    next(error);
  }
};


const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { courseId, partId } = req.body;

    if (!courseId || !partId) {
      return res.status(400).json({ message: "Course ID and Part ID are required" });
    }

    const payment = await Payment.findOne({
      user: userId,
      course: courseId,
      part: partId,
      expiryDate: { $gte: new Date() }
    });

    if (!payment) {
      return res.status(403).json({ message: "Course not purchased or expired" });
    }

    next();
  } catch (error) {
    next(error);
  }
};



module.exports = {
  authenticateRequest,
  verifyRole,
  verifyDevice,
  verifyPayment
};
