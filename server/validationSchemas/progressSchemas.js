const yup = require("yup");

const recordAnswerSchema = yup.object().shape({
    courseId: yup.string().trim().required("Course ID is required"),
    unitId: yup.string().trim().required("Unit ID is required"),
    questionId: yup.string().trim().required("Question ID is required"),
    isCorrect: yup.boolean().required("isCorrect is required"),
});

const unitSessionSchema = yup.object().shape({
    courseId: yup.string().trim().required("Course ID is required"),
    unitId: yup.string().trim().required("Unit ID is required"),
});

module.exports = {
    recordAnswerSchema,
    unitSessionSchema,
};