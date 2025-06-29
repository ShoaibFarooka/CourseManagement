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
    const { name, publishers, parts } = data;
    const course = await Course.create({
        name: name?.trim(),
        publishers: publishers?.map(p => ({ name: p.name?.trim() })) || [],
        parts: parts?.map(part => ({
            name: part.name?.trim(),
            units: part.units?.map(unit => ({
                name: unit.name?.trim(),
                type: unit.type?.trim(),
                subunits: unit.subunits?.map(sub => ({
                    name: sub.name?.trim()
                }))
            }))
        }))
    });
    return course;
};


const updateCourse = async (courseId, data) => {
    try {
        const { name, publishers, parts } = data;

        if (!name || !Array.isArray(publishers) || !Array.isArray(parts)) {
            const error = new Error("Invalid input data");
            error.code = 400;
            throw error;
        }

        const course = await Course.findById(courseId);
        if (!course) {
            const error = new Error("Course not found!");
            error.code = 404;
            throw error;
        }

        course.name = name?.trim();
        course.publishers = publishers.map(p => ({
            name: p.name?.trim()
        }));

        course.parts = parts.map(part => ({
            name: part.name?.trim(),
            units: part.units.map(unit => ({
                name: unit.name?.trim(),
                type: unit.type?.trim(),
                subunits: unit.subunits.map(sub => ({
                    name: sub.name?.trim()
                }))
            }))
        }));

        const updatedCourse = await course.save();
        return updatedCourse;

    } catch (err) {
        console.error("Update course error:", err.message);
        throw err;
    }
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