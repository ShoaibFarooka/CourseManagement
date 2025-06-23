const router = require("express").Router();
const controller = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const quizSchemas = require("../validationSchemas/quizSchemas");
const questionSchemas = require("../validationSchemas/questionSchemas");
const validationMiddleware = require("../middleware/validationMiddleware");

router.get(
    "/get-all-questions/:quizId",
    // authMiddleware.authenticateRequest,
    // authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(quizSchemas.quizIdSchema),
    controller.GetAllQuestions
);

router.post(
    "/add-question/:quizId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(quizSchemas.quizIdSchema),
    validationMiddleware.validateBody(questionSchemas.addQuestionSchema),
    controller.AddQuestion
);

router.put(
    "/update-question/:quizId/:questionId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.quizAndQuestionIdSchema),
    validationMiddleware.validateBody(questionSchemas.updateQuestionSchema),
    controller.UpdateQuestion
);

router.delete(
    "/delete-question/:quizId/:questionId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.quizAndQuestionIdSchema),
    controller.DeleteQuestion
);

module.exports = router;
