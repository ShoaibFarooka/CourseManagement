const questionService = require("../services/questionService");

const getAllQuestions = async (req, res, next) => {
    try {
        const { subunitId, publisherId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const types = req.query.types
            ? Array.isArray(req.query.types)
                ? req.query.types
                : req.query.types.split(',')
            : [];

        const language = req.query.language
            ? Array.isArray(req.query.language)
                ? req.query.language
                : [req.query.language]
            : [];

        const result = await questionService.getAllQuestions(
            subunitId,
            publisherId,
            page,
            limit,
            types,
            language
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getAllQuestions:", error);
        next(error);
    }
};


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
        console.error("Error in addEssayQuestion:", error);
        next(error);
    }
};

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
        console.error("Error in addRapidQuestion:", error);
        next(error);
    }
};

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
        console.error("Error in addMcqQuestion:", error);
        next(error);
    }
};

const updateQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const updatedData = { ...req.body };

        await questionService.updateQuestion(questionId, updatedData);
        res.status(200).json({ message: "Question updated successfully" });
    } catch (error) {
        console.error("Error in updateQuestion:", error);
        next(error);
    }
};

const deleteQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;

        await questionService.deleteQuestion(questionId);
        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Error in deleteQuestion:", error);
        next(error);
    }
};

const uploadMCQQuestions = async (req, res) => {
    try {
        console.log("Uploaded file:", req.file);
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.addMCQQuestionsFromFile(filePath);

        res.status(200).json({
            message: `${result.addedQuestionsCount} MCQ questions uploaded successfully`,
            warnings: result.warnings,
        });
    } catch (error) {
        console.error("Error uploading MCQ questions:", error);
        res.status(500).json({ error: "Something went wrong while processing the file" });
    }
};

const uploadRapidQuestions = async (req, res) => {
    try {
        console.log("Uploaded file:", req.file);
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.addRapidQuestionsFromFile(filePath);

        res.status(200).json({
            message: `${result.addedQuestionsCount} Rapid questions uploaded successfully`,
            warnings: result.warnings,
        });
    } catch (error) {
        console.error("Error uploading Rapid questions:", error);
        res.status(500).json({ error: "Something went wrong while processing the file" });
    }
};

const uploadEssayQuestions = async (req, res) => {
    try {
        console.log("Uploaded file:", req.file);
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.addEssayQuestionsFromFile(filePath);

        res.status(200).json({
            message: `${result.addedQuestionsCount} Essay questions uploaded successfully`,
            warnings: result.warnings,
        });
    } catch (error) {
        console.error("Error uploading Essay questions:", error);
        res.status(500).json({ error: "Something went wrong while processing the file" });
    }
};

module.exports = {
    getAllQuestions,
    addEssayQuestion,
    addRapidQuestion,
    addMcqQuestion,
    updateQuestion,
    deleteQuestion,
    uploadMCQQuestions,
    uploadRapidQuestions,
    uploadEssayQuestions
};
