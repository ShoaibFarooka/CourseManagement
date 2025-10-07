const yup = require("yup");

const deviceRequestSchema = yup.object().shape({
    visitorId: yup.string().trim().required("Visitor ID is required"),
    userAgent: yup.string().trim().required("User Agent is required"),
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