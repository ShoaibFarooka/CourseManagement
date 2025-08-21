const userService = require("../services/userService.js");


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
    await userService.forgotPassword(email);
    res.status(200).json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    next(error);
  }
};

const ResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    await userService.resetPassword(token, newPassword);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
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
};
