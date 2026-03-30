const UserProgress = require("../models/userProgressModel");
const Question = require('../models/questionModel');
const mongoose = require("mongoose");
const { Types } = mongoose;

const initializeUnitStat = async (userId, courseId, partId, publisherId, unitId) => {
    const totalQuestions = await Question.countDocuments({ unit: unitId });

    await UserProgress.findOneAndUpdate(
        { user: userId, course: courseId, part: partId, publisher: publisherId },
        {
            $setOnInsert: {
                user: userId,
                course: courseId,
                part: partId,
                publisher: publisherId,
                progress: {},
            },
        },
        { upsert: true, new: true }
    );

    await UserProgress.updateOne(
        {
            user: userId,
            course: courseId,
            part: partId,
            publisher: publisherId,
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
                    subunits: {},
                },
            },
        }
    );
};

const recordAnswer = async (userId, answers) => {
    const groupMap = new Map();
    for (const ans of answers) {
        const key = `${ans.courseId}|${ans.partId}|${ans.publisherId}`;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(ans);
    }

    await Promise.all(
        [...groupMap.entries()].map(([key, groupAnswers]) =>
            processBatchGroup(userId, groupAnswers)
        )
    );
};

const processBatchGroup = async (userId, answers) => {
    const { courseId, partId, publisherId } = answers[0];

    const questionIds = [...new Set(answers.map(a => a.questionId))];

    const questions = await Question.find(
        { _id: { $in: questionIds } },
        { _id: 1, unit: 1, subunit: 1 }
    ).lean();

    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    let progressDoc = await UserProgress.findOneAndUpdate(
        { user: userId, course: courseId, part: partId, publisher: publisherId },
        {
            $setOnInsert: {
                user: userId,
                course: courseId,
                part: partId,
                publisher: publisherId,
                progress: {},
            },
        },
        { upsert: true, new: true }
    );


    const unitIds = [...new Set(
        answers.map(a => new Types.ObjectId(a.unitId))
    )];

    const subunitIds = [...new Set(
        questions
            .map(q => q.subunit)
            .filter(Boolean)
            .map(id => new Types.ObjectId(id))
    )];

    const [unitCounts, subunitCounts] = await Promise.all([
        Question.aggregate([
            { $match: { unit: { $in: unitIds } } },
            { $group: { _id: "$unit", total: { $sum: 1 } } }
        ]),
        Question.aggregate([
            { $match: { subunit: { $in: subunitIds } } },
            { $group: { _id: "$subunit", total: { $sum: 1 } } }
        ])
    ]);

    const unitTotalMap = new Map(
        unitCounts.map(u => [u._id.toString(), u.total])
    );

    const subunitTotalMap = new Map(
        subunitCounts.map(s => [s._id.toString(), s.total])
    );

    let needsSave = false;

    for (const unitId of unitIds) {
        const unitKeyStr = unitId.toString();

        if (!progressDoc.progress.has(unitKeyStr)) {
            progressDoc.progress.set(unitKeyStr, {
                totalQuestions: unitTotalMap.get(unitKeyStr) || 0,
                attempted: 0,
                correct: 0,
                wrong: 0,
                lastAttemptedQ: null,
                attemptedIds: [],
                wrongIds: [],
                subunits: new Map(),
            });
            needsSave = true;
        }

        const stat = progressDoc.progress.get(unitKeyStr);

        for (const subunitId of subunitIds) {
            const subunitKeyStr = subunitId.toString();

            if (!stat.subunits.has(subunitKeyStr)) {
                stat.subunits.set(subunitKeyStr, {
                    totalQuestions: subunitTotalMap.get(subunitKeyStr) || 0,
                    attempted: 0,
                    correct: 0,
                    wrong: 0,
                    lastAttemptedQ: null,
                    attemptedIds: [],
                    wrongIds: [],
                });
                needsSave = true;
            }
        }
    }

    if (needsSave) await progressDoc.save();

    const deduped = new Map();
    for (const ans of answers) {
        deduped.set(ans.questionId.toString(), ans);
    }

    const bulkOps = [];

    for (const ans of deduped.values()) {
        const { unitId, questionId, isCorrect } = ans;
        const question = questionMap.get(questionId.toString());
        if (!question) continue;

        const subunitId = question.subunit?.toString();
        const unitKey = `progress.${unitId}`;
        const stat = progressDoc.progress.get(unitId.toString());

        const alreadyAttempted = stat.attemptedIds.some(
            id => id.toString() === questionId.toString()
        );

        const wasWrong = stat.wrongIds.some(
            id => id.toString() === questionId.toString()
        );

        const update = {
            $set: {
                [`${unitKey}.lastAttemptedQ`]: questionId,
                ...(subunitId && {
                    [`${unitKey}.subunits.${subunitId}.lastAttemptedQ`]: questionId,
                }),
            },
        };

        if (!alreadyAttempted) {
            update.$inc = {
                [`${unitKey}.attempted`]: 1,
                [`${unitKey}.correct`]: isCorrect ? 1 : 0,
                [`${unitKey}.wrong`]: isCorrect ? 0 : 1,
                ...(subunitId && {
                    [`${unitKey}.subunits.${subunitId}.attempted`]: 1,
                    [`${unitKey}.subunits.${subunitId}.correct`]: isCorrect ? 1 : 0,
                    [`${unitKey}.subunits.${subunitId}.wrong`]: isCorrect ? 0 : 1,
                }),
            };

            update.$addToSet = {
                [`${unitKey}.attemptedIds`]: questionId,
                ...(subunitId && {
                    [`${unitKey}.subunits.${subunitId}.attemptedIds`]: questionId,
                }),
                ...(!isCorrect && {
                    [`${unitKey}.wrongIds`]: questionId,
                    ...(subunitId && {
                        [`${unitKey}.subunits.${subunitId}.wrongIds`]: questionId,
                    }),
                }),
            };

            if (isCorrect) {
                update.$pull = {
                    [`${unitKey}.wrongIds`]: questionId,
                    ...(subunitId && {
                        [`${unitKey}.subunits.${subunitId}.wrongIds`]: questionId,
                    }),
                };
            }

        } else {
            if (isCorrect && wasWrong) {
                update.$inc = {
                    [`${unitKey}.correct`]: 1,
                    [`${unitKey}.wrong`]: -1,
                    ...(subunitId && {
                        [`${unitKey}.subunits.${subunitId}.correct`]: 1,
                        [`${unitKey}.subunits.${subunitId}.wrong`]: -1,
                    }),
                };
                update.$pull = {
                    [`${unitKey}.wrongIds`]: questionId,
                    ...(subunitId && {
                        [`${unitKey}.subunits.${subunitId}.wrongIds`]: questionId,
                    }),
                };

            } else if (!isCorrect && !wasWrong) {
                update.$inc = {
                    [`${unitKey}.correct`]: -1,
                    [`${unitKey}.wrong`]: 1,
                    ...(subunitId && {
                        [`${unitKey}.subunits.${subunitId}.correct`]: -1,
                        [`${unitKey}.subunits.${subunitId}.wrong`]: 1,
                    }),
                };
                update.$addToSet = {
                    [`${unitKey}.wrongIds`]: questionId,
                    ...(subunitId && {
                        [`${unitKey}.subunits.${subunitId}.wrongIds`]: questionId,
                    }),
                };
            }
        }

        bulkOps.push({
            updateOne: {
                filter: { user: userId, course: courseId, part: partId, publisher: publisherId },
                update,
            },
        });
    }

    if (bulkOps.length > 0) {
        await UserProgress.bulkWrite(bulkOps, { ordered: false });
    }
};

const getUnitProgress = async (userId, courseId, partId, publisherId, unitId) => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId
    });

    if (!progressDoc) return null;

    const unitStat = progressDoc.progress.get(unitId);
    if (!unitStat) return null;

    const statObj = unitStat.toObject ? unitStat.toObject() : unitStat;

    return {
        unitId,
        totalQuestions: statObj.totalQuestions,
        attempted: statObj.attempted,
        unattempted: statObj.totalQuestions - statObj.attempted,
        correct: statObj.correct,
        wrong: statObj.wrong,
        lastAttemptedQ: statObj.lastAttemptedQ,
    };
};


const getAllUnitsProgress = async (userId, courseId, partId, publisherId) => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId
    });

    if (!progressDoc) return {};

    const result = {};

    for (const [unitId, stat] of progressDoc.progress.entries()) {
        const statObj = stat.toObject();

        result[unitId] = {
            unitId,
            totalQuestions: statObj.totalQuestions,
            attempted: statObj.attempted,
            unattempted: statObj.totalQuestions - statObj.attempted,
            correct: statObj.correct,
            wrong: statObj.wrong,
            lastAttemptedQ: statObj.lastAttemptedQ,
        };
    }

    return result;
};

// service function to get all subunit progress of a specific unit
const getAllSubunitsProgress = async (userId, courseId, partId, publisherId, unitId) => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId
    });

    if (!progressDoc) return {};

    const unitProgress = progressDoc.progress.get(unitId);
    if (!unitProgress) return {};

    const subunits = unitProgress.subunits || new Map();
    const result = {};

    for (const [subunitId, subStat] of subunits.entries()) {
        const statObj = subStat.toObject ? subStat.toObject() : subStat;

        result[subunitId] = {
            subunitId,
            totalQuestions: statObj.totalQuestions,
            attempted: statObj.attempted,
            unattempted: statObj.totalQuestions - statObj.attempted,
            correct: statObj.correct,
            wrong: statObj.wrong,
            lastAttemptedQ: statObj.lastAttemptedQ,
        };
    }

    return result;
};

const getContinueSession = async (userId, courseId, partId, publisherId, unitId) => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId
    });

    const excludeIds = progressDoc?.progress?.get(unitId)?.attemptedIds ?? [];

    const questions = await Question.find({
        unit: unitId,
        _id: { $nin: excludeIds },
    });

    if (!questions.length) throw Object.assign(new Error("No remaining questions found!"), { code: 404 });

    return questions;
};

const getStartOverSession = async (userId, courseId, partId, publisherId, unitId) => {
    const doc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId
    });

    if (!doc) return;


    const unit = doc.progress?.get(unitId);
    if (!unit) return;


    const updateQuery = {
        [`progress.${unitId}.attempted`]: 0,
        [`progress.${unitId}.correct`]: 0,
        [`progress.${unitId}.wrong`]: 0,
        [`progress.${unitId}.attemptedIds`]: [],
        [`progress.${unitId}.wrongIds`]: [],
        [`progress.${unitId}.lastAttemptedQ`]: null,
    };


    if (unit.subunits && unit.subunits.size > 0) {
        for (const [subId, subunit] of unit.subunits.entries()) {
            const key = subId.toString();

            updateQuery[`progress.${unitId}.subunits.${key}.attempted`] = 0;
            updateQuery[`progress.${unitId}.subunits.${key}.correct`] = 0;
            updateQuery[`progress.${unitId}.subunits.${key}.wrong`] = 0;
            updateQuery[`progress.${unitId}.subunits.${key}.attemptedIds`] = [];
            updateQuery[`progress.${unitId}.subunits.${key}.wrongIds`] = [];
            updateQuery[`progress.${unitId}.subunits.${key}.lastAttemptedQ`] = null;


            updateQuery[`progress.${unitId}.subunits.${key}.totalQuestions`] =
                subunit.totalQuestions || 0;
        }
    }


    await UserProgress.updateOne(
        { user: userId, course: courseId, part: partId, publisher: publisherId },
        { $set: updateQuery }
    );


    const questions = await Question.find({ unit: unitId });

    if (!questions.length) {
        throw Object.assign(new Error("No questions found!"), { code: 404 });
    }

    return questions;
};


const getWrongOnlySession = async (userId, courseId, partId, publisherId, unitId) => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId
    });

    const wrongIds = progressDoc?.progress?.get(unitId)?.wrongIds ?? [];

    if (!wrongIds.length) throw Object.assign(new Error("No wrong answers found!"), { code: 404 });

    return await Question.find({ _id: { $in: wrongIds } });
};

module.exports = {
    recordAnswer,
    getAllUnitsProgress,
    getUnitProgress,
    getAllSubunitsProgress,
    getContinueSession,
    getStartOverSession,
    getWrongOnlySession,
};