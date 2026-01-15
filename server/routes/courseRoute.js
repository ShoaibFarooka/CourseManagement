const router = require("express").Router();
const controller = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const courseSchemas = require("../validationSchemas/courseSchemas");
const validationMiddleware = require("../middleware/validationMiddleware");

router.get(
    "/get-all-courses",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    controller.GetAllCourses
);

router.post(
    "/add-course",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateBody(courseSchemas.addCourseSchema),
    controller.AddCourse
);

router.put(
    "/update-course/:courseId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(courseSchemas.courseIdSchema),
    validationMiddleware.validateBody(courseSchemas.updateCourseSchema),
    controller.UpdateCourse
);

router.delete(
    "/delete-course/:courseId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(courseSchemas.courseIdSchema),
    controller.DeleteCourse
);

router.get(
    "/fetch-all-courses",
    controller.fetchAllCoursesWithParts
)

router.get(
    '/fetch-units-and-subunits',
    controller.getAllUnitsWithSubunits
)

module.exports = router;
