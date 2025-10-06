const Request = require("../models/requestModel.js");
const User = require("../models/userModel.js");
const { getCountryFromIP } = require("../utils/deviceInfoUtils");



const RequestDeviceAccess = async (req, res, next) => {
    try {
        const userId = req.user?.id; // from JWT
        const { visitorId, userAgent } = req.body;

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const location = await getCountryFromIP(ip);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // check if device already exists
        const deviceExists = user.allowedDevices.some((d) => d.deviceId === visitorId);
        if (deviceExists) {
            return res.status(200).json({ message: "Device already allowed." });
        }

        const request = new Request({
            user: user._id,
            deviceInfo: {
                visitorId,
                userAgent,
                location,  // <-- auto-filled from IP
            },
            isNewUser: false,
        });

        await request.save();

        res.status(201).json({
            message: "Device access request sent. Waiting for admin approval.",
        });
    } catch (error) {
        next(error);
    }
};
const ApproveDeviceRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        const request = await Request.findById(requestId).populate("user");
        if (!request) return res.status(404).json({ message: "Request not found" });

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

        res.status(200).json({ message: "Device approved successfully." });
    } catch (error) {
        next(error);
    }
};

const RejectDeviceRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const request = await Request.findById(requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = "rejected";
        await request.save();

        res.status(200).json({ message: "Device request rejected." });
    } catch (error) {
        next(error);
    }
};

const GetAllRequests = async (req, res, next) => {
    try {
        const requests = await Request.find().populate("user");
        res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    RequestDeviceAccess,
    ApproveDeviceRequest,
    RejectDeviceRequest,
    GetAllRequests
}