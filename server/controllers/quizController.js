const quizService = require("../services/quizService");

const GetAllQuizzes = async (req, res, next) => {
    try {
        const { placeId } = req.params;
        const quizzes = await quizService.getAllQuizzes(placeId);
        res.status(200).json({ quizzes });
    } catch (error) {
        next(error);
    }
};

const AddQuiz = async (req, res, next) => {
    try {
        const { placeId } = req.params;
        const data = { ...req.body };
        const quiz = await quizService.addQuiz(placeId, data);
        res.status(201).json({ message: "Quiz added successfully" });
    } catch (error) {
        next(error);
    }
};

const UpdateQuiz = async (req, res, next) => {
    try {
        const { placeId, quizId } = req.params;
        const data = { ...req.body };
        const updatedQuiz = await quizService.updateQuiz(placeId, quizId, data);
        res.status(200).json({ message: "Quiz updated successfully" });
    } catch (error) {
        next(error);
    }
};

const DeleteQuiz = async (req, res, next) => {
    try {
        const { placeId, quizId } = req.params;
        await quizService.deleteQuiz(placeId, quizId);
        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    GetAllQuizzes,
    AddQuiz,
    UpdateQuiz,
    DeleteQuiz
};