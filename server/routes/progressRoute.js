const router = require("express").Router();
const controller = require("../controllers/progressController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const progressSchemas = require("../validationSchemas/progressSchemas");

// Record an answer
router.post(
    "/record-answer",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(progressSchemas.recordAnswerBatchSchema),
    controller.RecordAnswer
);

router.get(
    "/unit-progress",
    authMiddleware.authenticateRequest,
    controller.GetAllUnitsProgress
);

router.get(
    "/single-unit-progress",
    authMiddleware.authenticateRequest,
    controller.GetUnitProgress
);

router.post(
    "/selected-units-progress",
    authMiddleware.authenticateRequest,
    controller.GetSelectedUnitsProgress
);

router.get(
    "/subunit-progress",
    authMiddleware.authenticateRequest,
    controller.GetAllSubunitsProgress
);



// Session: continue from where you left off
router.get(
    "/session/continue",
    authMiddleware.authenticateRequest,
    controller.GetContinueSession
);

// Session: start over
router.post(
    "/session/start-over",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(progressSchemas.unitSessionSchema),
    controller.GetStartOverSession
);

router.post(
    "/session/limited",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(progressSchemas.unitSessionSchema),
    controller.limitedSession
);

// Session: wrong answers only
router.get(
    "/session/wrong-only",
    authMiddleware.authenticateRequest,
    controller.GetWrongOnlySession
);

// Session: questions the user marked for later
router.get(
    "/session/marked",
    authMiddleware.authenticateRequest,
    controller.GetMarkedSession
);

// Mark / unmark a question for a later attempt
router.post(
    "/mark-question",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(progressSchemas.markQuestionSchema),
    controller.MarkQuestion
);

// Which of the given questions are marked (for the quiz's Mark button state)
router.post(
    "/marked-status",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateBody(progressSchemas.markedStatusSchema),
    controller.GetMarkedStatus
);

router.get(
    "/unit-performance",
    authMiddleware.authenticateRequest,
    validationMiddleware.validateQuery(progressSchemas.getUnitPerformanceSchema),
    controller.GetUnitPerformance
);


module.exports = router;