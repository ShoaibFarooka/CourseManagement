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
    return await Request.find()
        .populate("user", "name email");
};

const overwriteDeviceRequest = async (requestId, targetDeviceId) => {
    const request = await Request.findById(requestId).populate("user");
    if (!request) {
        const error = new Error("Request not found");
        error.code = 404;
        throw error;
    }

    const user = request.user;

    const deviceIndex = user.allowedDevices.findIndex(
        (d) => d.deviceId === targetDeviceId
    );

    if (deviceIndex === -1) {
        const error = new Error("Device not found in user's allowed devices");
        error.code = 404;
        throw error;
    }

    user.allowedDevices[deviceIndex] = {
        deviceId: request.deviceInfo.visitorId,
        userAgent: request.deviceInfo.userAgent,
        location: {
            country: request.deviceInfo.location.country,
            region: request.deviceInfo.location.region,
            city: request.deviceInfo.location.city,
        },
        addedAt: user.allowedDevices[deviceIndex].addedAt,
        lastUsedAt: new Date(),
    };

    await user.save();

    request.status = "approved";
    await request.save();

    return { user, request };
};



const blockUser = async (userId, block = true) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    user.isBlocked = block;
    await user.save();

    return user;
};

const getUserDevices = async (userId) => {
    const user = await User.findById(userId).select("allowedDevices name email");
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    return user.allowedDevices;
};


const removeUserDevice = async (userId, deviceId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    const deviceIndex = user.allowedDevices.findIndex((d) => d.deviceId === deviceId);

    if (deviceIndex === -1) {
        const error = new Error("Device not found in user's allowed devices");
        error.code = 404;
        throw error;
    }

    user.allowedDevices.splice(deviceIndex, 1);
    await user.save();

    return user;
};


module.exports = {
    requestDeviceAccess,
    approveDeviceRequest,
    rejectDeviceRequest,
    getAllRequests,
    overwriteDeviceRequest,
    blockUser,
    getUserDevices,
    removeUserDevice
};