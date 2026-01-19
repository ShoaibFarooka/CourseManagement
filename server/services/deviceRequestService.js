const User = require("../models/userModel");
const Request = require("../models/deviceVerificationRequestModel");
const UserAllowedDevice = require("../models/userAllowedDeviceModel");


const requestDeviceAccess = async (userId, visitorId, userAgent, location) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    const userDevices = await UserAllowedDevice.findOne({ user: userId });

    if (userDevices?.allowedDevices.some(d => d.deviceId === visitorId)) {
        return { alreadyAllowed: true };
    }

    const existingRequest = await Request.findOne({
        user: userId,
        "deviceInfo.visitorId": visitorId,
        status: "pending"
    });

    if (existingRequest) {
        return {
            alreadyRequested: true,
            requestId: existingRequest._id
        };
    }

    const isNewUser = !userDevices || userDevices.allowedDevices.length === 0;

    const request = new Request({
        user: userId,
        deviceInfo: { visitorId, userAgent, location },
        isNewUser,
        status: "pending"
    });

    await request.save();

    return {
        alreadyAllowed: false,
        alreadyRequested: false,
        request
    };
};



const approveDeviceRequest = async (requestId) => {
    const request = await Request.findById(requestId).populate("user");
    if (!request) {
        const error = new Error("Request not found");
        error.code = 404;
        throw error;
    }

    let userDevices = await UserAllowedDevice.findOne({ user: request.user._id });

    if (!userDevices) {
        userDevices = new UserAllowedDevice({
            user: request.user._id,
            allowedDevices: []
        });
    }

    userDevices.allowedDevices.push({
        deviceId: request.deviceInfo.visitorId,
        userAgent: request.deviceInfo.userAgent,
        location: request.deviceInfo.location
    });

    await userDevices.save();

    request.status = "approved";
    await request.save();

    return { request };
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


const getAllDevicesRequests = async (page, limit, filter) => {
    const skip = (page - 1) * limit;

    const query = {};

    if (filter === "blocked") {
        query["user.isBlocked"] = true;
    } else if (filter !== "all") {
        query.status = filter;
    }

    const [requests, totalCount] = await Promise.all([
        Request.find(query)
            .populate("user", "name email isBlocked allowedDevices")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),

        Request.countDocuments(query)
    ]);

    const mappedRequests = requests.map(req => {
        const reqObj = req.toObject();
        if (reqObj.user?.isBlocked) {
            reqObj.status = "blocked";
        }
        return reqObj;
    });

    return {
        requests: mappedRequests,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
    };
};


const overwriteDeviceRequest = async (requestId, targetDeviceId) => {
    const request = await Request.findById(requestId).populate("user");
    if (!request) {
        const error = new Error("Request not found");
        error.code = 404;
        throw error;
    }

    const userDevices = await UserAllowedDevice.findOne({ user: request.user._id });
    if (!userDevices) {
        const error = new Error("No devices found for user");
        error.code = 404;
        throw error;
    }

    const deviceIndex = userDevices.allowedDevices.findIndex(
        d => String(d.deviceId) === String(targetDeviceId)
    );

    if (deviceIndex === -1) {
        console.log("Allowed devices:", userDevices.allowedDevices);
        console.log("Target deviceId:", targetDeviceId);
        const error = new Error("Device not found");
        error.code = 404;
        throw error;
    }

    userDevices.allowedDevices[deviceIndex] = {
        deviceId: request.deviceInfo.visitorId,
        userAgent: request.deviceInfo.userAgent,
        location: request.deviceInfo.location
    };

    await userDevices.save();

    request.status = "approved";
    await request.save();

    return { request };
};





const blockUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    user.isBlocked = true;
    await user.save();

    return user;
};

const unblockUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.code = 404;
        throw error;
    }

    user.isBlocked = false;
    await user.save();

    return user;
};

// for user side aysnc thunk api call
const getUserDevices = async (userId) => {
    const devices = await UserAllowedDevice.findOne({ user: userId })
        .populate("user", "name email");

    if (!devices) return [];

    return devices.allowedDevices;
};

//for admin request page to get particular user allowed devices
const fetchUserDevicesById = async (userId) => {
    const devices = await UserAllowedDevice.findOne({ user: userId })
        .populate("user", "name email");

    if (!devices) return [];

    return devices.allowedDevices;
};


const removeUserDevice = async (userId, deviceId) => {
    const userDevices = await UserAllowedDevice.findOne({ user: userId });
    if (!userDevices) {
        const error = new Error("User devices not found");
        error.code = 404;
        throw error;
    }

    const index = userDevices.allowedDevices.findIndex(
        d => d.deviceId === deviceId
    );

    if (index === -1) {
        const error = new Error("Device not found");
        error.code = 404;
        throw error;
    }

    userDevices.allowedDevices.splice(index, 1);
    await userDevices.save();

    await Request.updateMany(
        { "deviceInfo.visitorId": deviceId, user: userId },
        { $set: { status: "revoked" } }
    );

    return userDevices;
};

const deleteRequest = async (requestId) => {
    const request = await Request.findByIdAndDelete(requestId);
    if (!request) {
        const error = new Error("Request not found");
        error.code = 404;
        throw error;
    }
    return request;
};



module.exports = {
    requestDeviceAccess,
    approveDeviceRequest,
    rejectDeviceRequest,
    getAllDevicesRequests,
    overwriteDeviceRequest,
    blockUser,
    unblockUser,
    getUserDevices,
    removeUserDevice,
    deleteRequest,
    fetchUserDevicesById,
};