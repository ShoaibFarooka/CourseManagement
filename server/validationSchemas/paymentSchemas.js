const yup = require("yup");

const createPaymentSchema = yup.object().shape({
    user: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
        .required("User ID is required"),
    amount: yup
        .number()
        .min(0, "Amount must be greater than or equal to 0")
        .required("Amount is required"),
    startDate: yup
        .date()
        .required("Start date is required"),
    expireyDate: yup
        .date()
        .required("Expiry date is required"),
    comment: yup
        .string()
        .trim(),
    status: yup
        .string()
        .oneOf(["pending", "approved", "rejected"], "Invalid status value")
        .default("pending"),
});

const paymentIdSchema = yup.object().shape({
    paymentId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid payment ID format")
        .required("Payment ID is required"),
});

const userIdSchema = yup.object().shape({
    userId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
        .required("User ID is required"),
});

const updatePaymentSchema = yup.object().shape({
    amount: yup
        .number()
        .min(0, "Amount must be greater than or equal to 0")
        .optional(),
    startDate: yup
        .date()
        .optional(),
    expireyDate: yup
        .date()
        .optional(),
    comment: yup
        .string()
        .trim()
        .optional(),
    status: yup
        .string()
        .oneOf(["pending", "approved", "rejected"], "Invalid status value")
        .optional(),
});

module.exports = {
    createPaymentSchema,
    paymentIdSchema,
    userIdSchema,
    updatePaymentSchema,
};
