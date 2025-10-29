const paymentService = require("../services/paymentService.js");

const CreatePayment = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { amount, startDate, expireyDate, comment } = req.body;

        if (!amount || !startDate || !expireyDate) {
            return res.status(400).json({ message: "amount, startDate, and expireyDate are required." });
        }

        const payment = await paymentService.createPayment(
            userId,
            amount,
            startDate,
            expireyDate,
            comment
        );

        res.status(201).json({
            message: "Payment created successfully.",
            payment,
        });
    } catch (error) {
        next(error);
    }
};


const GetAllPayments = async (req, res, next) => {
    try {
        const payments = await paymentService.getAllPayments();
        res.status(200).json({
            message: "Payments fetched successfully.",
            payments,
        });
    } catch (error) {
        next(error);
    }
};


const GetPaymentsByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "userId is required." });
        }

        const payments = await paymentService.getPaymentsByUser(userId);

        res.status(200).json({
            message: "User payments fetched successfully.",
            payments,
        });
    } catch (error) {
        next(error);
    }
};


const GetPaymentById = async (req, res, next) => {
    try {
        const { paymentId } = req.params;

        const payment = await paymentService.getPaymentById(paymentId);

        res.status(200).json({
            message: "Payment fetched successfully.",
            payment,
        });
    } catch (error) {
        next(error);
    }
};


const UpdatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "status is required." });
        }

        const updatedPayment = await paymentService.updatePaymentStatus(paymentId, status);

        res.status(200).json({
            message: `Payment ${status} successfully.`,
            payment: updatedPayment,
        });
    } catch (error) {
        next(error);
    }
};


const UpdatePayment = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const data = req.body;

        const updatedPayment = await paymentService.updatePayment(paymentId, data);

        res.status(200).json({
            message: "Payment updated successfully.",
            payment: updatedPayment,
        });
    } catch (error) {
        next(error);
    }
};


const DeletePayment = async (req, res, next) => {
    try {
        const { paymentId } = req.params;

        const deletedPayment = await paymentService.deletePayment(paymentId);

        res.status(200).json({
            message: "Payment deleted successfully.",
            payment: deletedPayment,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    CreatePayment,
    GetAllPayments,
    GetPaymentsByUser,
    GetPaymentById,
    UpdatePaymentStatus,
    UpdatePayment,
    DeletePayment,
};
