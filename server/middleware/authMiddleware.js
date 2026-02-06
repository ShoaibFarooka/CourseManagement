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



const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { courseId, partId } = req.body;

    if (!courseId || !partId) {
      return res.status(400).json({ message: "Course ID and Part ID are required" });
    }

    // Find active payment (not expired)
    const activePayment = await Payment.findOne({
      user: userId,
      course: courseId,
      part: partId,
      expiryDate: { $gte: new Date() }
    }).lean();

    // Check if user had a payment that expired
    const expiredPayment = await Payment.findOne({
      user: userId,
      course: courseId,
      part: partId,
      expiryDate: { $lt: new Date() }
    }).lean();

    req.access = {
      isPaid: !!activePayment,
      isPreview: !activePayment,
      hadExpiredPayment: !!expiredPayment
    };

    next();
  } catch (error) {
    next(error);
  }
};


const verifyDevice = (mode = "strict") => async (req, res, next) => {
  try {
    const userId = req.user?.id;

    // PREVIEW + UNPAID → skip device check completely
    if (mode === "preview" && !req.access?.isPaid) {
      req.access.deviceVerified = false;
      return next();
    }

    const visitorId = req.headers["x-device-id"];
    if (!visitorId) {
      return res.status(400).json({ message: "Device ID missing" });
    }

    const userDevices = await UserAllowedDevice.findOne({ user: userId }).lean();
    const isDeviceVerified = userDevices?.allowedDevices?.some(
      d => d.deviceId === visitorId
    );

    req.access.deviceVerified = !!isDeviceVerified;

    if (!isDeviceVerified) {
      return res.status(403).json({
        message: "Device not authorized. Please verify your device."
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};


const verifyFreePreviewUnitAccess = async (req, res, next) => {
  try {
    // Paid users bypass preview rules
    if (req.access?.isPaid) {
      return next();
    }

    const { courseId, partId, publisherId, selectedUnits } = req.body;

    // Preview → exactly one unit
    if (!Array.isArray(selectedUnits) || selectedUnits.length !== 1) {
      console.log("Sub Exp");
      return res.status(403).json({
        message: req.access?.hadExpiredPayment
          ? "Your subscription has expired. Preview mode allows access to only one unit."
          : "Preview mode allows access to only one unit."
      });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }


    const part = course.parts?.find(p => p._id.toString() === partId);
    if (!part) {
      console.log("Invalid Part");
      return res.status(403).json({ message: "Invalid course part" });
    }


    const publisher = part.publishers?.find(
      pub => pub._id.toString() === publisherId
    );
    if (!publisher) {
      console.log("Invalid Pub");
      return res.status(403).json({ message: "Invalid publisher" });
    }


    const firstUnit = publisher.units?.[0];
    if (!firstUnit) {
      return res.status(403).json({ message: "No preview unit available" });
    }


    if (firstUnit._id.toString() !== selectedUnits[0].toString()) {
      console.log("Preview");
      return res.status(403).json({
        message: req.access?.hadExpiredPayment
          ? "Your subscription has expired. Only the first unit of this section is available in preview."
          : "Only the first unit of this section is available in preview."
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};


const requirePayment = async (req, res, next) => {
  try {
    if (!req.access?.isPaid) {
      const message = req.access?.hadExpiredPayment
        ? "Your subscription has expired. Please renew your subscription to access this content."
        : "This content requires an active subscription. Please purchase the course to continue.";

      return res.status(403).json({ message });
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
  requirePayment,
};
