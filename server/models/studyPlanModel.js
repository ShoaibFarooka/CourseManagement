const mongoose = require("mongoose");

const planDaySchema = new mongoose.Schema(
    {
        dayNumber: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        // Questions assigned to this day, in syllabus order.
        questions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "question",
        }],
        // Questions of this day the user has fully attempted. The day is complete when
        // every assigned question is in here.
        completedIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "question",
        }],
    },
    { _id: false }
);

const studyPlanSchema = new mongoose.Schema(
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
        publisher: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        language: {
            type: String,
            enum: ["eng", "ar", "fr"],
            required: true,
        },
        // The period the user picked (15, 30, 45 or 60 days). The plan can hold fewer
        // days when the publisher has fewer questions than that.
        duration: {
            type: Number,
            enum: [15, 30, 45, 60],
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        days: {
            type: [planDaySchema],
            default: [],
        },
    },
    { timestamps: true }
);

studyPlanSchema.index(
    { user: 1, course: 1, part: 1, publisher: 1, language: 1 },
    { unique: true }
);

const StudyPlan = mongoose.model("study_plan", studyPlanSchema);

module.exports = StudyPlan;
