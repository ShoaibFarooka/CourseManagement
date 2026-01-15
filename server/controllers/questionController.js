const questionService = require("../services/questionService");

const getAllQuestions = async (req, res, next) => {
    try {
        const {
            courseId,
            partId,
            publisherId,
            unitId,
            subunitId
        } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const types = req.query.types
            ? Array.isArray(req.query.types)
                ? req.query.types
                : req.query.types.split(',')
            : [];

        const languages = req.query.languages
            ? Array.isArray(req.query.languages)
                ? req.query.languages
                : req.query.languages.split(',')
            : [];

        const result = await questionService.getAllQuestions({
            course: courseId,
            part: partId,
            publisher: publisherId,
            unit: unitId,
            subunit: subunitId,
            page,
            limit,
            types,
            languages
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const addEssayQuestion = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId, subunitId, } = req.params;

        const questionData = {
            ...req.body,
            type: "essay",
            course: courseId,
            part: partId,
            publisher: publisherId,
            unit: unitId,
            subunit: subunitId,
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
        const { courseId, partId, publisherId, unitId, subunitId, } = req.params;

        const questionData = {
            ...req.body,
            type: "rapid",
            course: courseId,
            part: partId,
            publisher: publisherId,
            unit: unitId,
            subunit: subunitId,
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
        const { courseId, partId, publisherId, unitId, subunitId, } = req.params;

        const questionData = {
            ...req.body,
            type: "mcq",
            course: courseId,
            part: partId,
            publisher: publisherId,
            unit: unitId,
            subunit: subunitId,
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

const uploadMCQQuestions = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.addMCQQuestionsFromFile(filePath);

        res.status(200).json({
            message: `${result.addedQuestionsCount} MCQ questions uploaded successfully`,
            warnings: result.warnings
        });
    } catch (error) {
        next(error);
    }
};

const uploadRapidQuestions = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.addRapidQuestionsFromFile(filePath);

        res.status(200).json({
            message: `${result.addedQuestionsCount} Rapid questions uploaded successfully`,
            warnings: result.warnings
        });
    } catch (error) {
        next(error);
    }
};

const uploadEssayQuestions = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.addEssayQuestionsFromFile(filePath);

        res.status(200).json({
            message: `${result.addedQuestionsCount} Essay questions uploaded successfully`,
            warnings: result.warnings
        });
    } catch (error) {
        next(error);
    }
};

const validateMCQQuestions = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.validateMCQQuestionsFile(filePath);

        res.status(200).json({
            message: result.isValid
                ? "MCQ file validation successful"
                : "MCQ file validation completed with warnings",
            warnings: result.warnings
        });

    } catch (error) {
        next(error);
    }
};

const validateRapidQuestions = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.validateRapidQuestionsFile(filePath);

        res.status(200).json({
            message: result.isValid
                ? "Rapid questions file validation successful"
                : "Rapid questions file validation completed with warnings",
            warnings: result.warnings
        });

    } catch (error) {
        next(error);
    }
};

const validateEssayQuestions = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const result = await questionService.validateEssayQuestionsFile(filePath);

        res.status(200).json({
            message: result.isValid
                ? "Essay questions file validation successful"
                : "Essay questions file validation completed with warnings",
            warnings: result.warnings
        });

    } catch (error) {
        next(error);
    }
};

const fetchQuestionsWithFilters = async (req, res, next) => {
    try {
        const {
            publisherId,
            selectedUnits,
            selectedSubunits,
            page,
            limit
        } = req.body;

        if (!publisherId || !selectedUnits || selectedUnits.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Publisher and at least one unit are required"
            });
        }

        const result = await questionService.FetchQuestionsWithFilters({
            publisherId,
            selectedUnits,
            selectedSubunits,
            page,
            limit
        });

        res.status(200).json({
            data: result.questions,
            pagination: result.pagination
        });

    } catch (error) {
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
    uploadMCQQuestions,
    uploadRapidQuestions,
    uploadEssayQuestions,
    validateMCQQuestions,
    validateRapidQuestions,
    validateEssayQuestions,
    fetchQuestionsWithFilters
};
