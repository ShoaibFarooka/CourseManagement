const paymentRequestService = require("../services/paymentRequestService");

const CreatePaymentRequest = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { courseId, partId } = req.body;

        if (!courseId || !partId) {
            return res.status(400).json({
                message: "courseId and partId are required.",
            });
        }

        const request = await paymentRequestService.createPaymentRequest(
            userId,
            courseId,
            partId
        );

        return res.status(201).json({
            message: "Payment request created successfully.",
            request,
        });
    } catch (error) {
        if (error.code) {
            return res.status(error.code).json({
                message: error.message,
            });
        }

        next(error);
    }
};

const GetAllPaymentRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 5, status = "all", search = "" } = req.query;

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit, 10) || 5;

        const response = await paymentRequestService.getAllPaymentRequests(
            parsedPage,
            parsedLimit,
            status,
            search
        );

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const ApprovePaymentRequest = async (req, res, next) => {
    try {
        const { requestId, userId, courseId, partId } = req.params;
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


const GetUserPayments = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ message: "userId is required." });
        }

        const requests = await paymentRequestService.getUserPayments(userId);

        res.status(200).json({
            message: "User payment requests fetched successfully.",
            requests,
        });
    } catch (error) {
        next(error);
    }
};


const GetPaymentDetails = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        const request = await paymentRequestService.getPaymentDetails(requestId);

        res.status(200).json({
            message: "Payment Details fetched successfully.",
            request,
        });
    } catch (error) {
        next(error);
    }
};

const updatePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, startDate, expiryDate, comment } = req.body;

        const payment = await paymentRequestService.updatePayment(id, {
            amount,
            startDate,
            expiryDate,
            comment,
        });

        res.status(200).json({
            message: "Payment updated successfully",
            payment,
        });
    } catch (error) {
        next(error);
    }
};

const cancelPayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await paymentRequestService.cancelPayment(id);

        res.status(200).json({
            message: "Payment cancelled successfully",
            payment,
        });
    } catch (error) {
        next(error);
    }
};

const uncancelPayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await paymentRequestService.uncancelPayment(id);

        res.status(200).json({
            message: "Payment reinstated successfully",
            payment,
        });
    } catch (error) {
        next(error);
    }
};



module.exports = {
    CreatePaymentRequest,
    GetAllPaymentRequests,
    ApprovePaymentRequest,
    RejectPaymentRequest,
    GetUserPayments,
    GetPaymentDetails,
    updatePayment,
    cancelPayment,
    uncancelPayment
};
