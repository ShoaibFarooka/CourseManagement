const yup = require("yup");

const recordAnswerSchema = yup.object().shape({
    courseId: yup.string().required(),
    partId: yup.string().required(),
    publisherId: yup.string().required(),
    unitId: yup.string().required(),
    questionId: yup.string().required(),
    isCorrect: yup.boolean().required(),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
});

const unitSessionSchema = yup.object().shape({
    courseId: yup.string().required(),
    partId: yup.string().required(),
    publisherId: yup.string().required(),
    unitId: yup.string().required(),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
});

const recordAnswerBatchSchema = yup.object().shape({
    answers: yup
        .array()
        .of(recordAnswerSchema)
        .min(1, "answers must contain at least one item")
        .required(),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
});

const getUnitPerformanceSchema = yup.object().shape({
    courseId: yup.string().required(),
    partId: yup.string().required(),
    publisherId: yup.string().required(),
    unitId: yup.string().required(),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
});

module.exports = {
    recordAnswerSchema,
    recordAnswerBatchSchema,
    unitSessionSchema,
    getUnitPerformanceSchema,
};