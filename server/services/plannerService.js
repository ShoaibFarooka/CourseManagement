const mongoose = require("mongoose");
const StudyPlan = require("../models/studyPlanModel");
const Question = require("../models/questionModel");
const Course = require("../models/courseModel");
const Payment = require("../models/paymentModel");
const { buildLanguageFilter } = require("./progressService");

const DAY_MS = 24 * 60 * 60 * 1000;

const findPlan = (userId, courseId, partId, publisherId, language) =>
    StudyPlan.findOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    });

const notFound = (message) => Object.assign(new Error(message), { code: 404 });

// Resolves the publisher inside a course's part, or throws a 404.
const getPublisherStructure = async (courseId, partId, publisherId) => {
    const course = await Course.findById(courseId).lean();
    if (!course) throw notFound("Course not found");

    const part = course.parts?.find(p => p._id.toString() === partId.toString());
    if (!part) throw notFound("Course part not found");

    const publisher = part.publishers?.find(p => p._id.toString() === publisherId.toString());
    if (!publisher) throw notFound("Publisher not found");

    return { course, part, publisher };
};

// Splits the ordered questions into `dayCount` contiguous days of roughly equal
// workload. Each item carries a weight (number of answerable steps), so a day of
// long rapid/essay questions holds fewer questions than a day of MCQs.
const splitIntoDays = (items, dayCount) => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const days = Array.from({ length: dayCount }, () => []);

    let dayIndex = 0;
    let cumulative = 0;

    items.forEach((item, i) => {
        const remainingItems = items.length - i;
        const daysAfterCurrent = dayCount - 1 - dayIndex;

        // Move on when this item's midpoint falls past the day's share of the total
        // workload (so heavy items land on whichever day they overlap most), or when
        // only enough items are left to give every remaining day one.
        const dayBoundary = (totalWeight * (dayIndex + 1)) / dayCount;
        const shouldAdvance =
            days[dayIndex].length > 0 &&
            dayIndex < dayCount - 1 &&
            (cumulative + item.weight / 2 > dayBoundary ||
                remainingItems <= daysAfterCurrent);

        if (shouldAdvance) dayIndex += 1;

        days[dayIndex].push(item._id);
        cumulative += item.weight;
    });

    return days;
};

const buildDaySummary = (day, index, days) => {
    const total = day.questions.length;
    const completed = day.completedIds.length;
    const isCompleted = total > 0 && completed >= total;
    const previous = days[index - 1];
    const isUnlocked =
        index === 0 ||
        (previous.questions.length > 0 &&
            previous.completedIds.length >= previous.questions.length);

    return {
        dayNumber: day.dayNumber,
        date: day.date,
        totalQuestions: total,
        completedQuestions: completed,
        progress: total === 0 ? 0 : Math.round((completed / total) * 100),
        isCompleted,
        isUnlocked,
    };
};

const buildPlanSummary = (plan) => {
    const days = plan.days.map((day, index) => buildDaySummary(day, index, plan.days));

    const totalQuestions = days.reduce((sum, d) => sum + d.totalQuestions, 0);
    const completedQuestions = days.reduce((sum, d) => sum + d.completedQuestions, 0);
    const currentDay =
        days.find(d => d.isUnlocked && !d.isCompleted)?.dayNumber ?? null;

    return {
        _id: plan._id,
        courseId: plan.course,
        partId: plan.part,
        publisherId: plan.publisher,
        language: plan.language,
        duration: plan.duration,
        startDate: plan.startDate,
        totalDays: days.length,
        totalQuestions,
        completedQuestions,
        progress: totalQuestions === 0 ? 0 : Math.round((completedQuestions / totalQuestions) * 100),
        completedDays: days.filter(d => d.isCompleted).length,
        currentDay,
        isCompleted: days.length > 0 && days.every(d => d.isCompleted),
        days,
    };
};

// Course parts the user can build a plan for: active, non-cancelled purchases only.
const getPlannerCourses = async (userId) => {
    const payments = await Payment.find({
        user: userId,
        isCancelled: { $ne: true },
        expiryDate: { $gt: new Date() },
    }).lean();

    if (!payments.length) return [];

    const purchasedParts = new Set(
        payments.map(p => `${p.course.toString()}|${p.part.toString()}`)
    );
    const courseIds = [...new Set(payments.map(p => p.course.toString()))];

    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    return courses
        .map(course => ({
            id: course._id,
            name: course.name,
            timeRatio: course.timeRatio,
            parts: (course.parts || [])
                .filter(part => purchasedParts.has(`${course._id.toString()}|${part._id.toString()}`))
                .map(part => ({
                    id: part._id,
                    name: part.name,
                    publishers: (part.publishers || []).map(pub => ({
                        _id: pub._id,
                        name: pub.name,
                    })),
                })),
        }))
        .filter(course => course.parts.length > 0);
};

const getPlan = async (userId, courseId, partId, publisherId, language = "eng") => {
    const plan = await findPlan(userId, courseId, partId, publisherId, language).lean();
    return plan ? buildPlanSummary(plan) : null;
};

const createPlan = async (userId, courseId, partId, publisherId, duration, language = "eng") => {
    const existing = await findPlan(userId, courseId, partId, publisherId, language).lean();
    if (existing) {
        const error = new Error(
            "You already have a plan for this course, part and publisher. Reset it to create a new one."
        );
        error.code = 409;
        throw error;
    }

    const { publisher } = await getPublisherStructure(courseId, partId, publisherId);

    // Syllabus order: the position of each unit/subunit in the course structure.
    const unitOrder = new Map();
    const subunitOrder = new Map();
    (publisher.units || []).forEach((unit, unitIndex) => {
        unitOrder.set(unit._id.toString(), unitIndex);
        (unit.subunits || []).forEach((sub, subIndex) => {
            subunitOrder.set(sub._id.toString(), subIndex);
        });
    });

    const questions = await Question.aggregate([
        {
            $match: {
                course: new mongoose.Types.ObjectId(courseId),
                part: new mongoose.Types.ObjectId(partId),
                publisher: new mongoose.Types.ObjectId(publisherId),
                ...buildLanguageFilter(language),
            },
        },
        {
            $project: {
                unit: 1,
                subunit: 1,
                createdAt: 1,
                weight: {
                    $cond: [
                        { $eq: ["$type", "mcq"] },
                        1,
                        { $max: [1, { $size: { $ifNull: ["$subquestions", []] } }] },
                    ],
                },
            },
        },
    ]);

    if (!questions.length) {
        throw notFound("No questions found for this publisher.");
    }

    // Questions whose unit/subunit no longer exists in the structure go last.
    const orderOf = (map, id) => map.get(id?.toString()) ?? Number.MAX_SAFE_INTEGER;
    questions.sort((a, b) =>
        orderOf(unitOrder, a.unit) - orderOf(unitOrder, b.unit) ||
        orderOf(subunitOrder, a.subunit) - orderOf(subunitOrder, b.subunit) ||
        new Date(a.createdAt) - new Date(b.createdAt) ||
        a._id.toString().localeCompare(b._id.toString())
    );

    // Never create empty days: a publisher with fewer questions than the period gets
    // one question per day.
    const dayCount = Math.min(duration, questions.length);
    const dayQuestions = splitIntoDays(questions, dayCount);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    try {
        const plan = await StudyPlan.create({
            user: userId,
            course: courseId,
            part: partId,
            publisher: publisherId,
            language,
            duration,
            startDate,
            days: dayQuestions.map((ids, index) => ({
                dayNumber: index + 1,
                date: new Date(startDate.getTime() + index * DAY_MS),
                questions: ids,
                completedIds: [],
            })),
        });

        return buildPlanSummary(plan.toObject());
    } catch (err) {
        // The unique index caught a concurrent create; remap so the controller doesn't
        // send Mongo's 11000 as an HTTP status.
        if (err.code === 11000) {
            const error = new Error("A plan for this selection already exists.");
            error.code = 409;
            throw error;
        }
        throw err;
    }
};

const getPlanDay = async (userId, courseId, partId, publisherId, dayNumber, language) => {
    const plan = await findPlan(userId, courseId, partId, publisherId, language).lean();
    if (!plan) throw notFound("Study plan not found");

    const index = plan.days.findIndex(d => d.dayNumber === Number(dayNumber));
    if (index === -1) throw notFound("Plan day not found");

    return { plan, day: plan.days[index], summary: buildDaySummary(plan.days[index], index, plan.days) };
};

// Questions for one day. Returns the ones still to do, so re-opening a day resumes it;
// a completed day returns all of its questions for review.
const getDayQuestions = async (userId, courseId, partId, publisherId, dayNumber, language = "eng") => {
    const { day, summary } = await getPlanDay(userId, courseId, partId, publisherId, dayNumber, language);

    if (!summary.isUnlocked) {
        const error = new Error(`Complete Day ${summary.dayNumber - 1} to unlock this day.`);
        error.code = 403;
        throw error;
    }

    const completed = new Set(day.completedIds.map(id => id.toString()));
    const targetIds = summary.isCompleted
        ? day.questions
        : day.questions.filter(id => !completed.has(id.toString()));

    const questions = await Question.find({ _id: { $in: targetIds } }).lean();

    // $in does not keep order; restore the plan's syllabus order.
    const byId = new Map(questions.map(q => [q._id.toString(), q]));
    const ordered = targetIds.map(id => byId.get(id.toString())).filter(Boolean);

    return { questions: ordered, day: summary };
};

const recordDayProgress = async (userId, courseId, partId, publisherId, dayNumber, questionIds, language = "eng") => {
    const { plan, day, summary } = await getPlanDay(userId, courseId, partId, publisherId, dayNumber, language);

    if (!summary.isUnlocked) {
        const error = new Error("This day is still locked.");
        error.code = 403;
        throw error;
    }

    // Only questions that belong to this day count towards it.
    const dayQuestionIds = new Set(day.questions.map(id => id.toString()));
    const validIds = [...new Set(questionIds.map(String))]
        .filter(id => dayQuestionIds.has(id))
        .map(id => new mongoose.Types.ObjectId(id));

    if (validIds.length) {
        await StudyPlan.updateOne(
            { _id: plan._id, "days.dayNumber": day.dayNumber },
            { $addToSet: { "days.$.completedIds": { $each: validIds } } }
        );
    }

    return getPlan(userId, courseId, partId, publisherId, language);
};

const resetPlan = async (userId, courseId, partId, publisherId, language = "eng") => {
    const result = await StudyPlan.deleteOne({
        user: userId,
        course: courseId,
        part: partId,
        publisher: publisherId,
        language,
    });

    if (result.deletedCount === 0) throw notFound("Study plan not found");
};

module.exports = {
    getPlannerCourses,
    getPlan,
    createPlan,
    getDayQuestions,
    recordDayProgress,
    resetPlan,
};
