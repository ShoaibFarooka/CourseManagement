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



const requestIdSchema = yup.object().shape({
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


const validateparamsIdSchema = yup.object().shape({
    requestId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid payment request ID format")
        .required("Payment request ID is required"),

    userId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
        .required("User ID is required"),

    courseId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid course ID format")
        .required("courseId is required"),

    partId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid part ID format")
        .required("partId is required"),
});

const today = new Date();
today.setHours(0, 0, 0, 0);

const approvePaymentRequestSchema = yup.object().shape({
    status: yup
        .string()
        .oneOf(["pending", "approved", "rejected"], "Invalid status value")
        .required("status is required"),

    amount: yup
        .number()
        .typeError("Amount must be a number")
        .moreThan(0, "Amount must be greater than zero")
        .required("Amount is required"),

    startDate: yup
        .date()
        .typeError("Start date must be a valid date")
        .min(today, "Start date cannot be in the past")
        .required("Start date is required"),

    expiryDate: yup
        .date()
        .typeError("Expiry date must be a valid date")
        .min(
            yup.ref("startDate"),
            "Expiry date cannot be before start date"
        )
        .required("Expiry date is required"),

    comment: yup
        .string()
        .trim()
        .optional(),
});


const rejectPaymentRequestSchema = yup.object().shape({
    status: yup
        .string()
        .oneOf(["pending", "approved", "rejected"], "Invalid status value")
        .required("status is required"),
});


module.exports = {
    createPaymentRequestSchema,
    requestIdSchema,
    userIdSchema,
    approvePaymentRequestSchema,
    rejectPaymentRequestSchema,
    validateparamsIdSchema,
};
