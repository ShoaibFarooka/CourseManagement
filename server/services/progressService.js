const UserProgress = require("../models/userProgressModel");
const Question = require('../models/questionModel');
const MarkedQuestion = require("../models/markedQuestionModel");
const mongoose = require("mongoose");
const { Types } = mongoose;

const buildLanguageFilter = (language = "eng") => {
    if (language === "eng") {
        return {
            $or: [
                { language: "eng" },
                { language: { $exists: false } },
                { language: null }
            ]
        };
    }
    return { language };
};

// Filter for the user's marked questions inside the selected units, narrowed to the
// chosen subunits of a unit when there are any.
// $and because both the unit list and the English language filter use $or.
const buildMarkedFilter = (userId, selectedUnits = [], selectedSubunits = {}, language = "eng") => ({
    user: userId,
    $and: [
        {
            $or: selectedUnits.map(unitId => {
                const subs = selectedSubunits?.[unitId] || [];
                return subs.length ? { unit: unitId, subunit: { $in: subs } } : { unit: unitId };
            }),
        },
        buildLanguageFilter(language),
    ],
});

const countMarked = (userId, selectedUnits, selectedSubunits, language) => {
    if (!selectedUnits?.length) return 0;
    return MarkedQuestion.countDocuments(
        buildMarkedFilter(userId, selectedUnits, selectedSubunits, language)
    );
};

const initializeUnitStat = async (userId, courseId, partId, publisherId, unitId, language = "eng") => {
    const totalQuestions = await Question.countDocuments({
        unit: unitId,
        ...buildLanguageFilter(language)
    });

    await UserProgress.findOneAndUpdate(
        {
            user: userId,
            course: courseId,
            part: partId,
            publisher: publisherId,
            language
        },
        {
            $setOnInsert: {
                user: userId,
                course: courseId,
                part: partId,
                publisher: publisherId,
                language,
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
            language,
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

// Attempting a marked question moves it out of "marked": it now counts as correct or
// incorrect instead. Only marks made before the answer are removed, so a user who
// answers and then marks the question again (answers reach us in batches, marks
// immediately) keeps the new mark.
//
// answeredAt comes from the client's clock. sentAt (the client's clock when the batch
// was sent) lets us shift it onto the server clock, so a wrong device clock can't make
// a mark survive or vanish incorrectly.
const clearMarksForAnswers = async (userId, answers, sentAt) => {
    const serverNow = Date.now();
    const clockOffset = sentAt ? serverNow - new Date(sentAt).getTime() : 0;

    const answeredAtByQuestion = new Map();
    for (const ans of answers) {
        const answeredAt = ans.answeredAt
            ? Math.min(new Date(ans.answeredAt).getTime() + clockOffset, serverNow)
            : serverNow;
        const key = ans.questionId.toString();
        answeredAtByQuestion.set(key, Math.max(answeredAtByQuestion.get(key) ?? 0, answeredAt));
    }

    const ops = [...answeredAtByQuestion].map(([questionId, answeredAt]) => ({
        deleteOne: {
            filter: { user: userId, question: questionId, createdAt: { $lte: new Date(answeredAt) } },
        },
    }));

    if (ops.length) await MarkedQuestion.bulkWrite(ops, { ordered: false });
};

const recordAnswer = async (userId, answers, language = "eng", sentAt = null) => {
    const groupMap = new Map();
    for (const ans of answers) {
        const key = `${ans.courseId}|${ans.partId}|${ans.publisherId}`;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(ans);
    }

    const results = await Promise.allSettled(
        [...groupMap.entries()].map(([key, groupAnswers]) =>
            processBatchGroup(userId, groupAnswers, language)
        )
    );

    const failed = results.filter(r => r.status === "rejected");
    if (failed.length > 0) {
        failed.forEach(f => console.error("processBatchGroup failed:", f.reason));
        throw new Error("One or more progress groups failed to save");
    }

    await clearMarksForAnswers(userId, answers, sentAt);
};

const processBatchGroup = async (userId, answers, language = "eng") => {
    const { courseId, partId, publisherId } = answers[0];

    const questionIds = [...new Set(answers.map(a => a.questionId))];

    const questions = await Question.find(
        { _id: { $in: questionIds } },
        { _id: 1, unit: 1, subunit: 1 }
    ).lean();

    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));


    const unitToSubunitIds = new Map();
    for (const ans of answers) {
        const question = questionMap.get(ans.questionId.toString());
        if (!question || !question.subunit) continue;

        const unitKeyStr = ans.unitId.toString();
        const subunitKeyStr = question.subunit.toString();

        if (!unitToSubunitIds.has(unitKeyStr)) {
            unitToSubunitIds.set(unitKeyStr, new Set());
        }
        unitToSubunitIds.get(unitKeyStr).add(subunitKeyStr);
    }

    let progressDoc = await UserProgress.findOneAndUpdate(
        {
            user: userId,
            course: courseId,
            part: partId,
            publisher: publisherId,
            language
        },
        {
            $setOnInsert: {
                user: userId,
                course: courseId,
                part: partId,
                publisher: publisherId,
                language,
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

    const languageFilter = buildLanguageFilter(language);

    const [unitCounts, subunitCounts] = await Promise.all([
        Question.aggregate([
            { $match: { unit: { $in: unitIds }, ...languageFilter } },
            { $group: { _id: "$unit", total: { $sum: 1 } } }
        ]),
        Question.aggregate([
            { $match: { subunit: { $in: subunitIds }, ...languageFilter } },
            { $group: { _id: "$subunit", total: { $sum: 1 } } }
        ])
    ]);

    const unitTotalMap = new Map(unitCounts.map(u => [u._id.toString(), u.total]));
    const subunitTotalMap = new Map(subunitCounts.map(s => [s._id.toString(), s.total]));

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

        const relevantSubunitIds = unitToSubunitIds.get(unitKeyStr) || new Set();

        for (const subunitKeyStr of relevantSubunitIds) {
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
                filter: { user: userId, course: courseId, part: partId, publisher: publisherId, language },
                update,
            },
        });
    }

    if (bulkOps.length > 0) {
        await UserProgress.bulkWrite(bulkOps, { ordered: false });
    }
};

const getUnitProgress = async (
    userId,
    courseId,
    partId,
    publisherId,
    unitId,
    selectedSubunits = [],
    language = 'eng'
) => {

    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    });

    const unitStat = progressDoc?.progress?.get(unitId);

    const hasSubunitFilter =
        Array.isArray(selectedSubunits) &&
        selectedSubunits.length > 0;

    const marked = await countMarked(
        userId,
        [unitId],
        hasSubunitFilter ? { [unitId]: selectedSubunits } : {},
        language
    );

    if (hasSubunitFilter) {

        const query = {
            unit: unitId,
            ...buildLanguageFilter(language),
            subunit: { $in: selectedSubunits }
        };

        const totalQuestions = await Question.countDocuments(query);

        let attempted = 0;
        let correct = 0;
        let wrong = 0;
        let lastAttemptedQ = null;

        if (unitStat?.subunits) {

            selectedSubunits.forEach((subunitId) => {

                const subStat = unitStat.subunits.get(subunitId);

                if (!subStat) return;

                attempted += subStat.attempted || 0;
                correct += subStat.correct || 0;
                wrong += subStat.wrong || 0;

                if (subStat.lastAttemptedQ) {
                    lastAttemptedQ = subStat.lastAttemptedQ;
                }
            });
        }

        return {
            unitId,
            totalQuestions,
            attempted,
            correct,
            wrong,
            unattempted: totalQuestions - attempted,
            lastAttemptedQ,
            marked
        };
    }


    const fallbackTotal = await Question.countDocuments({
        unit: unitId,
        ...buildLanguageFilter(language)
    });

    if (!unitStat) {
        return {
            unitId,
            totalQuestions: fallbackTotal,
            attempted: 0,
            correct: 0,
            wrong: 0,
            unattempted: fallbackTotal,
            lastAttemptedQ: null,
            marked,
        };
    }

    const statObj = unitStat.toObject ? unitStat.toObject() : unitStat;

    return {
        unitId,
        totalQuestions: statObj.totalQuestions || fallbackTotal,
        attempted: statObj.attempted || 0,
        correct: statObj.correct || 0,
        wrong: statObj.wrong || 0,
        unattempted:
            (statObj.totalQuestions || fallbackTotal) -
            (statObj.attempted || 0),
        lastAttemptedQ: statObj.lastAttemptedQ || null,
        marked,
    };
};



const getAllUnitsProgress = async (userId, courseId, partId, publisherId, language = "eng") => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
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


const getSelectedUnitsProgress = async (
    userId,
    courseId,
    partId,
    publisherId,
    selectedUnits,
    selectedSubunits,
    language = "eng"
) => {

    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    });

    let totalQuestions = 0;
    let attempted = 0;
    let correct = 0;
    let wrong = 0;

    for (const unitId of selectedUnits) {

        const chosenSubunits =
            selectedSubunits?.[unitId] || [];

        const query = {
            unit: unitId,
            ...buildLanguageFilter(language)
        };

        if (chosenSubunits.length > 0) {
            query.subunit = { $in: chosenSubunits };
        }

        totalQuestions += await Question.countDocuments(query);

        const unitStat = progressDoc?.progress?.get(unitId);

        if (!unitStat) continue;

        if (chosenSubunits.length > 0) {

            chosenSubunits.forEach(subId => {

                const subStat =
                    unitStat.subunits?.get(subId);

                if (!subStat) return;

                attempted += subStat.attempted || 0;
                correct += subStat.correct || 0;
                wrong += subStat.wrong || 0;
            });

        } else {

            attempted += unitStat.attempted || 0;
            correct += unitStat.correct || 0;
            wrong += unitStat.wrong || 0;
        }
    }

    const marked = await countMarked(userId, selectedUnits, selectedSubunits, language);

    return {
        totalQuestions,
        attempted,
        correct,
        wrong,
        unattempted: totalQuestions - attempted,
        marked
    };
};

const getAllSubunitsProgress = async (userId, courseId, partId, publisherId, unitId, language = "eng") => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
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


const buildUnitConditions = (selectedUnits = [], selectedSubunits = {}) => {
    return selectedUnits.map((unitId) => {
        const unitObjectId = mongoose.Types.ObjectId.createFromHexString(unitId);
        const subs = selectedSubunits?.[unitId];

        if (!subs || subs.length === 0) {
            return { unit: unitObjectId };
        }

        const subObjectIds = subs.map((id) =>
            mongoose.Types.ObjectId.createFromHexString(id)
        );

        return {
            unit: unitObjectId,
            $or: [
                { subunit: { $in: subObjectIds } },
                { subunit: { $exists: false } },
                { subunit: null },
            ],
        };
    });
};


const distributeLimit = (unitCounts, totalLimit) => {
    const total = Object.values(unitCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return {};

    const allocated = {};
    let remaining = totalLimit;
    const unitIds = Object.keys(unitCounts);

    unitIds.forEach((unitId, i) => {
        if (i === unitIds.length - 1) {
            // give remainder to last unit to avoid rounding loss
            allocated[unitId] = remaining;
        } else {
            const share = Math.round((unitCounts[unitId] / total) * totalLimit);
            allocated[unitId] = share;
            remaining -= share;
        }
    });

    return allocated;
};

const getContinueSession = async ({
    userId,
    courseId,
    partId,
    publisherId,
    selectedUnits = [],
    selectedSubunits = {},
    language = "eng",
    questionLimit = null,
}) => {
    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    });

    // collect attempted IDs per unit from progress
    const attemptedByUnit = {};
    for (const unitId of selectedUnits) {
        const unit = progressDoc?.progress?.get(unitId);
        attemptedByUnit[unitId] = unit?.attemptedIds?.map(String) || [];
    }

    const unitConditions = buildUnitConditions(selectedUnits, selectedSubunits);
    const langFilter = buildLanguageFilter(language);

    if (!questionLimit) {
        // no limit — fetch all unattempted across all units in one query
        const allAttempted = Object.values(attemptedByUnit).flat();
        const excludeObjectIds = allAttempted.map((id) =>
            mongoose.Types.ObjectId.createFromHexString(id)
        );

        const questions = await Question.find({
            $and: [
                { $or: unitConditions },
                { _id: { $nin: excludeObjectIds } },
                langFilter,
            ],
        }).lean();

        if (!questions.length) {
            throw Object.assign(new Error("No remaining questions found!"), { code: 404 });
        }

        return questions;
    }

    // with limit — fetch proportionally per unit
    // first count available (unattempted) questions per unit
    const unitCounts = {};
    for (const unitId of selectedUnits) {
        const subs = selectedSubunits?.[unitId];
        const unitObjId = mongoose.Types.ObjectId.createFromHexString(unitId);
        const excludeObjectIds = attemptedByUnit[unitId].map((id) =>
            mongoose.Types.ObjectId.createFromHexString(id)
        );

        const unitQuery = subs?.length
            ? {
                unit: unitObjId,
                $or: [
                    { subunit: { $in: subs.map((id) => mongoose.Types.ObjectId.createFromHexString(id)) } },
                    { subunit: { $exists: false } },
                    { subunit: null },
                ],
                _id: { $nin: excludeObjectIds },
                ...langFilter,
            }
            : { unit: unitObjId, _id: { $nin: excludeObjectIds }, ...langFilter };

        unitCounts[unitId] = await Question.countDocuments(unitQuery);
    }

    const allocation = distributeLimit(unitCounts, questionLimit);

    const allQuestions = [];
    for (const unitId of selectedUnits) {
        const cap = allocation[unitId];
        if (!cap || cap <= 0) continue;

        const subs = selectedSubunits?.[unitId];
        const unitObjId = mongoose.Types.ObjectId.createFromHexString(unitId);
        const excludeObjectIds = attemptedByUnit[unitId].map((id) =>
            mongoose.Types.ObjectId.createFromHexString(id)
        );

        const unitQuery = subs?.length
            ? {
                unit: unitObjId,
                $or: [
                    { subunit: { $in: subs.map((id) => mongoose.Types.ObjectId.createFromHexString(id)) } },
                    { subunit: { $exists: false } },
                    { subunit: null },
                ],
                _id: { $nin: excludeObjectIds },
                ...langFilter,
            }
            : { unit: unitObjId, _id: { $nin: excludeObjectIds }, ...langFilter };

        const qs = await Question.find(unitQuery).limit(cap).lean();
        allQuestions.push(...qs);
    }

    if (!allQuestions.length) {
        throw Object.assign(new Error("No remaining questions found!"), { code: 404 });
    }

    return allQuestions;
};


const getStartOverSession = async ({
    userId,
    courseId,
    partId,
    publisherId,
    selectedUnits = [],
    selectedSubunits = {},
    language = "eng",
    questionLimit = null,
}) => {
    const doc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    });

    if (doc) {
        const updateQuery = {};

        for (const unitId of selectedUnits) {
            const unit = doc.progress?.get(unitId);
            if (!unit) continue;

            updateQuery[`progress.${unitId}.attempted`] = 0;
            updateQuery[`progress.${unitId}.correct`] = 0;
            updateQuery[`progress.${unitId}.wrong`] = 0;
            updateQuery[`progress.${unitId}.attemptedIds`] = [];
            updateQuery[`progress.${unitId}.wrongIds`] = [];
            updateQuery[`progress.${unitId}.lastAttemptedQ`] = null;

            const selectedSubs = selectedSubunits?.[unitId] || [];
            if (unit.subunits?.size > 0) {
                for (const [subId] of unit.subunits.entries()) {
                    const key = subId.toString();
                    if (selectedSubs.length === 0 || selectedSubs.includes(key)) {
                        updateQuery[`progress.${unitId}.subunits.${key}.attempted`] = 0;
                        updateQuery[`progress.${unitId}.subunits.${key}.correct`] = 0;
                        updateQuery[`progress.${unitId}.subunits.${key}.wrong`] = 0;
                        updateQuery[`progress.${unitId}.subunits.${key}.attemptedIds`] = [];
                        updateQuery[`progress.${unitId}.subunits.${key}.wrongIds`] = [];
                        updateQuery[`progress.${unitId}.subunits.${key}.lastAttemptedQ`] = null;
                    }
                }
            }
        }

        if (Object.keys(updateQuery).length) {
            await UserProgress.updateOne(
                { user: userId, course: courseId, part: partId, publisher: publisherId, language },
                { $set: updateQuery }
            );
        }
    }

    const langFilter = buildLanguageFilter(language);
    const unitConditions = buildUnitConditions(selectedUnits, selectedSubunits);

    if (!questionLimit) {
        const questions = await Question.find({
            $and: [{ $or: unitConditions }, langFilter],
        }).lean();

        if (!questions.length) {
            throw Object.assign(new Error("No questions found!"), { code: 404 });
        }

        return questions;
    }

    // proportional fetch per unit
    const unitCounts = {};
    for (const unitId of selectedUnits) {
        const subs = selectedSubunits?.[unitId];
        const unitObjId = mongoose.Types.ObjectId.createFromHexString(unitId);

        const unitQuery = subs?.length
            ? {
                unit: unitObjId,
                $or: [
                    { subunit: { $in: subs.map((id) => mongoose.Types.ObjectId.createFromHexString(id)) } },
                    { subunit: { $exists: false } },
                    { subunit: null },
                ],
                ...langFilter,
            }
            : { unit: unitObjId, ...langFilter };

        unitCounts[unitId] = await Question.countDocuments(unitQuery);
    }

    const allocation = distributeLimit(unitCounts, questionLimit);
    const allQuestions = [];

    for (const unitId of selectedUnits) {
        const cap = allocation[unitId];
        if (!cap || cap <= 0) continue;

        const subs = selectedSubunits?.[unitId];
        const unitObjId = mongoose.Types.ObjectId.createFromHexString(unitId);

        const unitQuery = subs?.length
            ? {
                unit: unitObjId,
                $or: [
                    { subunit: { $in: subs.map((id) => mongoose.Types.ObjectId.createFromHexString(id)) } },
                    { subunit: { $exists: false } },
                    { subunit: null },
                ],
                ...langFilter,
            }
            : { unit: unitObjId, ...langFilter };

        const qs = await Question.find(unitQuery).limit(cap).lean();
        allQuestions.push(...qs);
    }

    if (!allQuestions.length) {
        throw Object.assign(new Error("No questions found!"), { code: 404 });
    }

    return allQuestions;
};

const getLimitedSession = async ({
    userId,
    courseId,
    partId,
    publisherId,
    selectedUnits = [],
    selectedSubunits = {},
    language = "eng",
    questionLimit = null,
}) => {

    if (!questionLimit || questionLimit <= 0) {
        throw Object.assign(
            new Error("Question limit is required"),
            { code: 400 }
        );
    }

    const langFilter = buildLanguageFilter(language);

    // STEP 1: count available questions per unit
    const unitCounts = {};

    for (const unitId of selectedUnits) {

        const unitObjId =
            mongoose.Types.ObjectId.createFromHexString(unitId);

        const subs = selectedSubunits?.[unitId];

        const query = {
            unit: unitObjId,

            ...(subs?.length
                ? {
                    $or: [
                        {
                            subunit: {
                                $in: subs.map(id =>
                                    mongoose.Types.ObjectId.createFromHexString(id)
                                )
                            }
                        },
                        { subunit: { $exists: false } },
                        { subunit: null },
                    ],
                }
                : {}),

            ...langFilter,
        };

        unitCounts[unitId] = await Question.countDocuments(query);
    }

    // STEP 2: distribute limit proportionally
    const allocation = distributeLimit(unitCounts, questionLimit);

    const questions = [];

    // STEP 3: fetch RANDOM questions proportionally per unit
    for (const unitId of selectedUnits) {

        const cap = allocation[unitId];

        if (!cap || cap <= 0) continue;

        const unitObjId =
            mongoose.Types.ObjectId.createFromHexString(unitId);

        const subs = selectedSubunits?.[unitId];

        const matchQuery = {
            unit: unitObjId,

            ...(subs?.length
                ? {
                    $or: [
                        {
                            subunit: {
                                $in: subs.map(id =>
                                    mongoose.Types.ObjectId.createFromHexString(id)
                                )
                            }
                        },
                        { subunit: { $exists: false } },
                        { subunit: null },
                    ],
                }
                : {}),

            ...langFilter,
        };

        const qs = await Question.aggregate([
            { $match: matchQuery },
            { $sample: { size: cap } }
        ]);

        questions.push(...qs);
    }

    // STEP 4: final shuffle so units are mixed together
    questions.sort(() => Math.random() - 0.5);

    if (!questions.length) {
        throw Object.assign(
            new Error("No questions found for limited session"),
            { code: 404 }
        );
    }

    return questions;
};


const getWrongOnlySession = async ({
    userId,
    courseId,
    partId,
    publisherId,
    selectedUnits = [],
    selectedSubunits = {},
    language = "eng",
    questionLimit = null,
}) => {

    const progressDoc = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    });

    if (!progressDoc) {
        throw Object.assign(new Error("No wrong answers found!"), { code: 404 });
    }

    const wrongByUnit = {};

    // STEP 1: collect wrong IDs per unit
    for (const unitId of selectedUnits) {
        const unit = progressDoc.progress?.get(unitId);

        if (!unit?.wrongIds?.length) {
            wrongByUnit[unitId] = [];
            continue;
        }

        const selectedSubs = selectedSubunits?.[unitId] || [];

        if (!selectedSubs.length) {
            wrongByUnit[unitId] = unit.wrongIds.map(String);
        } else {
            const subWrongIds = [];

            for (const subId of selectedSubs) {
                const sub = unit.subunits?.get(subId);

                if (sub?.wrongIds?.length) {
                    subWrongIds.push(...sub.wrongIds.map(String));
                }
            }

            wrongByUnit[unitId] = subWrongIds;
        }
    }

    // STEP 2: flatten all wrong IDs
    const allWrongIds = Object.values(wrongByUnit).flat();

    if (!allWrongIds.length) {
        throw Object.assign(new Error("No wrong answers found!"), { code: 404 });
    }

    // STEP 3: remove duplicates (IMPORTANT FIX)
    const uniqueWrongIds = [...new Set(allWrongIds)];

    // STEP 4: apply limit globally (not per unit)
    const finalWrongIds = questionLimit
        ? uniqueWrongIds.slice(0, questionLimit)
        : uniqueWrongIds;

    const langFilter = buildLanguageFilter(language);

    // STEP 5: fetch questions in one query
    const questions = await Question.find({
        _id: {
            $in: finalWrongIds.map((id) =>
                mongoose.Types.ObjectId.createFromHexString(id)
            )
        },
        ...langFilter,
    }).lean();

    if (!questions.length) {
        throw Object.assign(new Error("No wrong answers found!"), { code: 404 });
    }

    return questions;
};


// Marks or unmarks a question for the user. Idempotent: marking twice or unmarking an
// unmarked question is not an error.
const setQuestionMarked = async (userId, questionId, marked) => {
    if (!marked) {
        await MarkedQuestion.deleteOne({ user: userId, question: questionId });
        return { questionId, marked: false };
    }

    const question = await Question.findById(questionId, {
        course: 1, part: 1, publisher: 1, unit: 1, subunit: 1, language: 1,
    }).lean();

    if (!question) {
        throw Object.assign(new Error("Question not found"), { code: 404 });
    }

    await MarkedQuestion.updateOne(
        { user: userId, question: questionId },
        {
            $setOnInsert: {
                user: userId,
                question: questionId,
                course: question.course,
                part: question.part,
                publisher: question.publisher,
                unit: question.unit,
                subunit: question.subunit,
                language: question.language,
            },
        },
        { upsert: true }
    );

    return { questionId, marked: true };
};

// Which of the given questions the user has marked — lets the quiz show the saved
// state of the Mark button.
const getMarkedQuestionIds = async (userId, questionIds = []) => {
    if (!questionIds.length) return [];

    const marked = await MarkedQuestion.find(
        { user: userId, question: { $in: questionIds } },
        { question: 1 }
    ).lean();

    return marked.map(m => m.question.toString());
};

const getMarkedSession = async ({
    userId,
    selectedUnits = [],
    selectedSubunits = {},
    language = "eng",
    questionLimit = null,
}) => {
    if (!selectedUnits.length) {
        throw Object.assign(new Error("No marked questions found!"), { code: 404 });
    }

    // Oldest mark first, so questions come back in the order they were marked.
    let markedQuery = MarkedQuestion.find(
        buildMarkedFilter(userId, selectedUnits, selectedSubunits, language),
        { question: 1 }
    ).sort({ createdAt: 1 });

    if (questionLimit) markedQuery = markedQuery.limit(questionLimit);

    const marked = await markedQuery.lean();
    const ids = marked.map(m => m.question);

    const questions = await Question.find({ _id: { $in: ids } }).lean();

    // $in does not keep order; restore the marked order. A question deleted by the
    // admin after being marked simply drops out.
    const byId = new Map(questions.map(q => [q._id.toString(), q]));
    const ordered = ids.map(id => byId.get(id.toString())).filter(Boolean);

    if (!ordered.length) {
        throw Object.assign(new Error("No marked questions found!"), { code: 404 });
    }

    return ordered;
};

const buildStatSummary = (stat) => {
    const attempted = stat.attempted ?? 0;
    const correct = stat.correct ?? 0;
    const wrong = stat.wrong ?? 0;
    const total = stat.totalQuestions ?? 0;

    return {
        totalQuestions: total,
        attempted,
        correct,
        wrong,
        proficiency: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
    };
};

const buildEmptyUnitPerformance = () => ({
    totalQuestions: 0,
    attempted: 0,
    correct: 0,
    wrong: 0,
    proficiency: 0,
    subunits: {},
});

const getUnitPerformance = async (userId, courseId, partId, publisherId, unitId, language = "eng") => {
    const record = await UserProgress.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    }).lean();

    if (!record || !record.progress) {
        return buildEmptyUnitPerformance();
    }

    const progressMap = record.progress;
    const unitStat = progressMap[unitId];

    if (!unitStat) {
        return buildEmptyUnitPerformance();
    }

    const unit = buildStatSummary(unitStat);

    const subunits = {};
    const subunitMap = unitStat.subunits || {};

    Object.entries(subunitMap).forEach(([subunitId, subStat]) => {
        subunits[subunitId] = buildStatSummary(subStat);
    });

    return { ...unit, subunits };
};



module.exports = {
    buildLanguageFilter,
    recordAnswer,
    getAllUnitsProgress,
    getUnitProgress,
    getSelectedUnitsProgress,
    getAllSubunitsProgress,
    getContinueSession,
    getStartOverSession,
    getWrongOnlySession,
    getLimitedSession,
    getUnitPerformance,
    setQuestionMarked,
    getMarkedQuestionIds,
    getMarkedSession,
};