const router = require("express").Router();
const controller = require("../controllers/placeController");
const authMiddleware = require("../middleware/authMiddleware");
const placeSchemas = require("../validationSchemas/placeSchemas");
const validationMiddleware = require("../middleware/validationMiddleware");
const { upload } = require("../middleware/multerMiddleware");

router.get(
    "/get-all-places",
    // authMiddleware.authenticateRequest,
    // authMiddleware.verifyRole(["admin"]),
    controller.GetAllPlaces
);

router.post(
    "/add-place",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("image"),
    validationMiddleware.validateFile({ required: true }),
    validationMiddleware.validateBody(placeSchemas.addPlaceSchema),
    controller.AddPlace
);

router.put(
    "/update-place/:placeId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    upload.single("image"),
    validationMiddleware.validateFile({ required: false }),
    validationMiddleware.validateParams(placeSchemas.placeIdSchema),
    validationMiddleware.validateBody(placeSchemas.updatePlaceSchema),
    controller.UpdatePlace
);

router.delete(
    "/delete-place/:placeId",
    authMiddleware.authenticateRequest,
    authMiddleware.verifyRole(["admin"]),
    validationMiddleware.validateParams(placeSchemas.placeIdSchema),
    controller.DeletePlace
);

module.exports = router;
