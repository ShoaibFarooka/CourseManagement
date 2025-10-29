const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
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
        expireyDate: {
            type: Date,
            required: true,
        },
        comment: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Payment = mongoose.model("payment", paymentSchema);

module.exports = Payment;
