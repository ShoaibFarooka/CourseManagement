const router = require("express").Router();
const controller = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const { upload } = require('../middleware/multerMiddleware');
const questionSchemas = require("../validationSchemas/questionSchemas");

router.get(
    "/get-all-questions/:subunitId/:publisherId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.subunitAndPublisherIdSchema),
    controller.getAllQuestions
);

router.post(
    "/add/essay/:subunitId/:publisherId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.subunitAndPublisherIdSchema),
    validationMiddleware.validateBody(questionSchemas.essayQuestionSchema),
    controller.addEssayQuestion
);

router.post(
    "/add/rapid/:subunitId/:publisherId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.subunitAndPublisherIdSchema),
    validationMiddleware.validateBody(questionSchemas.rapidQuestionSchema),
    controller.addRapidQuestion
);

router.post(
    "/add/mcq/:subunitId/:publisherId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.subunitAndPublisherIdSchema),
    validationMiddleware.validateBody(questionSchemas.mcqQuestionSchema),
    controller.addMcqQuestion
);

router.put(
    "/update-question/:questionId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.questionIdSchema),
    controller.updateQuestion
);

router.delete(
    "/delete/:questionId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.questionIdSchema),
    controller.deleteQuestion
);

router.post(
    "/upload-mcq",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("file"),
    validationMiddleware.validateFile({ required: true, fileType: "xlsx" }),
    controller.uploadMCQQuestions
)

router.post(
    "/upload-rapid",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("file"),
    validationMiddleware.validateFile({ required: true, fileType: "xlsx" }),
    controller.uploadRapidQuestions
)

router.post(
    "/upload-essay",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("file"),
    validationMiddleware.validateFile({ required: true, fileType: "xlsx" }),
    controller.uploadEssayQuestions
)



module.exports = router;
