const placeService = require("../services/placeService");

const GetAllPlaces = async (req, res, next) => {
    try {
        const places = await placeService.getAllPlaces();
        res.status(200).json({ places });
    } catch (error) {
        next(error);
    }
};

const AddPlace = async (req, res, next) => {
    try {
        const data = { ...req.body };
        const imageUrl = req.file.path;
        const place = await placeService.addPlace({ ...data, imageUrl });
        res.status(201).json({ message: "Place added successfully" });
    } catch (error) {
        next(error);
    }
};

const UpdatePlace = async (req, res, next) => {
    try {
        const { placeId } = req.params;
        const data = { ...req.body };
        const imageUrl = req.file?.path || null;
        const updatedPlace = await placeService.updatePlace(placeId, { ...data, imageUrl });
        res.status(200).json({ message: "Place updated successfully" });
    } catch (error) {
        next(error);
    }
};

const DeletePlace = async (req, res, next) => {
    try {
        const { placeId } = req.params;
        await placeService.deletePlace(placeId);
        res.status(200).json({ message: "Place deleted successfully" });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    GetAllPlaces,
    AddPlace,
    UpdatePlace,
    DeletePlace
};
