const progressService = require("../services/progressService");
const RecordAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { answers, language } = req.body;

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: "answers must be a non-empty array" });
        }

        await progressService.recordAnswer(userId, answers, language);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetUnitProgress = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId, language, selectedSubunits = [] } = req.query;
        const userId = req.user.id;

        if (!unitId) return res.status(400).json({ message: "unitId is required" });

        const progress = await progressService.getUnitProgress(
            userId,
            courseId,
            partId,
            publisherId,
            unitId,
            Array.isArray(selectedSubunits)
                ? selectedSubunits
                : [selectedSubunits].filter(Boolean),
            language
        );

        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};



const GetAllUnitsProgress = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, language } = req.query;
        const userId = req.user.id;

        const progress = await progressService.getAllUnitsProgress(
            userId,
            courseId,
            partId,
            publisherId,
            language
        );

        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};

const GetAllSubunitsProgress = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId, language } = req.query;
        const userId = req.user.id;

        if (!unitId) return res.status(400).json({ message: "unitId is required" });

        const progress = await progressService.getAllSubunitsProgress(
            userId,
            courseId,
            partId,
            publisherId,
            unitId,
            language
        );

        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};
const GetContinueSession = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, selectedUnits, selectedSubunits, language, questionLimit } = req.query;

        const questions = await progressService.getContinueSession({
            userId: req.user.id,
            courseId,
            partId,
            publisherId,
            selectedUnits: JSON.parse(selectedUnits || "[]"),
            selectedSubunits: JSON.parse(selectedSubunits || "{}"),
            language,
            questionLimit: questionLimit ? Number(questionLimit) : null,
        });

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

const GetStartOverSession = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, selectedUnits, selectedSubunits, language, questionLimit } = req.body;

        const questions = await progressService.getStartOverSession({
            userId: req.user.id,
            courseId,
            partId,
            publisherId,
            selectedUnits,
            selectedSubunits,
            language,
            questionLimit: questionLimit ? Number(questionLimit) : null,
        });

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

const limitedSession = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            courseId,
            partId,
            publisherId,
            selectedUnits = [],
            selectedSubunits = {},
            language,
            questionLimit
        } = req.body;

        const data = await progressService.getLimitedSession({
            userId,
            courseId,
            partId,
            publisherId,
            selectedUnits,
            selectedSubunits,
            language,
            questionLimit: Number(questionLimit),
        });

        res.status(200).json({
            success: true,
            data,
        });

    } catch (err) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message,
        });
    }
};



const GetWrongOnlySession = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, selectedUnits, selectedSubunits, language, questionLimit } = req.query;

        const questions = await progressService.getWrongOnlySession({
            userId: req.user.id,
            courseId,
            partId,
            publisherId,
            selectedUnits: JSON.parse(selectedUnits || "[]"),
            selectedSubunits: JSON.parse(selectedSubunits || "{}"),
            language,
            questionLimit: questionLimit ? Number(questionLimit) : null,
        });

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};


const GetUnitPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, partId, publisherId, unitId, language } = req.query;

        const performance = await progressService.getUnitPerformance(
            userId,
            courseId,
            partId,
            publisherId,
            unitId,
            language
        );

        res.json({ success: true, performance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    RecordAnswer,
    GetAllUnitsProgress,
    GetUnitProgress,
    GetUnitPerformance,
    GetAllSubunitsProgress,
    GetContinueSession,
    GetStartOverSession,
    limitedSession,
    GetWrongOnlySession,
};
