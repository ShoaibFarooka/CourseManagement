const mongoose = require("mongoose");

const subunitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
});

const unitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['rapid', 'mcq', 'essay'],
        required: true,
    },
    subunits: {
        type: [subunitSchema],
        required: true
    },
});

const partSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    units: {
        type: [unitSchema],
        required: true
    },
});

const publisherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
});

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        publishers: {
            type: [publisherSchema],
            required: true
        },
        parts: {
            type: [partSchema],
            required: true
        },
        status: {
            type: Boolean,
            default: true
        },
        timeRatio: {
            type: Number,
            default: 1
        }
    },
    { timestamps: true }
);

const Course = mongoose.model("course", courseSchema);

module.exports = Course;
