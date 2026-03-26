const mongoose = require("mongoose");

const subunitStatSchema = new mongoose.Schema(
    {
        totalQuestions: { type: Number, default: 0 },
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 },
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

const unitStatSchema = new mongoose.Schema(
    {
        totalQuestions: { type: Number, default: 0 },
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 },
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
        subunits: {
            type: Map,
            of: subunitStatSchema,
            default: {}
        }
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
        part: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        publisher: {
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

userProgressSchema.index(
    { user: 1, course: 1, part: 1, publisher: 1 },
    { unique: true }
);

const UserProgress = mongoose.model("userProgress", userProgressSchema);

module.exports = UserProgress;