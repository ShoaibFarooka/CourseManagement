const router = require("express").Router();
const controller = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");
const placeSchemas = require("../validationSchemas/placeSchemas");
const quizSchemas = require("../validationSchemas/quizSchemas");
const validationMiddleware = require("../middleware/validationMiddleware");

router.get(
    "/get-all-quizzes/:placeId",
    // authMiddleware.authenticateRequest,
    // authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(placeSchemas.placeIdSchema),
    controller.GetAllQuizzes
);

router.post(
    "/add-quiz/:placeId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(placeSchemas.placeIdSchema),
    validationMiddleware.validateBody(quizSchemas.addQuizSchema),
    controller.AddQuiz
);

router.put(
    "/update-quiz/:placeId/:quizId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(quizSchemas.placeAndQuizIdSchema),
    validationMiddleware.validateBody(quizSchemas.updateQuizSchema),
    controller.UpdateQuiz
);

router.delete(
    "/delete-quiz/:placeId/:quizId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(quizSchemas.placeAndQuizIdSchema),
    controller.DeleteQuiz
);

module.exports = router;
