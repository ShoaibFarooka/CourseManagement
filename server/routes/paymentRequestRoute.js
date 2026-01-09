const router = require("express").Router();
const controller = require("../controllers/paymentRequestController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const paymentRequestSchemas = require("../validationSchemas/paymentRequestSchemas");

router.post(
    "/create-request",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(paymentRequestSchemas.createPaymentRequestSchema),
    controller.CreatePaymentRequest
);

router.get(
    "/fetch-all-requests",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.GetAllPaymentRequests
);


router.get(
    "/fetch-request/:paymentId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentRequestSchemas.paymentRequestIdSchema),
    controller.GetPaymentRequestById
);

router.get(
    "/fetch-user-request/:userId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentRequestSchemas.userIdSchema),
    controller.GetPaymentRequestsByUser
);

router.patch(
    "/update-payment/:paymentId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentRequestSchemas.paymentRequestIdSchema),
    validationMiddleware.validateBody(paymentRequestSchemas.updatePaymentRequestStatusSchema),
    controller.UpdatePaymentRequestStatus
);

router.delete(
    "/delete-payment/:paymentId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentRequestSchemas.paymentRequestIdSchema),
    controller.DeletePaymentRequest
);

module.exports = router;
