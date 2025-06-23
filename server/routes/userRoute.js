const router = require("express").Router();
const controller = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const userSchemas = require("../validationSchemas/userSchemas");
const validationMiddleware = require("../middleware/validationMiddleware");

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
  "/add-lead",
  validationMiddleware.validateBody(userSchemas.addLeadSchema),
  controller.AddLead
);

module.exports = router;
