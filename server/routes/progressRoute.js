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

// Get unit progress stats
router.get(
    "/unit-progress",
    authMiddleware.authenticateRequest,
    controller.GetAllUnitsProgress
);

// Get unit progress stats
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

// Session: wrong answers only
router.get(
    "/session/wrong-only",
    authMiddleware.authenticateRequest,
    controller.GetWrongOnlySession
);

module.exports = router;