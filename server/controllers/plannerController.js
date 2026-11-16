const plannerService = require("../services/plannerService");

const GetPlannerCourses = async (req, res, next) => {
    try {
        const courses = await plannerService.getPlannerCourses(req.user.id);
        res.status(200).json({ courses });
    } catch (error) {
        next(error);
    }
};

const GetPlan = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, language } = req.body;

        const plan = await plannerService.getPlan(
            req.user.id,
            courseId,
            partId,
            publisherId,
            language
        );

        res.status(200).json({ plan });
    } catch (error) {
        next(error);
    }
};

const CreatePlan = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, duration, language } = req.body;

        const plan = await plannerService.createPlan(
            req.user.id,
            courseId,
            partId,
            publisherId,
            Number(duration),
            language
        );

        res.status(201).json({ message: "Study plan created successfully", plan });
    } catch (error) {
        next(error);
    }
};

const GetDayQuestions = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, dayNumber, language } = req.body;

        const result = await plannerService.getDayQuestions(
            req.user.id,
            courseId,
            partId,
            publisherId,
            dayNumber,
            language
        );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const RecordDayProgress = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, dayNumber, questionIds, language } = req.body;

        const plan = await plannerService.recordDayProgress(
            req.user.id,
            courseId,
            partId,
            publisherId,
            dayNumber,
            questionIds,
            language
        );

        res.status(200).json({ plan });
    } catch (error) {
        next(error);
    }
};

const ResetPlan = async (req, res, next) => {
    try {
        const { courseId, partId, publisherId, language } = req.body;

        await plannerService.resetPlan(req.user.id, courseId, partId, publisherId, language);

        res.status(200).json({ message: "Study plan reset successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetPlannerCourses,
    GetPlan,
    CreatePlan,
    GetDayQuestions,
    RecordDayProgress,
    ResetPlan,
};
