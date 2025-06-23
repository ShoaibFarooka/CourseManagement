const Place = require("../models/placeModel");

const getAllPlaces = async () => {
    const places = await Place.find({});
    if (!places || places.length <= 0) {
        const error = new Error("Places not found!");
        error.code = 404;
        throw error;
    }
    return places;
};

const addPlace = async (data) => {
    const { name, description, longitude, latitude, videoUrl, imageUrl } = data;
    const place = await Place.create({
        name,
        description,
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        videoUrl,
        imageUrl
    });

    return place;
};


const updatePlace = async (placeId, data) => {
    const { name, description, longitude, latitude, videoUrl, imageUrl } = data;
    const place = await Place.findById(placeId);
    if (!place) {
        const error = new Error("Place not found!");
        error.code = 404;
        throw error;
    }
    place.name = name;
    place.description = description;
    place.longitude = parseFloat(longitude);
    place.latitude = parseFloat(latitude);
    place.videoUrl = videoUrl;
    if (imageUrl) {
        place.imageUrl = imageUrl;
    }
    const updatedPlace = await place.save();

    return updatedPlace;
};

const deletePlace = async (placeId) => {
    const place = await Place.findByIdAndDelete(placeId);

    if (!place) {
        const error = new Error("Place not found!");
        error.code = 404;
        throw error;
    }
};

module.exports = {
    getAllPlaces,
    addPlace,
    updatePlace,
    deletePlace
};
