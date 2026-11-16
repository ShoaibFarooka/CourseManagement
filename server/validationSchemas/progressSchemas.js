const yup = require("yup");

const recordAnswerSchema = yup.object().shape({
    courseId: yup.string().required(),
    partId: yup.string().required(),
    publisherId: yup.string().required(),
    unitId: yup.string().required(),
    questionId: yup.string().required(),
    isCorrect: yup.boolean().required(),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
    answeredAt: yup.date().optional(),
});

const unitSessionSchema = yup.object().shape({
    courseId: yup.string().required(),
    partId: yup.string().required(),
    publisherId: yup.string().required(),

    selectedUnits: yup
        .array()
        .of(yup.string())
        .optional(),

    selectedSubunits: yup
        .object()
        .optional(),

    questionLimit: yup
        .number()
        .nullable()
        .optional(),

    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
});

const recordAnswerBatchSchema = yup.object().shape({
    answers: yup
        .array()
        .of(recordAnswerSchema)
        .min(1, "answers must contain at least one item")
        .required(),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
    sentAt: yup.date().optional(),
});

const getUnitPerformanceSchema = yup.object().shape({
    courseId: yup.string().required(),
    partId: yup.string().required(),
    publisherId: yup.string().required(),
    unitId: yup.string().required(),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
});



const objectIdString = yup.string().matches(/^[a-f\d]{24}$/i, "Invalid id");

const markQuestionSchema = yup.object().shape({
    questionId: objectIdString.required("questionId is required"),
    marked: yup.boolean().required("marked is required"),
});

const markedStatusSchema = yup.object().shape({
    questionIds: yup.array().of(objectIdString).max(500).required("questionIds is required"),
});

module.exports = {
    markQuestionSchema,
    markedStatusSchema,
    recordAnswerSchema,
    recordAnswerBatchSchema,
    unitSessionSchema,
    getUnitPerformanceSchema,
};