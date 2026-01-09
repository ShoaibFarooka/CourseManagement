const PaymentRequest = require("../models/paymentRequestModel");
const User = require("../models/userModel");

const createPaymentRequest = async (userId, courseId, partId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    const request = new PaymentRequest({
        user: userId,
        course: courseId,
        part: partId,
        status: "pending",
    });

    await request.save();
    return request;
};




const getAllPaymentRequests = async (page = 1, limit = 5, statusFilter = "all") => {
    const skip = (page - 1) * limit;

    const query = {};
    if (statusFilter !== "all") {
        query.status = statusFilter;
    }

    const totalCount = await PaymentRequest.countDocuments(query);

    const requests = await PaymentRequest.find(query)
        .populate("user", "name email isBlocked paymentStatus allowedDevices")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const mappedRequests = requests.map(req => {
        const obj = req.toObject();
        if (obj.user?.isBlocked) {
            obj.status = "blocked";
        }
        return obj;
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        requests: mappedRequests,
        currentPage: page,
        totalPages,
        totalCount
    };
};


const getPaymentRequestsByUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    return await PaymentRequest.find({ user: userId })
        .populate("course", "title")
        .sort({ createdAt: -1 });
};


const getPaymentRequestById = async (requestId) => {
    const request = await PaymentRequest.findById(requestId)
        .populate("user", "name email")
        .populate("course", "title");

    if (!request) {
        const error = new Error("Payment request not found");
        error.code = 404;
        throw error;
    }

    return request;
};


const updatePaymentRequestStatus = async (requestId, status) => {
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
        const error = new Error("Invalid status");
        error.code = 400;
        throw error;
    }

    const request = await PaymentRequest.findById(requestId);
    if (!request) {
        const error = new Error("Payment request not found");
        error.code = 404;
        throw error;
    }

    request.status = status;
    await request.save();

    return request;
};


const deletePaymentRequest = async (requestId) => {
    const request = await PaymentRequest.findByIdAndDelete(requestId);
    if (!request) {
        const error = new Error("Payment request not found");
        error.code = 404;
        throw error;
    }

    return request;
};


module.exports = {
    createPaymentRequest,
    getAllPaymentRequests,
    getPaymentRequestsByUser,
    getPaymentRequestById,
    updatePaymentRequestStatus,
    deletePaymentRequest,
};
