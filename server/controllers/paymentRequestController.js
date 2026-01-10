const paymentRequestService = require("../services/paymentRequestService");

const PaymentRequest = require('../models/paymentRequestModel');

const CreatePaymentRequest = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { courseId, partId } = req.body;

        if (!courseId || !partId) {
            return res.status(400).json({
                message: "courseId and partId are required.",
            });
        }

        const existingRequest = await PaymentRequest.findOne({
            user: userId,
            course: courseId,
            part: partId,
            status: { $in: ["pending", "rejected"] }
        });

        if (existingRequest) {
            return res.status(409).json({
                message: "You already have a pending or rejected request for this course and part."
            });
        }

        const request = await paymentRequestService.createPaymentRequest(
            userId,
            courseId,
            partId
        );

        res.status(201).json({
            message: "Payment request created successfully.",
            request,
        });
    } catch (error) {
        next(error);
    }
};


const GetAllPaymentRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 5, status = "all" } = req.query;

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit, 10) || 5;

        const response = await paymentRequestService.getAllPaymentRequests(
            parsedPage,
            parsedLimit,
            status
        );

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const GetPaymentRequestsByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "userId is required." });
        }

        const requests = await paymentRequestService.getPaymentRequestsByUser(userId);

        res.status(200).json({
            message: "User payment requests fetched successfully.",
            requests,
        });
    } catch (error) {
        next(error);
    }
};


const GetPaymentRequestById = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        const request = await paymentRequestService.getPaymentRequestById(requestId);

        res.status(200).json({
            message: "Payment request fetched successfully.",
            request,
        });
    } catch (error) {
        next(error);
    }
};


const ApprovePaymentRequest = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { requestId, courseId, partId } = req.params;
        const { status, amount, startDate, expiryDate, comment } = req.body;

        if (!status) {
            return res.status(400).json({ message: "status is required." });
        }

        const updatedRequest = await paymentRequestService.approvePaymentRequest(
            requestId,
            userId,
            courseId,
            partId,
            amount,
            startDate,
            expiryDate,
            comment,
            status
        );

        res.status(200).json({
            message: `Payment request ${status} successfully.`,
            request: updatedRequest,
        });
    } catch (error) {
        next(error);
    }
};


const RejectPaymentRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "status is required." });
        }

        const updatedRequest = await paymentRequestService.rejectPaymentRequest(
            requestId,
            status
        );

        res.status(200).json({
            message: `Payment request ${status} successfully.`,
            request: updatedRequest,
        });
    } catch (error) {
        next(error);
    }
};



const DeletePaymentRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        const deletedRequest =
            await paymentRequestService.deletePaymentRequest(requestId);

        res.status(200).json({
            message: "Payment request deleted successfully.",
            request: deletedRequest,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    CreatePaymentRequest,
    GetAllPaymentRequests,
    GetPaymentRequestsByUser,
    GetPaymentRequestById,
    ApprovePaymentRequest,
    RejectPaymentRequest,
    DeletePaymentRequest,
};
