const questionService = require("../services/questionService");

// ✅ GET all questions for a given subunit
const getAllQuestions = async (req, res, next) => {
    try {
        const { subunitId } = req.params;
        const questions = await questionService.getAllQuestions(subunitId);
        res.status(200).json({ questions });
    } catch (error) {
        console.error("❌ Error in getAllQuestions:", error);
        next(error);
    }
};

// ✅ ADD Essay Question
const addEssayQuestion = async (req, res, next) => {
    try {
        const { subunitId, publisherId } = req.params;

        const questionData = {
            ...req.body,
            type: "essay",
            subunitId,
            publisherId,
        };

        await questionService.addQuestion(questionData);
        res.status(201).json({ message: "Essay question added successfully" });
    } catch (error) {
        console.error("❌ Error in addEssayQuestion:", error);
        next(error);
    }
};

// ✅ ADD Rapid Question
const addRapidQuestion = async (req, res, next) => {
    try {
        const { subunitId, publisherId } = req.params;

        const questionData = {
            ...req.body,
            type: "rapid",
            subunitId,
            publisherId,
        };

        await questionService.addQuestion(questionData);
        res.status(201).json({ message: "Rapid question added successfully" });
    } catch (error) {
        console.error("❌ Error in addRapidQuestion:", error);
        next(error);
    }
};

// ✅ ADD MCQ Question
const addMcqQuestion = async (req, res, next) => {
    try {
        const { subunitId, publisherId } = req.params;

        const questionData = {
            ...req.body,
            type: "mcq",
            subunitId,
            publisherId,
        };

        await questionService.addQuestion(questionData);
        res.status(201).json({ message: "MCQ question added successfully" });
    } catch (error) {
        console.error("❌ Error in addMcqQuestion:", error);
        next(error);
    }
};

// ✅ UPDATE Question by ID
const updateQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const updatedData = { ...req.body };

        await questionService.updateQuestion(questionId, updatedData);
        res.status(200).json({ message: "Question updated successfully" });
    } catch (error) {
        console.error("❌ Error in updateQuestion:", error);
        next(error);
    }
};

// ✅ DELETE Question by ID
const deleteQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;

        await questionService.deleteQuestion(questionId);
        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("❌ Error in deleteQuestion:", error);
        next(error);
    }
};


module.exports = {
    getAllQuestions,
    addEssayQuestion,
    addRapidQuestion,
    addMcqQuestion,
    updateQuestion,
    deleteQuestion,
};
