const courseService = require("../services/courseService");

const GetAllCourses = async (req, res, next) => {
    try {
        const courses = await courseService.getAllCourses();
        res.status(200).json({ courses });
    } catch (error) {
        next(error);
    }
};

const AddCourse = async (req, res, next) => {
    try {
        const { name, timeRatio, publishers, parts } = req.body;
        const data = { name, timeRatio, publishers, parts };

        await courseService.addCourse(data);
        res.status(201).json({ message: "Course added successfully" });
    } catch (error) {
        next(error);
    }
};

const UpdateCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { name, timeRatio, publishers, parts } = req.body;
        const data = { name, timeRatio, publishers, parts };

        await courseService.updateCourse(courseId, data);
        res.status(200).json({ message: "Course updated successfully" });
    } catch (error) {
        next(error);
    }
};

const DeleteCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        await courseService.deleteCourse(courseId);
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllCourses,
    AddCourse,
    UpdateCourse,
    DeleteCourse
};
