const yup = require("yup");


const createPaymentRequestSchema = yup.object().shape({
    courseId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid course ID format")
        .required("courseId is required"),

    partId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid part ID format")
        .required("partId is required"),
});



const paymentRequestIdSchema = yup.object().shape({
    requestId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid payment request ID format")
        .required("Payment request ID is required"),
});



const userIdSchema = yup.object().shape({
    userId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
        .required("User ID is required"),
});


const updatePaymentRequestStatusSchema = yup.object().shape({
    status: yup
        .string()
        .oneOf(["pending", "approved", "rejected"], "Invalid status value")
        .required("status is required"),
});

module.exports = {
    createPaymentRequestSchema,
    paymentRequestIdSchema,
    userIdSchema,
    updatePaymentRequestStatusSchema,
};
