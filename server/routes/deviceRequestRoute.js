const router = require("express").Router();
const controller = require("../controllers/deviceRequestController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const requestSchemas = require("../validationSchemas/requestSchemas");

router.post(
    "/create-request",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(requestSchemas.deviceRequestSchema),
    controller.RequestDeviceAccess
);

router.get(
    "/fetch-all-requests",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.GetAllDevicesRequests
);

router.patch(
    "/approve-device/:requestId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(requestSchemas.deviceRequestActionSchema),
    controller.ApproveDeviceRequest
);

router.patch(
    "/reject-device/:requestId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(requestSchemas.deviceRequestActionSchema),
    controller.RejectDeviceRequest
);

router.delete(
    "/user-device/:userId/:deviceId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.removeUserDevice
);

router.post(
    "/check-device-status",
    authMiddleware.authenticateRequest,
    controller.checkDeviceStatus
);

router.get(
    "/user-devices/:userId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.fetchUserDevicesById
);



module.exports = router;
