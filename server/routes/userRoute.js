const router = require("express").Router();
const controller = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const userSchemas = require("../validationSchemas/userSchemas");
const validationMiddleware = require("../middleware/validationMiddleware");
const { upload } = require("../middleware/multerMiddleware");

router.post(
  "/:usertype-register",
  validationMiddleware.validateBody(userSchemas.registerSchema),
  controller.RegisterUser
);
router.post('/verify-email', controller.VerifyEmailOTP);
router.post('/resend-otp', controller.ResendOTP);

router.post(
  "/login",
  validationMiddleware.validateBody(userSchemas.loginSchema),
  controller.Login
);

router.post(
  "/refresh-token",
  controller.RefreshToken
);

router.post(
  "/logout",
  controller.Logout
);

router.get(
  "/fetch-user-info",
  authMiddleware.authenticateRequest,
  controller.FetchUserInfo
);

router.post(
  "/forgot-password",
  validationMiddleware.validateBody(userSchemas.forgotPasswordSchema),
  controller.ForgotPassword
);

router.get(
  "/verify-reset-token/:token",
  controller.VerifyResetToken
);

router.post(
  "/reset-password",
  validationMiddleware.validateBody(userSchemas.resetPasswordSchema),
  controller.ResetPassword
);

router.post(
  "/Contact-Us",
  validationMiddleware.validateBody(userSchemas.contactSchema),
  controller.Contact
);

router.patch(
  "/update-user-info",
  authMiddleware.authenticateRequest,
  validationMiddleware.validateBody(userSchemas.updateUserSchema),
  controller.updateUser
)

router.patch(
  "/update-user-profile-Image",
  authMiddleware.authenticateRequest,
  upload.single("profileImage"),
  controller.updateProfileImage
);

router.get(
  "/fetch-all-users",
  authMiddleware.authenticateRequest,
  authMiddleware.verifyRole(["admin"]),
  controller.GetAllUsers
);


module.exports = router;
