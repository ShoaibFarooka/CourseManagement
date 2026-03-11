const { getCountryFromIP } = require("../utils/deviceInfoUtils.js");
const deviceRequestService = require("../services/deviceRequestService.js");

const RequestDeviceAccess = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { visitorId, userAgent } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!visitorId || !userAgent) {
            return res.status(400).json({
                message: "visitorId and userAgent are required."
            });
        }

        let ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.socket?.remoteAddress;

        // Remove IPv6 prefix if present (::ffff:192.168.1.1)
        if (ip && ip.startsWith("::ffff:")) {
            ip = ip.split("::ffff:")[1];
        }

        const geo = (await getCountryFromIP(ip)) || {};

        const location = {
            country: geo.country || "Unknown",
            region: geo.region || "Unknown",
            city: geo.city || "Unknown",
        };

        const result = await deviceRequestService.requestDeviceAccess(
            userId,
            visitorId,
            userAgent,
            location
        );

        if (result.alreadyAllowed === true) {
            return res.status(200).json({
                status: "allowed",
                message: "Device already allowed"
            });
        }

        if (result.alreadyRequested === true) {
            return res.status(200).json({
                status: "pending",
                message: "Device request already pending approval",
                requestId: result.requestId
            });
        }

        if (result.request?._id) {
            return res.status(201).json({
                status: "pending",
                message: "Device access request sent",
                requestId: result.request._id
            });
        }

        return res.status(500).json({
            message: "Unexpected request state"
        });

    } catch (error) {
        console.error("RequestDeviceAccess Error:", error);
        next(error);
    }
};


const ApproveDeviceRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        await deviceRequestService.approveDeviceRequest(requestId);

        res.status(200).json({ message: "Device approved successfully." });
    } catch (error) {
        next(error);
    }
};

const RejectDeviceRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        await deviceRequestService.rejectDeviceRequest(requestId);

        res.status(200).json({ message: "Device request rejected." });
    } catch (error) {
        next(error);
    }
};

const GetAllDevicesRequests = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const filter = req.query.filter || "all";

        const result = await deviceRequestService.getAllDevicesRequests(
            page,
            limit,
            filter
        );

        res.status(200).json(result);
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

        const result = await deviceRequestService.overwriteDeviceRequest(requestId, targetDeviceId);

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
        const user = await deviceRequestService.blockUser(userId);

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
        const user = await deviceRequestService.unblockUser(userId);

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
        const userId = req.user?.id;
        const devices = await deviceRequestService.getUserDevices(userId);
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

        const user = await deviceRequestService.removeUserDevice(userId, deviceId);

        res.status(200).json({
            message: "Device removed successfully.",
            user,
        });
    } catch (error) {
        next(error);
    }
};

const DeleteRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const deletedRequest = await deviceRequestService.deleteRequest(requestId);

        res.status(200).json({
            message: "Request deleted successfully.",
            deletedRequest,
        });
    } catch (error) {
        next(error);
    }
};

const fetchUserDevicesById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const devices = await deviceRequestService.fetchUserDevicesById(userId);
        res.status(200).json({
            message: "Allowed devices fetched successfully.",
            devices,
        });
    } catch (error) {
        next(error);
    }
};




module.exports = {
    RequestDeviceAccess,
    ApproveDeviceRequest,
    RejectDeviceRequest,
    GetAllDevicesRequests,
    OverwriteDeviceRequest,
    BlockUser,
    UnblockUser,
    getUserDevices,
    removeUserDevice,
    DeleteRequest,
    fetchUserDevicesById,
};