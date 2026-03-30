const progressService = require("../services/progressService");

const RecordAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { answers } = req.body;

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: "answers must be a non-empty array" });
        }

        await progressService.recordAnswer(userId, answers);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetUnitProgress = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId } = req.query;
        const userId = req.user.id;

        if (!unitId) return res.status(400).json({ message: "unitId is required" });

        const progress = await progressService.getUnitProgress(
            userId, courseId, partId, publisherId, unitId
        );

        if (!progress) {
            return res.status(404).json({ message: "No progress found for this unit" });
        }

        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};

const GetAllUnitsProgress = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId } = req.query;
        const userId = req.user.id;

        const progress = await progressService.getAllUnitsProgress(
            userId, courseId, partId, publisherId
        );

        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};


const GetAllSubunitsProgress = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId } = req.query;
        const userId = req.user.id;

        if (!unitId) return res.status(400).json({ message: "unitId is required" });

        const progress = await progressService.getAllSubunitsProgress(
            userId,
            courseId,
            partId,
            publisherId,
            unitId
        );
        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};


const GetContinueSession = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId } = req.query;
        const userId = req.user.id;

        const questions = await progressService.getContinueSession(
            userId, courseId, partId, publisherId, unitId
        );

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

const GetStartOverSession = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId } = req.body;
        const userId = req.user.id;

        const questions = await progressService.getStartOverSession(
            userId, courseId, partId, publisherId, unitId
        );

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

const GetWrongOnlySession = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, unitId } = req.query;
        const userId = req.user.id;

        const questions = await progressService.getWrongOnlySession(
            userId, courseId, partId, publisherId, unitId
        );

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    RecordAnswer,
    GetAllUnitsProgress,
    GetUnitProgress,
    GetAllSubunitsProgress,
    GetContinueSession,
    GetStartOverSession,
    GetWrongOnlySession,
};