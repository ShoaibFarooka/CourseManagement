const router = require("express").Router();
const controller = require("../controllers/plannerController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const plannerSchemas = require("../validationSchemas/plannerSchemas");

// The planner is for paying users on a verified device only. Course-specific routes
// take courseId/partId in the body so verifyPayment can check that exact purchase.

router.get(
    "/courses",
    authMiddleware.authenticateRequest,
    authMiddleware.requireAnyActivePayment,
    authMiddleware.verifyDevice("strict"),
    controller.GetPlannerCourses
);

router.post(
    "/get-plan",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(plannerSchemas.planSelectionSchema),
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.GetPlan
);

router.post(
    "/create-plan",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(plannerSchemas.createPlanSchema),
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.CreatePlan
);

router.post(
    "/day-questions",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(plannerSchemas.planDaySchema),
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.GetDayQuestions
);

router.post(
    "/record-progress",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(plannerSchemas.recordDayProgressSchema),
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.RecordDayProgress
);

router.post(
    "/reset-plan",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(plannerSchemas.planSelectionSchema),
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.ResetPlan
);

module.exports = router;
