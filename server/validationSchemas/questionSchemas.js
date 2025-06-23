const yup = require("yup");
const mongoose = require("mongoose");

const ObjectId = yup
    .string()
    .test("is-valid", "Invalid object id", (value) =>
        mongoose.Types.ObjectId.isValid(value)
    );

const optionsSchema = yup.object().shape({
    A: yup.string().trim().required("Option A is required"),
    B: yup.string().trim().required("Option B is required"),
    C: yup.string().trim().required("Option C is required"),
    D: yup.string().trim().required("Option D is required"),
});

const addQuestionSchema = yup.object().shape({
    questionText: yup.string().trim().required("Question text is required"),
    options: optionsSchema.required("Options data is required"),
    correctOption: yup.string().oneOf(['A', 'B', 'C', 'D'], 'Invalid correct option').required("Correct Option is required"),
});

const updateQuestionSchema = yup.object().shape({
    questionText: yup.string().trim().required("Question text is required"),
    options: optionsSchema.required("Options data is required"),
    correctOption: yup.string().oneOf(['A', 'B', 'C', 'D'], 'Invalid correct option').required("Correct Option is required"),
});

const questionIdSchema = yup.object().shape({
    questionId: ObjectId.required("Question id is required"),
});

const quizAndQuestionIdSchema = yup.object().shape({
    quizId: ObjectId.required("Quiz id is required"),
    questionId: ObjectId.required("Question id is required"),
});

module.exports = {
    addQuestionSchema,
    updateQuestionSchema,
    questionIdSchema,
    quizAndQuestionIdSchema
};
