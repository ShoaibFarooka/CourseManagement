const router = require("express").Router();
const controller = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");

const {
    essayQuestionSchema,
    rapidQuestionSchema,
    mcqQuestionSchema,
    subunitIdSchema,
    subunitAndPublisherIdSchema,
    questionIdSchema,
} = require("../validationSchemas/questionSchemas");

const yup = require("yup");

router.get(
    "/get-all/:subunitId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(subunitIdSchema),
    controller.getAllQuestions
);



router.post(
    "/add/essay/:subunitId/:publisherId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(subunitAndPublisherIdSchema),
    validationMiddleware.validateBody(essayQuestionSchema),
    controller.addEssayQuestion
);

router.post(
    "/add/rapid/:subunitId/:publisherId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(subunitAndPublisherIdSchema),
    validationMiddleware.validateBody(rapidQuestionSchema),
    controller.addRapidQuestion
);

router.post(
    "/add/mcq/:subunitId/:publisherId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(subunitAndPublisherIdSchema),
    validationMiddleware.validateBody(mcqQuestionSchema),
    controller.addMcqQuestion
);

router.put(
    "/update/:questionId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionIdSchema),
    controller.updateQuestion
);

router.delete(
    "/delete/:questionId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionIdSchema),
    controller.deleteQuestion
);



module.exports = router;
