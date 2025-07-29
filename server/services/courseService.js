const Course = require("../models/courseModel");

const getAllCourses = async () => {
    const courses = await Course.find({});
    if (!courses || courses.length <= 0) {
        const error = new Error("Courses not found!");
        error.code = 404;
        throw error;
    }

    return courses;
};

const addCourse = async (data) => {
    const { name, publishers, parts, timeRatio } = data;

    const course = await Course.create({
        name,
        timeRatio,
        publishers: publishers || [],
        parts
    });

    return course;
};

const mongoose = require("mongoose");

const updateCourse = async (courseId, data) => {
    const { name, timeRatio, publishers = [], parts = [] } = data;

    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found!");
        error.code = 404;
        throw error;
    }

    course.name = name;
    course.timeRatio = timeRatio;

    course.publishers = publishers.map((p) => {
        const existing = course.publishers.find((ep) => ep._id?.toString() === p._id);
        return existing
            ? { ...existing.toObject(), name: p.name }
            : { _id: new mongoose.Types.ObjectId(), name: p.name };
    });

    course.parts = parts.map((part) => {
        const existingPart = course.parts.find((ep) => ep._id?.toString() === part._id);
        return {
            _id: existingPart ? existingPart._id : new mongoose.Types.ObjectId(),
            name: part.name,
            units: (part.units || []).map((unit) => {
                const existingUnit = existingPart?.units.find((eu) => eu._id?.toString() === unit._id);
                return {
                    _id: existingUnit ? existingUnit._id : new mongoose.Types.ObjectId(),
                    name: unit.name,
                    type: unit.type,
                    subunits: (unit.subunits || []).map((sub) => {
                        const existingSub = existingUnit?.subunits.find((es) => es._id?.toString() === sub._id);
                        return {
                            _id: existingSub ? existingSub._id : new mongoose.Types.ObjectId(),
                            name: sub.name
                        };
                    })
                };
            })
        };
    });

    const updatedCourse = await course.save();
    return updatedCourse;
};



const deleteCourse = async (courseId) => {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
        const error = new Error("Course not found!");
        error.code = 404;
        throw error;
    }
};

module.exports = {
    getAllCourses,
    addCourse,
    updateCourse,
    deleteCourse
};
