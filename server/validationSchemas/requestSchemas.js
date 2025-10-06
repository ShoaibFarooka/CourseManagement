const yup = require("yup");

const deviceRequestSchema = yup.object().shape({
    visitorId: yup.string().trim().required("Visitor ID is required"),
    userAgent: yup.string().trim().required("User Agent is required"),
    location: yup.object().shape({
        country: yup.string().trim().required("Country is required"),
        region: yup.string().trim().required("Region is required"),
        city: yup.string().trim().required("City is required"),
    }),
});

const deviceRequestActionSchema = yup.object().shape({
    requestId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid requestId format")
        .required("Request ID is required"),
});

module.exports = {
    deviceRequestSchema,
    deviceRequestActionSchema
}