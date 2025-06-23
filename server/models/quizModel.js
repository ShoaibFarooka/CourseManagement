const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "place",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        time: {
            type: Number,
            required: true,
        },
        passingMarks: {
            type: Number,
            required: true,
        }
    },
    { timestamps: true }
);

const Quiz = mongoose.model("quiz", quizSchema);
module.exports = Quiz;
