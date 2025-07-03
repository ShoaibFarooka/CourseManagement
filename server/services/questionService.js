const Question = require("../models/questionModel");

// ✅ GET all questions by subunitId
const getAllQuestions = async (subunitId) => {
    const questions = await Question.find({ subunitId });

    if (!questions || questions.length === 0) {
        const error = new Error("No questions found for this subunit.");
        error.code = 404;
        throw error;
    }

    return questions;
};

// ✅ ADD a new question (discriminator: essay, rapid, mcq)
const addQuestion = async (data) => {
    try {
        const question = await Question.create(data);
        return question;
    } catch (err) {
        const error = new Error("Failed to create question.");
        error.code = 500;
        error.details = err;
        throw error;
    }
};

// ✅ UPDATE an existing question by ID
const updateQuestion = async (questionId, data) => {
    const question = await Question.findById(questionId);
    if (!question) {
        const error = new Error("Question not found.");
        error.code = 404;
        throw error;
    }

    try {
        Object.assign(question, data);
        const updated = await question.save();
        return updated;
    } catch (err) {
        const error = new Error("Failed to update question.");
        error.code = 500;
        error.details = err;
        throw error;
    }
};

// ✅ DELETE a question by ID
const deleteQuestion = async (questionId) => {
    const deleted = await Question.findByIdAndDelete(questionId);
    if (!deleted) {
        const error = new Error("Question not found or already deleted.");
        error.code = 404;
        throw error;
    }
    return deleted;
};


module.exports = {
    getAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
};
