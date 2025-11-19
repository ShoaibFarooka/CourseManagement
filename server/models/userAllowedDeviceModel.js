const mongoose = require("mongoose");

const userAllowedDeviceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        allowedDevices: [
            {
                deviceId: {
                    type: String,
                    required: true
                },
                userAgent: {
                    type: String,
                    required: true
                },
                location: {
                    country: {
                        type: String,
                        required: true
                    },
                    region: {
                        type: String,
                        required: true
                    },
                    city: {
                        type: String,
                        required: true
                    },
                }
            },
        ],
    },
    { timestamps: true }
);

const UserAllowedDevice = mongoose.model("user_allowed_device", userAllowedDeviceSchema);

module.exports = UserAllowedDevice;