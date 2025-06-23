const questionService = require("../services/questionService");

const GetAllQuestions = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const questions = await questionService.getAllQuestions(quizId);
        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

const AddQuestion = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const data = { ...req.body };
        const question = await questionService.addQuestion(quizId, data);
        res.status(201).json({ message: "Question added successfully" });
    } catch (error) {
        next(error);
    }
};

const UpdateQuestion = async (req, res, next) => {
    try {
        const { quizId, questionId } = req.params;
        const data = { ...req.body };
        const updatedQuestion = await questionService.updateQuestion(quizId, questionId, data);
        res.status(200).json({ message: "Question updated successfully" });
    } catch (error) {
        next(error);
    }
};

const DeleteQuestion = async (req, res, next) => {
    try {
        const { quizId, questionId } = req.params;
        await questionService.deleteQuestion(quizId, questionId);
        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    GetAllQuestions,
    AddQuestion,
    UpdateQuestion,
    DeleteQuestion
};