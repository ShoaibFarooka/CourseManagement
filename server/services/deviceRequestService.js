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


const getAllDevicesRequests = async (
    page,
    limit,
    filter,
    search = ""
) => {
    const query = {};

    if (filter !== "all" && filter !== "blocked") {
        query.status = filter;
    }

    let requests = await Request.find(query)
        .populate("user", "name email isBlocked")
        .sort({ createdAt: -1 });

    if (filter === "blocked") {
        requests = requests.filter(req => req.user?.isBlocked);
    }

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

    const userIds = paginatedRequests
        .map(req => req.user?._id)
        .filter(Boolean);

    const devices = await UserAllowedDevice.find({
        user: { $in: userIds }
    }).lean();

    const userDevicesMap = {};

    devices.forEach(d => {
        userDevicesMap[d.user.toString()] =
            d.allowedDevices || [];
    });

    const mappedRequests = paginatedRequests.map(req => {
        const reqObj = req.toObject();
        const userIdStr = reqObj.user?._id?.toString();

        reqObj.user.allowedDevices =
            userDevicesMap[userIdStr] || [];

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