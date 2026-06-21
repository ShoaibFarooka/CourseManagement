const PaymentRequest = require("../models/paymentRequestModel");
const User = require("../models/userModel");
const payment = require("../models/paymentModel");

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




const getAllPaymentRequests = async (
    page = 1,
    limit = 5,
    statusFilter = "all",
    search = ""
) => {
    const query = {};

    if (statusFilter !== "all") {
        query.status = statusFilter;
    }

    let requests = await PaymentRequest.find(query)
        .populate("user", "name email isBlocked paymentStatus allowedDevices")
        .populate("course", "name parts")
        .sort({ createdAt: -1 });

    if (search.trim()) {
        const searchText = search.toLowerCase().trim();

        requests = requests.filter(req => {
            const name = req.user?.name?.toLowerCase() || "";
            const email = req.user?.email?.toLowerCase() || "";

            return (
                name.includes(searchText) ||
                email.includes(searchText)
            );
        });
    }

    const totalCount = requests.length;

    const paginatedRequests = requests.slice(
        (page - 1) * limit,
        page * limit
    );

    const mappedRequests = paginatedRequests.map(req => {
        const obj = req.toObject();

        if (obj.user?.isBlocked) {
            obj.status = "blocked";
        }

        return obj;
    });

    return {
        requests: mappedRequests,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
    };
};

const approvePaymentRequest = async (requestId, userId, courseId, partId, amount, startDate, expiryDate, comment, status) => {

    const request = await PaymentRequest.findById(requestId);
    if (!request) {
        const error = new Error("Payment request not found");
        error.code = 404;
        throw error;
    }


    const newPayment = new payment({
        paymentRequest: requestId,
        user: userId,
        course: courseId,
        part: partId,
        amount,
        startDate,
        expiryDate,
        comment
    })



    request.status = status;
    await request.save();
    await newPayment.save();

    return request;
};


const rejectPaymentRequest = async (requestId, status) => {

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
    const request = await PaymentRequest.findById(requestId);
    if (!request) {
        const error = new Error("Payment request not found");
        error.code = 404;
        throw error;
    }

    await payment.findOneAndDelete({ paymentRequest: request._id });

    await PaymentRequest.findByIdAndDelete(requestId);

    return { message: "Payment request and related payments deleted successfully" };
};


const getUserPayments = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    return await payment.find({ user: userId })
        .populate("course", "name")
        .sort({ createdAt: -1 });
};


const getPaymentDetails = async (requestId) => {
    const request = await payment.findOne({
        paymentRequest: requestId
    })

    if (!request) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    return request;
};



module.exports = {
    createPaymentRequest,
    getAllPaymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    deletePaymentRequest,
    getUserPayments,
    getPaymentDetails,
};
