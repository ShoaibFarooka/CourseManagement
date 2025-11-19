const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        paymentRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "payment_request",
            required: true,
        },
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
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        startDate: {
            type: Date,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        comment: {
            type: String,
            default: "",
            trim: true,
        }
    },
    { timestamps: true }
);

const Payment = mongoose.model("payment", paymentSchema);

module.exports = Payment;
