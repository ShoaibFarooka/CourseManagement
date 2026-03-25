const UserProgress = require("../models/userProgressModel");
const Question = require('../models/questionModel');

const initializeUnitStat = async (userId, courseId, unitId) => {
    const totalQuestions = await Question.countDocuments({ unit: unitId });

    await UserProgress.findOneAndUpdate(
        { user: userId, course: courseId },
        {
            $setOnInsert: {
                user: userId,
                course: courseId,
                unit: unitId,
                progress: {},
            },
        },
        { upsert: true, new: true }
    );

    await UserProgress.updateOne(
        {
            user: userId,
            course: courseId,
            [`progress.${unitId}`]: { $exists: false },
        },
        {
            $set: {
                [`progress.${unitId}`]: {
                    totalQuestions,
                    attempted: 0,
                    correct: 0,
                    wrong: 0,
                    lastAttemptedQ: null,
                    attemptedIds: [],
                    wrongIds: [],
                },
            },
        }
    );
};

const recordAnswer = async (userId, courseId, unitId, questionId, isCorrect) => {
    await initializeUnitStat(userId, courseId, unitId);

    const unitKey = `progress.${unitId}`;

    const progressDoc = await UserProgress.findOne({ user: userId, course: courseId });
    const stat = progressDoc.progress.get(unitId);

    const alreadyAttempted = stat.attemptedIds.some(
        (id) => id.toString() === questionId.toString()
    );

    // ── Case 1: first time attempting this question ───────────────
    if (!alreadyAttempted) {
        const update = {
            $inc: {
                [`${unitKey}.attempted`]: 1,
                [`${unitKey}.correct`]: isCorrect ? 1 : 0,
                [`${unitKey}.wrong`]: isCorrect ? 0 : 1,
            },
            $set: {
                [`${unitKey}.lastAttemptedQ`]: questionId,
            },
            $addToSet: {
                [`${unitKey}.attemptedIds`]: questionId,
            },
        };

        if (isCorrect) {
            update.$pull = { [`${unitKey}.wrongIds`]: questionId };
        } else {
            update.$addToSet[`${unitKey}.wrongIds`] = questionId;
        }

        await UserProgress.findOneAndUpdate(
            { user: userId, course: courseId },
            update,
            { new: true }
        );

        return;
    }

    // ── Case 2: question was already attempted before (wrong-only or
    //    continue session re-attempt) — only update correctness tracking
    //    do NOT increment attempted counter again
    const wasWrong = stat.wrongIds.some(
        (id) => id.toString() === questionId.toString()
    );

    const update = {
        $set: {
            [`${unitKey}.lastAttemptedQ`]: questionId,
        },
    };

    if (isCorrect && wasWrong) {
        // was wrong before, now correct — remove from wrongIds, increment correct
        update.$inc = {
            [`${unitKey}.correct`]: 1,
            [`${unitKey}.wrong`]: -1,
        };
        update.$pull = { [`${unitKey}.wrongIds`]: questionId };
    } else if (!isCorrect && !wasWrong) {
        // was correct before, now wrong — add to wrongIds, adjust counters
        update.$inc = {
            [`${unitKey}.correct`]: -1,
            [`${unitKey}.wrong`]: 1,
        };
        update.$addToSet = { [`${unitKey}.wrongIds`]: questionId };
    }
    // if same result as before — only lastAttemptedQ gets updated

    await UserProgress.updateOne(
        { user: userId, course: courseId },
        update
    );
};

const getUnitProgress = async (userId, courseId, unitId) => {
    const progressDoc = await UserProgress.findOne({ user: userId, course: courseId });

    if (!progressDoc) {
        const error = new Error("Progress not found!");
        error.code = 404;
        throw error;
    }

    const stat = progressDoc.progress.get(unitId);

    if (!stat) {
        const error = new Error("Unit progress not found!");
        error.code = 404;
        throw error;
    }

    const statObj = stat.toObject();

    return {
        unitId: unitId,
        totalQuestions: statObj.totalQuestions,
        attempted: statObj.attempted,
        unattempted: statObj.totalQuestions - statObj.attempted,
        correct: statObj.correct,
        wrong: statObj.wrong,
        lastAttemptedQ: statObj.lastAttemptedQ,
    };
};

const getContinueSession = async (userId, courseId, unitId) => {
    const progressDoc = await UserProgress.findOne({ user: userId, course: courseId });
    const excludeIds = progressDoc?.progress?.get(unitId)?.attemptedIds ?? [];

    const questions = await Question.find({
        unit: unitId,
        _id: { $nin: excludeIds },
    });

    if (!questions || questions.length <= 0) {
        const error = new Error("No remaining questions found!");
        error.code = 404;
        throw error;
    }

    return questions;
};

const getStartOverSession = async (userId, courseId, unitId) => {
    const unitKey = `progress.${unitId}`;

    // ✅ wrongIds is now cleared as well — full reset
    await UserProgress.updateOne(
        { user: userId, course: courseId },
        {
            $set: {
                [`${unitKey}.attempted`]: 0,
                [`${unitKey}.correct`]: 0,
                [`${unitKey}.wrong`]: 0,
                [`${unitKey}.attemptedIds`]: [],
                [`${unitKey}.wrongIds`]: [],
                [`${unitKey}.lastAttemptedQ`]: null,
            },
        }
    );

    const questions = await Question.find({ unit: unitId });

    if (!questions || questions.length <= 0) {
        const error = new Error("No questions found for this unit!");
        error.code = 404;
        throw error;
    }

    return questions;
};

const getWrongOnlySession = async (userId, courseId, unitId) => {
    const progressDoc = await UserProgress.findOne({ user: userId, course: courseId });
    const wrongIds = progressDoc?.progress?.get(unitId)?.wrongIds ?? [];

    if (!wrongIds.length) {
        const error = new Error("No wrong answers found for this unit!");
        error.code = 404;
        throw error;
    }

    const questions = await Question.find({ _id: { $in: wrongIds } });

    return questions;
};

module.exports = {
    recordAnswer,
    getUnitProgress,
    getContinueSession,
    getStartOverSession,
    getWrongOnlySession,
};