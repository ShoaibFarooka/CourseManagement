const yup = require("yup");

const objectId = (label) =>
    yup.string().matches(/^[a-f\d]{24}$/i, `Invalid ${label}`).required(`${label} is required`);

const planSelectionShape = {
    courseId: objectId("courseId"),
    partId: objectId("partId"),
    publisherId: objectId("publisherId"),
    language: yup.string().oneOf(["eng", "ar", "fr"]).optional(),
};

const planSelectionSchema = yup.object().shape(planSelectionShape);

const createPlanSchema = yup.object().shape({
    ...planSelectionShape,
    duration: yup
        .number()
        .oneOf([15, 30, 45, 60], "Duration must be 15, 30, 45 or 60 days")
        .required("duration is required"),
});

const planDaySchema = yup.object().shape({
    ...planSelectionShape,
    dayNumber: yup.number().integer().min(1).required("dayNumber is required"),
});

const recordDayProgressSchema = yup.object().shape({
    ...planSelectionShape,
    dayNumber: yup.number().integer().min(1).required("dayNumber is required"),
    questionIds: yup
        .array()
        .of(yup.string().matches(/^[a-f\d]{24}$/i, "Invalid questionId"))
        .min(1, "questionIds must contain at least one item")
        .required("questionIds is required"),
});

module.exports = {
    planSelectionSchema,
    createPlanSchema,
    planDaySchema,
    recordDayProgressSchema,
};
