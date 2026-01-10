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
    "/fetch-request/:requestId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentRequestSchemas.requestIdSchema),
    controller.GetPaymentRequestById
);

router.get(
    "/fetch-user-request/:userId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentRequestSchemas.userIdSchema),
    controller.GetPaymentRequestsByUser
);

router.patch(
    "/approve-payment-request/:requestId/:courseId/:partId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentRequestSchemas.validateparamsIdSchema),
    validationMiddleware.validateBody(paymentRequestSchemas.approvePaymentRequestSchema),
    controller.ApprovePaymentRequest
);

router.patch(
    "/reject-payment-request/:requestId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentRequestSchemas.requestIdSchema),
    validationMiddleware.validateBody(paymentRequestSchemas.rejectPaymentRequestSchema),
    controller.RejectPaymentRequest
);

router.delete(
    "/delete-payment-request/:requestId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentRequestSchemas.requestIdSchema),
    controller.DeletePaymentRequest
);

module.exports = router;
