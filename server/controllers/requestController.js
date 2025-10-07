const { getCountryFromIP } = require("../utils/deviceInfoUtils");
const requestService = require("../services/requestService.js");

const RequestDeviceAccess = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { visitorId, userAgent } = req.body;

        if (!visitorId || !userAgent) {
            return res.status(400).json({ message: "visitorId and userAgent are required." });
        }

        let ip = req.headers["x-forwarded-for"];
        if (ip) {
            ip = ip.split(",")[0].trim();
        } else {
            ip = req.socket.remoteAddress;
        }

        const geo = await getCountryFromIP(ip) || {};
        const location = {
            country: geo.country || "Unknown",
            region: geo.region || "Unknown",
            city: geo.city || "Unknown",
        };

        const result = await requestService.requestDeviceAccess(userId, visitorId, userAgent, location);

        if (result.alreadyAllowed) {
            return res.status(200).json({ message: "Device already allowed." });
        }

        res.status(201).json({
            message: "Device access request sent. Waiting for admin approval.",
            requestId: result.request._id,
        });
    } catch (error) {
        console.error("RequestDeviceAccess Error:", error);
        next(error);
    }
};

const ApproveDeviceRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        await requestService.approveDeviceRequest(requestId);

        res.status(200).json({ message: "Device approved successfully." });
    } catch (error) {
        next(error);
    }
};

const RejectDeviceRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        await requestService.rejectDeviceRequest(requestId);

        res.status(200).json({ message: "Device request rejected." });
    } catch (error) {
        next(error);
    }
};

const GetAllRequests = async (req, res, next) => {
    try {
        const requests = await requestService.getAllRequests();
        res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};
const OverwriteDeviceRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { targetDeviceId } = req.body;

        if (!targetDeviceId) {
            return res.status(400).json({ message: "targetDeviceId is required" });
        }

        const result = await requestService.overwriteDeviceRequest(requestId, targetDeviceId);

        res.status(200).json({
            message: "Device overwritten successfully.",
            user: result.user,
            request: result.request,
        });
    } catch (error) {
        next(error);
    }
};



const BlockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await requestService.blockUser(userId, true);

        res.status(200).json({
            message: "User blocked successfully.",
            user,
        });
    } catch (error) {
        next(error);
    }
};


const UnblockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await requestService.blockUser(userId, false);

        res.status(200).json({
            message: "User unblocked successfully.",
            user,
        });
    } catch (error) {
        next(error);
    }
};

const getUserDevices = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const devices = await requestService.getUserDevices(userId);

        res.status(200).json({
            message: "Allowed devices fetched successfully.",
            devices,
        });
    } catch (error) {
        next(error);
    }
};

const removeUserDevice = async (req, res, next) => {
    try {
        const { userId, deviceId } = req.params;

        if (!userId || !deviceId) {
            return res.status(400).json({ message: "userId and deviceId are required." });
        }

        const user = await requestService.removeUserDevice(userId, deviceId);

        res.status(200).json({
            message: "Device removed successfully.",
            user,
        });
    } catch (error) {
        next(error);
    }
};



module.exports = {
    RequestDeviceAccess,
    ApproveDeviceRequest,
    RejectDeviceRequest,
    GetAllRequests,
    OverwriteDeviceRequest,
    BlockUser,
    UnblockUser,
    getUserDevices,
    removeUserDevice
};