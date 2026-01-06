const mongoose = require("mongoose");

const options = {
    discriminatorKey: "type",
    timestamps: true,
};

const questionSchema = new mongoose.Schema({
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
        required: true,
    },
    language: {
        type: String,
        enum: ["eng", "ar", "fr"],
        required: true,
    }
}, options);

const Question = mongoose.model("question", questionSchema);

Question.discriminator("essay", new mongoose.Schema({
    content: {
        type: String,
        trim: true,
        required: true
    },
    subquestions: [{
        statement: { type: String, trim: true, required: true },
        explanation: { type: String, trim: true, required: true },
    }]
}, { _id: false }));

Question.discriminator("rapid", new mongoose.Schema({
    concept: { type: String, trim: true, required: true },
    definition: { type: String, trim: true, required: true },
    subquestions: [{
        statement: { type: String, trim: true, required: true },
        options: {
            a: {
                option: { type: String, trim: true, required: true },
                explanation: { type: String, trim: true, required: true },
            },
            b: {
                option: { type: String, trim: true, required: true },
                explanation: { type: String, trim: true, required: true },
            },
        },
        correctOption: { type: String, enum: ["a", "b"], required: true },
    }]
}, { _id: false }));

Question.discriminator("mcq", new mongoose.Schema({
    statement: { type: String, trim: true, required: true },
    options: {
        a: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
        b: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
        c: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
        d: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
    },
    correctOption: { type: String, enum: ["a", "b", "c", "d"], required: true },
}, { _id: false }));

module.exports = Question;
