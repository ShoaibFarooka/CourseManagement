const yup = require("yup");
const mongoose = require("mongoose");

const ObjectId = yup
    .string()
    .test("is-valid", "Invalid object id", (value) =>
        mongoose.Types.ObjectId.isValid(value)
    );

const addQuizSchema = yup.object().shape({
    title: yup.string().trim().required("Title is required"),
    time: yup.number().required("Time is required"),
    passingMarks: yup.number().required("Passing Marks is required"),
});

const updateQuizSchema = yup.object().shape({
    title: yup.string().trim().required("Title is required"),
    time: yup.number().required("Time is required"),
    passingMarks: yup.number().required("Passing Marks is required"),
});

const quizIdSchema = yup.object().shape({
    quizId: ObjectId.required("Quiz id is required"),
});

const placeAndQuizIdSchema = yup.object().shape({
    placeId: ObjectId.required("Place id is required"),
    quizId: ObjectId.required("Quiz id is required"),
});

module.exports = {
    addQuizSchema,
    updateQuizSchema,
    quizIdSchema,
    placeAndQuizIdSchema
};
