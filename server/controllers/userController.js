const userService = require("../services/userService.js");
const path = require('path');
const emailService = require('../services/emailService');
const templateUtils = require('../utils/templateUtils');


const RegisterUser = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const user = await userService.createUser(data, "user");
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};


const Login = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const { accessToken, refreshToken, role } = await userService.loginUser(data);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(200).json({ token: accessToken, role });
  } catch (error) {
    next(error);
  }
};

const RefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const { newAccessToken, newRefreshToken } = await userService.refreshToken(
      refreshToken
    );
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    next(error);
  }
};

const Logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await userService.logoutUser(refreshToken);
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const FetchUserInfo = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await userService.fetchUser(userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const ForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { user, resetToken } = await userService.createResetToken(email);
    const CLIENT_URL = req.get('origin');
    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    const templatePath = path.join(__dirname, '../templates/resetPasswordEmailTemplate.hbs');
    const data = {
      companyLogo: "http://localhost:5222/static/images/logo.png",
      userName: user.name,
      resetLink
    };
    const htmlContent = await templateUtils.generateHTML(data, templatePath);
    await emailService.sendEmail(user.email, 'Password Reset Request', null, htmlContent);
    res.status(200).json({ message: 'Reset password link sent!' });
  } catch (error) {
    next(error);
  }
};

const ResetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    next(error);
  }
};
const Contact = async (req, res, next) => {
  try {
    const { name, email, subject, question } = req.body;

    if (!name || !email || !subject || !question) {
      return res.status(400).json({ message: "All fields are required." });
    }

    await emailService.saveMessage({ name, email, subject, question });

    res.status(200).json({ message: "✅ Your message has been sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending contact email:", error);
    next(error);
  }
};



module.exports = {
  RegisterUser,
  Login,
  RefreshToken,
  Logout,
  FetchUserInfo,
  ForgotPassword,
  ResetPassword,
  Contact
};
