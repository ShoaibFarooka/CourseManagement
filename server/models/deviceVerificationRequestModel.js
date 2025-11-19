const mongoose = require("mongoose");

const deviceVerificationRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        deviceInfo: {
            visitorId: { type: String, required: true },
            userAgent: { type: String, required: true },
            location: {
                country: { type: String, required: true },
                region: { type: String, required: true },
                city: { type: String, required: true },
            },
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        }
    },
    { timestamps: true }
);

const DeviceVerificationRequest = mongoose.model("device_verification_request", deviceVerificationRequestSchema);

module.exports = DeviceVerificationRequest;
