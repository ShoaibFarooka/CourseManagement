const yup = require("yup");
const mongoose = require("mongoose");

const ObjectId = yup
    .string()
    .test("is-valid", "Invalid object id", (value) =>
        mongoose.Types.ObjectId.isValid(value)
    );

const subunitSchema = yup.object().shape({
    name: yup.string().trim().required("Subunit name is required"),
});

const unitSchema = yup.object().shape({
    name: yup.string().trim().required("Unit name is required"),
    type: yup
        .string()
        .oneOf(["rapid", "mcq", "essay"], "Invalid unit type")
        .required("Unit type is required"),
    subunits: yup
        .array()
        .of(subunitSchema)
        .min(1, "At least one subunit is required")
        .required("Subunits are required"),
});

const partSchema = yup.object().shape({
    name: yup.string().trim().required("Part name is required"),
    units: yup
        .array()
        .of(unitSchema)
        .min(1, "At least one unit is required")
        .required("Units are required"),
});

const publisherSchema = yup.object().shape({
    name: yup.string().trim().required("Publisher name is required"),
});

const addCourseSchema = yup.object().shape({
    name: yup.string().trim().required("Course name is required"),
    publishers: yup
        .array()
        .of(publisherSchema)
        .min(1, "At least one publisher is required")
        .required("Publishers are required"),
    parts: yup
        .array()
        .of(partSchema)
        .min(1, "At least one part is required")
        .required("Parts are required"),
});

const updateCourseSchema = yup.object().shape({
    name: yup.string().trim().required("Course name is required"),
    publishers: yup
        .array()
        .of(publisherSchema)
        .min(1, "At least one publisher is required")
        .required("Publishers are required"),
    parts: yup
        .array()
        .of(partSchema)
        .min(1, "At least one part is required")
        .required("Parts are required"),
});

const courseIdSchema = yup.object().shape({
    courseId: ObjectId.required("Course ID is required"),
});

module.exports = {
    addCourseSchema,
    updateCourseSchema,
    courseIdSchema,
};
