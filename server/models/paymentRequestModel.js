const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
            required: true,
        },
        part: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        }
    },
    { timestamps: true }
);

const PaymentRequest = mongoose.model("payment_request", paymentRequestSchema);

module.exports = PaymentRequest;