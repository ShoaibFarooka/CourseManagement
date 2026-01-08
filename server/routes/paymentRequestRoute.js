const router = require("express").Router();
const controller = require("../controllers/paymentRequestController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const paymentRequestSchemas = require("../validationSchemas/paymentRequestSchemas");

router.post(
    "/",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateBody(paymentRequestSchemas.createPaymentRequestSchema),
    controller.CreatePaymentRequest
);

router.get(
    "/",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.GetAllPaymentRequests
);


router.get(
    "/:paymentId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentRequestSchemas.paymentRequestIdSchema),
    controller.GetPaymentRequestById
);

router.get(
    "/user/:userId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentRequestSchemas.userIdSchema),
    controller.GetPaymentRequestsByUser
);

router.patch(
    "/update/:paymentId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentRequestSchemas.paymentRequestIdSchema),
    validationMiddleware.validateBody(paymentRequestSchemas.updatePaymentRequestStatusSchema),
    controller.UpdatePaymentRequestStatus
);

router.delete(
    "/:paymentId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentRequestSchemas.paymentRequestIdSchema),
    controller.DeletePaymentRequest
);

module.exports = router;
