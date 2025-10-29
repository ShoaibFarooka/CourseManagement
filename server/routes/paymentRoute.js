const router = require("express").Router();
const controller = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const paymentSchemas = require("../validationSchemas/paymentSchemas");

router.post(
    "/",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateBody(paymentSchemas.createPaymentSchema),
    controller.CreatePayment
);

router.get(
    "/",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.GetAllPayments
);


router.get(
    "/:paymentId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentSchemas.paymentIdSchema),
    controller.GetPaymentById
);

router.get(
    "/user/:userId",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateParams(paymentSchemas.userIdSchema),
    controller.GetPaymentsByUser
);

router.patch(
    "/:paymentId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentSchemas.paymentIdSchema),
    validationMiddleware.validateBody(paymentSchemas.updatePaymentSchema),
    controller.UpdatePayment
);

router.delete(
    "/:paymentId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(paymentSchemas.paymentIdSchema),
    controller.DeletePayment
);

module.exports = router;
