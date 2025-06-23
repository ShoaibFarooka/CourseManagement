const Quiz = require("../models/quizModel");
const Question = require("../models/questionModel");

const getAllQuestions = async (quizId) => {
    const questions = await Question.find({ quiz: quizId });
    if (!questions || questions.length <= 0) {
        const error = new Error("Questions not found!");
        error.code = 404;
        throw error;
    }

    return questions;
};

const addQuestion = async (quizId, data) => {
    const { questionText, options, correctOption } = data;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        const error = new Error("Quiz not found!");
        error.code = 404;
        throw error;
    }
    const question = await Question.create({
        quiz: quizId,
        questionText,
        options,
        correctOption
    });

    return question;
};

const updateQuestion = async (quizId, questionId, data) => {
    const { questionText, options, correctOption } = data;
    const question = await Question.findOne({ _id: questionId, quiz: quizId });
    if (!question) {
        const error = new Error("Question not found!");
        error.code = 404;
        throw error;
    }
    question.questionText = questionText;
    question.options = options;
    question.correctOption = correctOption;

    const updatedQuestion = await question.save();

    return updatedQuestion;
};

const deleteQuestion = async (quizId, questionId) => {
    const question = await Question.findOneAndDelete({ _id: questionId, quiz: quizId });

    if (!question) {
        const error = new Error("Question not found!");
        error.code = 404;
        throw error;
    }
};

module.exports = {
    getAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
};
