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

router.patch(
    "/overwrite-device/:requestId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(requestSchemas.deviceRequestActionSchema),
    controller.OverwriteDeviceRequest
);

router.patch(
    "/block-user/:userId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.BlockUser
);

router.patch(
    "/unblock-user/:userId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.UnblockUser
);

router.delete(
    "/user-device/:userId/:deviceId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.removeUserDevice
);

router.get(
    "/user-devices",
    authMiddleware.authenticateRequest,
    controller.getUserDevices
);

router.delete(
    "/delete-device-request/:requestId",
    controller.DeleteRequest
);

router.get(
    "user-devices/:userId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.fetchUserDevicesById
);



module.exports = router;
