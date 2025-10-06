const User = require("../models/userModel");
const Request = require("../models/requestModel");

const requestDeviceAccess = async (userId, visitorId, userAgent, location) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    // check if device already exists in allowedDevices
    const deviceExists = user.allowedDevices.some(
        (d) => d.deviceId === visitorId
    );

    if (deviceExists) {
        return { alreadyAllowed: true };
    }

    // create request
    const request = new Request({
        user: user._id,
        deviceInfo: {
            visitorId,
            userAgent,
            location
        },
        isNewUser: false,
    });

    await request.save();

    return { alreadyAllowed: false, request };
};

const approveDeviceRequest = async (requestId) => {
    const request = await Request.findById(requestId).populate("user");
    if (!request) {
        const error = new Error("Request not found");
        error.code = 404;
        throw error;
    }

    const user = request.user;

    // Add device to allowedDevices
    user.allowedDevices.push({
        deviceId: request.deviceInfo.visitorId,
        userAgent: request.deviceInfo.userAgent,
        country: request.deviceInfo.location.country,
        region: request.deviceInfo.location.region,
        city: request.deviceInfo.location.city,
    });

    await user.save();

    request.status = "approved";
    await request.save();

    return { user, request };
};

const rejectDeviceRequest = async (requestId) => {
    const request = await Request.findById(requestId);
    if (!request) {
        const error = new Error("Request not found");
        error.code = 404;
        throw error;
    }

    request.status = "rejected";
    await request.save();

    return { request };
};

const getAllRequests = async () => {
    const requests = await Request.find().populate("user");
    return requests;
};

module.exports = {
    requestDeviceAccess,
    approveDeviceRequest,
    rejectDeviceRequest,
    getAllRequests
}