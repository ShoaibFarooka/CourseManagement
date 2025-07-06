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

const updateCourse = async (courseId, data) => {
    const { name, publishers, parts, timeRatio } = data;

    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found!");
        error.code = 404;
        throw error;
    }

    course.name = name;
    course.timeRatio = timeRatio;
    course.publishers = publishers || [];
    course.parts = parts;

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
