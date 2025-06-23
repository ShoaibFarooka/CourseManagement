const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "quiz",
            required: true,
        },
        questionText: {
            type: String,
            required: true,
            trim: true,
        },
        options: {
            A: { type: String, required: true, trim: true },
            B: { type: String, required: true, trim: true },
            C: { type: String, required: true, trim: true },
            D: { type: String, required: true, trim: true },
        },
        correctOption: {
            type: String,
            required: true,
            enum: ["A", "B", "C", "D"],
        },
    },
    { timestamps: true }
);

const Question = mongoose.model("question", questionSchema);
module.exports = Question;
