const Place = require("../models/placeModel");
const Quiz = require("../models/quizModel");

const getAllQuizzes = async (placeId) => {
    const quizzes = await Quiz.find({ place: placeId });
    if (!quizzes || quizzes.length <= 0) {
        const error = new Error("Quizzes not found!");
        error.code = 404;
        throw error;
    }
    return quizzes;
};

const addQuiz = async (placeId, data) => {
    const { title, time, passingMarks } = data;
    const place = await Place.findById(placeId);
    if (!place) {
        const error = new Error("Place not found!");
        error.code = 404;
        throw error;
    }
    const quiz = await Quiz.create({
        place: placeId,
        title,
        time,
        passingMarks
    });

    return quiz;
};

const updateQuiz = async (placeId, quizId, data) => {
    const { title, time, passingMarks } = data;
    const quiz = await Quiz.findOne({ _id: quizId, place: placeId });
    if (!quiz) {
        const error = new Error("Quiz not found!");
        error.code = 404;
        throw error;
    }
    quiz.title = title;
    quiz.time = time;
    quiz.passingMarks = passingMarks;

    const updatedQuiz = await quiz.save();

    return updatedQuiz;
};

const deleteQuiz = async (placeId, quizId) => {
    const quiz = await Quiz.findOneAndDelete({ _id: quizId, place: placeId });

    if (!quiz) {
        const error = new Error("Quiz not found!");
        error.code = 404;
        throw error;
    }
};

module.exports = {
    getAllQuizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz
};
