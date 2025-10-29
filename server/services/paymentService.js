const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

const createPayment = async (userId, amount, startDate, expireyDate, comment = "") => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    const payment = new Payment({
        user: user._id,
        amount,
        startDate,
        expireyDate,
        comment,
        status: "pending"
    });

    await payment.save();
    return payment;
};


const getAllPayments = async () => {
    const payments = await Payment.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    return payments;
};


const getPaymentsByUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });
    return payments;
};


const updatePaymentStatus = async (paymentId, status) => {
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
        const error = new Error("Invalid payment status");
        error.code = 400;
        throw error;
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    payment.status = status;
    await payment.save();

    return payment;
};


const updatePayment = async (paymentId, data) => {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    Object.assign(payment, data);
    await payment.save();

    return payment;
};


const deletePayment = async (paymentId) => {
    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    return payment;
};


const getPaymentById = async (paymentId) => {
    const payment = await Payment.findById(paymentId).populate("user", "name email");
    if (!payment) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    return payment;
};


module.exports = {
    createPayment,
    getAllPayments,
    getPaymentsByUser,
    getPaymentById,
    updatePaymentStatus,
    updatePayment,
    deletePayment,
};
