const progressService = require("../services/progressService");

const RecordAnswer = async (req, res, next) => {
    try {
        const { courseId, unitId, questionId, isCorrect } = req.body;
        const userId = req.user.id;

        const progress = await progressService.recordAnswer(
            userId,
            courseId,
            unitId,
            questionId,
            isCorrect
        );

        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};

const GetUnitProgress = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.query;
        const userId = req.user.id;

        const progress = await progressService.getUnitProgress(userId, courseId, unitId);

        res.status(200).json({ progress });
    } catch (error) {
        next(error);
    }
};

const GetContinueSession = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.query;
        const userId = req.user.id;

        const questions = await progressService.getContinueSession(userId, courseId, unitId);

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

const GetStartOverSession = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.body;
        const userId = req.user.id;

        const questions = await progressService.getStartOverSession(userId, courseId, unitId);

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

const GetWrongOnlySession = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.query;
        const userId = req.user.id;

        const questions = await progressService.getWrongOnlySession(userId, courseId, unitId);

        res.status(200).json({ questions });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    RecordAnswer,
    GetUnitProgress,
    GetContinueSession,
    GetStartOverSession,
    GetWrongOnlySession,
};