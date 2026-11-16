const mongoose = require("mongoose");

// A question the user marked for a later attempt. Kept apart from userProgress so that
// "Start Over" (which resets progress stats) does not clear the user's marks.
const markedQuestionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "question",
            required: true,
        },
        // Copied from the question so marks can be counted per unit/subunit without
        // looking the questions up.
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
        unit: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        subunit: {
            type: mongoose.Schema.Types.ObjectId,
        },
        language: {
            type: String,
            enum: ["eng", "ar", "fr"],
        },
    },
    { timestamps: true }
);

markedQuestionSchema.index({ user: 1, question: 1 }, { unique: true });
markedQuestionSchema.index({ user: 1, unit: 1, subunit: 1 });

const MarkedQuestion = mongoose.model("marked_question", markedQuestionSchema);

module.exports = MarkedQuestion;
