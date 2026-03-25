const mongoose = require("mongoose");

const unitStatSchema = new mongoose.Schema(
    {
        totalQuestions: {
            type: Number, default: 0
        },
        attempted: {
            type: Number, default: 0
        },
        correct: {
            type: Number, default: 0
        },
        wrong: {
            type: Number, default: 0
        },
        lastAttemptedQ: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "question",
            default: null
        },
        attemptedIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "question"
        }],
        wrongIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "question"
        }],
    },
    { _id: false }
);

const userProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
            required: true
        },
        unit: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        progress: {
            type: Map,
            of: unitStatSchema,
            default: {},
        },
    },
    { timestamps: true }
);

userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const UserProgress = mongoose.model("userProgress", userProgressSchema);

module.exports = UserProgress;