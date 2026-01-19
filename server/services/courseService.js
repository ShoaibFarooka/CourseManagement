const Course = require("../models/courseModel");
const mongoose = require("mongoose");

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
    const { name, parts, timeRatio } = data;

    const course = await Course.create({
        name,
        timeRatio,
        parts
    });

    return course;
};


const updateCourse = async (courseId, data) => {
    const { name, timeRatio, parts = [] } = data;

    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found!");
        error.code = 404;
        throw error;
    }

    course.name = name;
    course.timeRatio = timeRatio;

    course.parts = parts.map((part) => {
        const existingPart = course.parts.find(
            (ep) => ep._id?.toString() === part._id
        );

        return {
            _id: existingPart ? existingPart._id : new mongoose.Types.ObjectId(),
            name: part.name,
            publishers: (part.publishers || []).map((publisher) => {
                const existingPublisher = existingPart?.publishers.find(
                    (epub) => epub._id?.toString() === publisher._id
                );

                return {
                    _id: existingPublisher
                        ? existingPublisher._id
                        : new mongoose.Types.ObjectId(),
                    name: publisher.name,
                    units: (publisher.units || []).map((unit) => {
                        const existingUnit = existingPublisher?.units.find(
                            (eu) => eu._id?.toString() === unit._id
                        );

                        return {
                            _id: existingUnit
                                ? existingUnit._id
                                : new mongoose.Types.ObjectId(),
                            name: unit.name,
                            type: unit.type,
                            subunits: (unit.subunits || []).map((sub) => {
                                const existingSub = existingUnit?.subunits.find(
                                    (es) => es._id?.toString() === sub._id
                                );

                                return {
                                    _id: existingSub
                                        ? existingSub._id
                                        : new mongoose.Types.ObjectId(),
                                    name: sub.name,
                                };
                            }),
                        };
                    }),
                };
            }),
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

const fetchAllCoursesWithParts = async () => {
    return await Course.aggregate([
        { $unwind: "$parts" },
        {
            $project: {
                _id: 0,
                courseId: "$_id",
                courseName: "$name",
                partId: "$parts._id",
                partName: "$parts.name",
                publishers: {
                    $map: {
                        input: "$parts.publishers",
                        as: "publisher",
                        in: {
                            _id: "$$publisher._id",
                            name: "$$publisher.name"
                        }
                    }
                }
            }
        }
    ]);
};


const fetchAllUnitsWithSubunits = async (courseId, partId, publisherId) => {
    return await Course.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(courseId)
            }
        },
        {
            $unwind: "$parts"
        },
        {
            $match: {
                "parts._id": new mongoose.Types.ObjectId(partId)
            }
        },
        {
            $unwind: "$parts.publishers"
        },
        {
            $match: {
                "parts.publishers._id": new mongoose.Types.ObjectId(publisherId)
            }
        },
        {
            $unwind: "$parts.publishers.units"
        },
        {
            $project: {
                _id: 0,
                unitId: "$parts.publishers.units._id",
                unitName: "$parts.publishers.units.name",
                subunits: {
                    $map: {
                        input: "$parts.publishers.units.subunits",
                        as: "sub",
                        in: {
                            _id: "$$sub._id",
                            name: "$$sub.name"
                        }
                    }
                }
            }
        }
    ]);
};


module.exports = {
    getAllCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    fetchAllCoursesWithParts,
    fetchAllUnitsWithSubunits,
};
