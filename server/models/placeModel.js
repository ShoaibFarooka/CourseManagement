const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        videoUrl: {
            type: String,
            default: null,
        },
        imageUrl: {
            type: String,
            required: true,
        },

    },
    { timestamps: true }
);

const Place = mongoose.model("place", placeSchema);

module.exports = Place;