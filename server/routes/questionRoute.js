const router = require("express").Router();
const controller = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const { upload } = require('../middleware/multerMiddleware');
const questionSchemas = require("../validationSchemas/questionSchemas");

router.get(
    "/get-all-questions/:courseId/:partId/:publisherId/:unitId/:subunitId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.getAllQuestionsSchema),
    controller.getAllQuestions
);

router.post(
    "/add/essay/:courseId/:partId/:publisherId/:unitId/:subunitId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.getAllQuestionsSchema),
    validationMiddleware.validateBody(questionSchemas.essayQuestionSchema),
    controller.addEssayQuestion
);

router.post(
    "/add/rapid/:courseId/:partId/:publisherId/:unitId/:subunitId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.getAllQuestionsSchema),
    validationMiddleware.validateBody(questionSchemas.rapidQuestionSchema),
    controller.addRapidQuestion
);

router.post(
    "/add/mcq/:courseId/:partId/:publisherId/:unitId/:subunitId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(questionSchemas.getAllQuestionsSchema),
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

router.post(
    "/check-mcqs",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("file"),
    validationMiddleware.validateFile({ required: true, fileType: "xlsx" }),
    controller.validateMCQQuestions
)

router.post(
    "/check-rapid",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("file"),
    validationMiddleware.validateFile({ required: true, fileType: "xlsx" }),
    controller.validateRapidQuestions
)

router.post(
    "/check-essay",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("file"),
    validationMiddleware.validateFile({ required: true, fileType: "xlsx" }),
    controller.validateEssayQuestions
)

router.post(
    "/fetch-unit-exam-questions",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyPayment,
    authMiddleware.verifyDevice("preview"),
    authMiddleware.verifyFreePreviewUnitAccess,
    controller.fetchQuestionsWithFilters
);

router.post(
    "/fetch-practice-exam-questions",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.FetchPracticeExamQuestions
);



router.post(
    "/fetch-standard-package-questions",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.FetchStandardReviewPackageQuestions
);


router.post(
    "/fetch-mega-package-questions",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.FetchMegaReviewPackageQuestions
);

router.post(
    '/get-total-question-in-part',
    authMiddleware.authenticateRequest,
    authMiddleware.verifyPayment,
    authMiddleware.requirePayment,
    authMiddleware.verifyDevice("strict"),
    controller.CountQuestionsInPart
)

module.exports = router;
