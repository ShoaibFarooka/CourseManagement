const User = require("../models/userModel");
const authUtils = require("../utils/authUtils");
const UserAllowedDevice = require("../models/userAllowedDeviceModel");
const Payment = require('../models/paymentModel');
const Course = require('../models/courseModel');

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



// mode = "strict" | "preview"
const verifyDevice = (mode = "strict") => async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const visitorId = req.headers["x-device-id"];

    if (!visitorId) {
      return res.status(400).json({ message: "Device ID missing" });
    }

    const userDevices = await UserAllowedDevice.findOne({ user: userId }).lean();
    const isAllowed = userDevices?.allowedDevices?.some(
      d => d.deviceId === visitorId
    );

    req.access = req.access || {};
    req.access.deviceVerified = !!isAllowed;

    if (mode === "strict") {
      // ✅ strict mode: device must always be verified
      if (!isAllowed) {
        return res.status(403).json({ message: "Device not authorized" });
      }
    } else if (mode === "preview") {
      // 🔓 preview mode: device must be verified if paid
      // but allow unverified device for unpaid user
      if (req.access.isPaid && !isAllowed) {
        return res.status(403).json({ message: "Device not authorized" });
      }
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
    }).lean();

    req.access = {
      isPaid: !!payment,
      isPreview: !payment
    };

    next();
  } catch (error) {
    next(error);
  }
};



const verifyFreePreviewUnitAccess = async (req, res, next) => {
  try {
    if (!req.access?.isPreview) {
      return next(); // paid user → skip preview check
    }

    const { courseId, selectedUnits } = req.body;

    if (!selectedUnits || selectedUnits.length !== 1) {
      return res.status(403).json({ message: "Preview allows only the first unit" });
    }

    const course = await Course.findById(courseId).lean();

    const firstUnit =
      course?.parts?.[0]
        ?.publishers?.[0]
        ?.units?.[0];

    if (!firstUnit) {
      return res.status(403).json({ message: "No preview unit available" });
    }

    if (firstUnit._id.toString() !== selectedUnits[0].toString()) {
      return res.status(403).json({ message: "Please purchase the course to access this unit" });
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
  verifyPayment,
  verifyFreePreviewUnitAccess,
};
