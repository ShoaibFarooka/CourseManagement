const router = require("express").Router();
const controller = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const userSchemas = require("../validationSchemas/userSchemas");
const validationMiddleware = require("../middleware/validationMiddleware");

router.post(
  "/:usertype-register",
  validationMiddleware.validateBody(userSchemas.registerSchema),
  controller.RegisterUser
);

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
  controller.ForgotPassword
);

router.post(
  "/reset-password/:token",
  controller.ResetPassword
);

module.exports = router;
