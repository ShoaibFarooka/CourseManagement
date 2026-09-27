const PaymentRequest = require("../models/paymentRequestModel");
const User = require("../models/userModel");
const payment = require("../models/paymentModel");

const createPaymentRequest = async (userId, courseId, partId) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found.");
        error.code = 404;
        throw error;
    }

    // Pending is checked on its own, and first. Querying pending+approved together let
    // findOne return an older approved request while a pending one also existed — the
    // approved branch then fell through and created another pending request on every
    // click. Two separate queries make the pending block unconditional.
    const pendingRequest = await PaymentRequest.findOne({
        user: userId,
        course: courseId,
        part: partId,
        status: "pending",
    });

    if (pendingRequest) {
        const error = new Error(
            "You already have a pending payment request for this course and part."
        );
        error.code = 409;
        throw error;
    }

    const approvedRequest = await PaymentRequest.findOne({
        user: userId,
        course: courseId,
        part: partId,
        status: "approved",
    }).sort({ createdAt: -1 });

    if (approvedRequest) {
        const existpayment = await payment.findOne({
            paymentRequest: approvedRequest._id,
            user: userId,
            course: courseId,
            part: partId,
        }).sort({ createdAt: -1 });

        if (existpayment && new Date(existpayment.expiryDate) > new Date()) {
            const error = new Error(
                "Your request has been approved, please refresh the page."
            );
            error.code = 409;
            throw error;
        }
    }

    try {
        return await PaymentRequest.create({
            user: userId,
            course: courseId,
            part: partId,
            status: "pending",
        });
    } catch (err) {
        // The partial unique index rejected a concurrent duplicate. Translate it into the
        // same 409 the check above throws — note this MUST be remapped, since the
        // controller passes error.code straight to res.status() and Mongo's 11000 is not
        // a valid HTTP status.
        if (err.code === 11000) {
            const error = new Error(
                "You already have a pending payment request for this course and part."
            );
            error.code = 409;
            throw error;
        }

        throw err;
    }
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

const updatePayment = async (paymentId, { amount, startDate, expiryDate, comment }) => {
    const paymentDoc = await payment.findById(paymentId);

    if (!paymentDoc) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    if (paymentDoc.isCancelled) {
        const error = new Error("Cannot update a cancelled payment");
        error.code = 400;
        throw error;
    }

    paymentDoc.amount = amount;
    paymentDoc.startDate = startDate;
    paymentDoc.expiryDate = expiryDate;
    paymentDoc.comment = comment ?? paymentDoc.comment;

    await paymentDoc.save();

    return paymentDoc;
};

const cancelPayment = async (paymentId) => {
    const paymentDoc = await payment.findById(paymentId);

    if (!paymentDoc) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    paymentDoc.isCancelled = true;
    paymentDoc.cancelledAt = new Date();

    await paymentDoc.save();

    return paymentDoc;
};

const uncancelPayment = async (paymentId) => {
    const paymentDoc = await payment.findById(paymentId);

    if (!paymentDoc) {
        const error = new Error("Payment not found");
        error.code = 404;
        throw error;
    }

    paymentDoc.isCancelled = false;
    paymentDoc.cancelledAt = null;

    await paymentDoc.save();

    return paymentDoc;
};


module.exports = {
    createPaymentRequest,
    getAllPaymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    getUserPayments,
    getPaymentDetails,
    updatePayment,
    cancelPayment,
    uncancelPayment
};
