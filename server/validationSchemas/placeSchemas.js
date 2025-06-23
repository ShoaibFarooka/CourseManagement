const yup = require("yup");
const mongoose = require("mongoose");

const ObjectId = yup
    .string()
    .test("is-valid", "Invalid object id", (value) =>
        mongoose.Types.ObjectId.isValid(value)
    );

const addPlaceSchema = yup.object().shape({
    name: yup.string().trim().required("Name is required"),
    description: yup.string().trim().required("Description is required"),
    longitude: yup
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .required("Longitude is required"),
    latitude: yup
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .required("Latitude is required"),
    videoUrl: yup.string().url("Must be valid video URL").nullable().trim(),
});

const updatePlaceSchema = yup.object().shape({
    name: yup.string().trim().required("Name is required"),
    description: yup.string().trim().required("Description is required"),
    longitude: yup
        .number()
        // .strict()
        // .typeError("Longitude must be a number")
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .required("Longitude is required"),
    latitude: yup
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .required("Latitude is required"),
    videoUrl: yup.string().url("Must be valid video URL").nullable().trim(),

});

const placeIdSchema = yup.object().shape({
    placeId: ObjectId.required("Place id is required"),
});

module.exports = {
    addPlaceSchema,
    updatePlaceSchema,
    placeIdSchema
};
