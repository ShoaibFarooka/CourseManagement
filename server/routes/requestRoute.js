const router = require("express").Router();
const controller = require("../controllers/requestController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const requestSchemas = require("../validationSchemas/requestSchemas");

router.post(
    "/",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(requestSchemas.deviceRequestSchema),
    controller.RequestDeviceAccess
);

router.get(
    "/",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.GetAllRequests
);

router.patch(
    "/:requestId/approve",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(requestSchemas.deviceRequestActionSchema),
    controller.ApproveDeviceRequest
);

router.patch(
    "/:requestId/reject",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(requestSchemas.deviceRequestActionSchema),
    controller.RejectDeviceRequest
);

module.exports = router;
