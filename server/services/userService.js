const User = require("../models/userModel");
const authUtils = require("../utils/authUtils");
const crypto = require("crypto");
const emailService = require("./emailService");

const createUser = async (userData, role) => {
  const {
    name,
    email,
    password,
    phone,
    country,
    image,
  } = userData;

  let existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error(
      "A user with that email has already been registered!"
    );
    error.code = 409;
    throw error;
  }

  let existingUser2 = await User.findOne({ phone });
  if (existingUser2) {
    const error = new Error(
      "A user with that phone number has already been registered!"
    );
    error.code = 409;
    throw error;
  }

  let passwordDigest = await authUtils.hashPassword(password);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const user = await User.create({
    name,
    phone,
    country,
    email,
    password: passwordDigest,
    role,
    image,
    emailVerificationOTP: otp,
    otpExpiry,
    isEmailVerified: false,
  });


  await emailService.sendOTPEmail(email, otp);

  return user;
};


const verifyEmailOTP = async (email, otp) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.code = 404;
    throw error;
  }

  if (user.isEmailVerified) {
    const error = new Error("Email already verified");
    error.code = 400;
    throw error;
  }

  if (user.emailVerificationOTP !== otp) {
    const error = new Error("Invalid OTP");
    error.code = 400;
    throw error;
  }

  if (user.otpExpiry < new Date()) {
    const error = new Error("OTP expired");
    error.code = 400;
    throw error;
  }


  user.isEmailVerified = true;
  user.emailVerificationOTP = null;
  user.otpExpiry = null;
  await user.save();



  return { message: "Email verified successfully" };
};

const resendOTP = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.code = 404;
    throw error;
  }

  if (user.isEmailVerified) {
    const error = new Error("Email already verified");
    error.code = 400;
    throw error;
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationOTP = newOtp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await user.save();

  await emailService.sendOTPEmail(email, newOtp);

  return { success: true, message: "OTP resent successfully" };
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
    country: 1,
    phone: 1,
    isBlocked: 1,
    role: 1,
    image: 1,
    language: 1,
  };
  const user = await User.findById(userId, userProjection);
  if (!user) {
    const error = new Error("User not found!");
    error.code = 404;
    throw error;
  }
  user.language = user.language || 'eng';
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

const verifyResetToken = async (token) => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return { success: false, message: "Invalid or expired token" };
  }

  return { success: true, message: "Token is valid", user };
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

const updateUser = async (userId, updateData) => {
  const allowedFields = ["name", "phone", "country", "language"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  if (!updatedUser) {
    const error = new Error("User not found!");
    error.code = 404;
    throw error;
  }

  return updatedUser;
};

const updateProfileImage = async (userId, imagePath) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found!");
    error.code = 404;
    throw error;
  }

  user.image = imagePath;
  await user.save();

  return user;
};


const getAllUsers = async () => {
  const users = await User.aggregate([
    // Lookup payments
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "user",
        as: "payments",
      },
    },
    // Lookup allowed devices
    {
      $lookup: {
        from: "user_allowed_devices",
        localField: "_id",
        foreignField: "user",
        as: "allowedDevicesData",
      },
    },
    // Unwind allowedDevicesData (if exists)
    {
      $addFields: {
        allowedDevices: {
          $cond: {
            if: { $gt: [{ $size: "$allowedDevicesData" }, 0] },
            then: { $arrayElemAt: ["$allowedDevicesData.allowedDevices", 0] },
            else: [],
          },
        },
      },
    },
    // Remove temp field
    { $project: { allowedDevicesData: 0 } },
    // Lookup course and resolve part name for each payment
    {
      $lookup: {
        from: "courses",
        localField: "payments.course",
        foreignField: "_id",
        as: "coursesData",
      },
    },
    {
      $addFields: {
        payments: {
          $map: {
            input: "$payments",
            as: "p",
            in: {
              _id: "$$p._id",
              amount: "$$p.amount",
              startDate: "$$p.startDate",
              expiryDate: "$$p.expiryDate",
              comment: "$$p.comment",
              course: {
                $let: {
                  vars: {
                    courseObj: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$coursesData",
                            as: "c",
                            cond: { $eq: ["$$c._id", "$$p.course"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { _id: "$$courseObj._id", name: "$$courseObj.name" },
                },
              },
              part: {
                $let: {
                  vars: {
                    partObj: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: {
                              $let: {
                                vars: {
                                  courseObj: {
                                    $arrayElemAt: [
                                      {
                                        $filter: {
                                          input: "$coursesData",
                                          as: "c",
                                          cond: { $eq: ["$$c._id", "$$p.course"] },
                                        },
                                      },
                                      0,
                                    ],
                                  },
                                },
                                in: "$$courseObj.parts",
                              },
                            },
                            as: "part",
                            cond: { $eq: ["$$part._id", "$$p.part"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { _id: "$$partObj._id", name: { $ifNull: ["$$partObj.name", "Unknown Part"] } },
                },
              },
            },
          },
        },
      },
    },
    // Final projection
    {
      $project: {
        name: 1,
        email: 1,
        country: 1,
        isBlocked: 1,
        payments: 1,
        allowedDevices: 1,
      },
    },
  ]);

  return users;
};





module.exports = {
  createUser,
  verifyEmailOTP,
  resendOTP,
  loginUser,
  refreshToken,
  logoutUser,
  fetchUser,
  createResetToken,
  verifyResetToken,
  resetPassword,
  updateUser,
  updateProfileImage,
  getAllUsers,
};
