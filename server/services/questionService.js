const Question = require("../models/questionModel");
const Course = require("../models/courseModel");
const mongoose = require('mongoose');
const fs = require("fs");
const XLSX = require("xlsx");

const getAllQuestions = async ({
    course,
    part,
    publisher,
    unit,
    subunit,
    page = 1,
    limit = 5,
    types = [],
    languages = [],
}) => {
    const filter = {};

    // Convert IDs to ObjectIds and use correct field names
    if (course) filter.course = mongoose.Types.ObjectId.createFromHexString(course);
    if (part) filter.part = mongoose.Types.ObjectId.createFromHexString(part);
    if (publisher) filter.publisher = mongoose.Types.ObjectId.createFromHexString(publisher);
    if (unit) filter.unit = mongoose.Types.ObjectId.createFromHexString(unit);
    if (subunit) filter.subunit = mongoose.Types.ObjectId.createFromHexString(subunit);

    // Add type and language filters
    if (types.length > 0) filter.type = { $in: types };
    if (languages.length > 0) filter.language = { $in: languages };

    // Get total count
    const total = await Question.countDocuments(filter);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch questions with pagination
    const questions = await Question.find(filter)
        .lean()
        .skip(skip)
        .limit(limit);

    // Define sort order
    const typeOrder = { mcq: 1, rapid: 2, essay: 3 };
    const languageOrder = { eng: 1, ar: 2, fr: 3 };

    // Apply custom sorting
    questions.sort((a, b) => {
        const typeDiff = typeOrder[a.type] - typeOrder[b.type];
        if (typeDiff !== 0) return typeDiff;
        return languageOrder[a.language] - languageOrder[b.language];
    });

    return {
        questions,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    };
};



const addQuestion = async (data) => {
    try {
        const question = await Question.create(data);
        return question;
    } catch (err) {
        const error = new Error("Failed to create question.");
        error.code = 500;
        error.details = err;
        throw error;
    }
};

const updateQuestion = async (questionId, data) => {
    const question = await Question.findById(questionId);
    if (!question) {
        const error = new Error("Question not found.");
        error.code = 404;
        throw error;
    }

    try {
        Object.assign(question, data);
        const updated = await question.save();
        return updated;
    } catch (err) {
        const error = new Error("Failed to update question.");
        error.code = 500;
        error.details = err;
        throw error;
    }
};

const deleteQuestion = async (questionId) => {
    const deleted = await Question.findByIdAndDelete(questionId);
    if (!deleted) {
        const error = new Error("Question not found or already deleted.");
        error.code = 404;
        throw error;
    }
    return deleted;
};

const addMCQQuestionsFromFile = async (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
    });

    const questions = [];
    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                warnings.push({ rowNumber, reason: `Course not found: ${row["Course Name"]}` });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                warnings.push({ rowNumber, reason: `Part not found: ${row["Part Name"]}` });
                continue;
            }

            const publisher = part.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                warnings.push({ rowNumber, reason: `Publisher not found: ${row["Publisher Name"]}` });
                continue;
            }

            const unit = publisher.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) {
                warnings.push({ rowNumber, reason: `Unit not found: ${row["Unit Name"]}` });
                continue;
            }

            if (!Array.isArray(unit.type) || !unit.type.includes("mcq")) {
                warnings.push({ rowNumber, reason: `Unit does not support MCQ type questions` });
                continue;
            }

            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );
            if (!subunit) {
                warnings.push({ rowNumber, reason: `Subunit not found: ${row["Subunit Name"]}` });
                continue;
            }

            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: `Invalid Language. Must be 'eng', 'ar', or 'fr'` });
                continue;
            }

            const optionA = row["Option A"];
            const explanationA = row["Explanation A"];
            const optionB = row["Option B"];
            const explanationB = row["Explanation B"];
            const optionC = row["Option C"];
            const explanationC = row["Explanation C"];
            const optionD = row["Option D"];
            const explanationD = row["Explanation D"];
            const correctOption = row["Correct Option"]?.trim()?.toLowerCase();

            if (![optionA, optionB, optionC, optionD, explanationA, explanationB, explanationC, explanationD].every(Boolean)) {
                warnings.push({ rowNumber, reason: "Missing options or explanations" });
                continue;
            }

            if (!["a", "b", "c", "d"].includes(correctOption)) {
                warnings.push({ rowNumber, reason: `Correct Option must be one of a, b, c, d` });
                continue;
            }

            questions.push({
                type: "mcq",

                course: course._id,
                part: part._id,
                publisher: publisher._id,
                unit: unit._id,
                subunit: subunit._id,

                language,
                statement: row["Statement"]?.trim(),
                options: {
                    a: { option: optionA, explanation: explanationA },
                    b: { option: optionB, explanation: explanationB },
                    c: { option: optionC, explanation: explanationC },
                    d: { option: optionD, explanation: explanationD },
                },
                correctOption,
            });


        } catch (err) {
            warnings.push({ rowNumber, reason: `Unexpected error: ${err.message}` });
        }
    }

    if (questions.length > 0) {
        await Question.insertMany(questions);
    }

    console.log(`✅ ${questions.length} MCQ questions inserted.`);
    console.log("Warnings: ", warnings);

    return { warnings, addedQuestionsCount: questions.length };
};

const addRapidQuestionsFromFile = async (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    fs.unlink(filePath, (err) => { if (err) console.error(err); });

    const questions = [];
    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                warnings.push({ rowNumber, reason: `Course not found` });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                warnings.push({ rowNumber, reason: `Part not found` });
                continue;
            }

            const publisher = part.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                warnings.push({ rowNumber, reason: `Publisher not found` });
                continue;
            }

            const unit = publisher.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) {
                warnings.push({ rowNumber, reason: `Unit not found` });
                continue;
            }

            if (!Array.isArray(unit.type) || !unit.type.includes("rapid")) {
                warnings.push({ rowNumber, reason: `Unit does not support Rapid type questions` });
                continue;
            }

            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );
            if (!subunit) {
                warnings.push({ rowNumber, reason: `Subunit not found` });
                continue;
            }

            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: `Invalid Language` });
                continue;
            }

            // collect subquestions
            const subquestions = [];
            let index = 1;
            while (row[`SubQ${index} Statement`]) {
                const statement = row[`SubQ${index} Statement`]?.trim();
                const optionA = row[`SubQ${index} Option A`]?.trim();
                const explanationA = row[`SubQ${index} Explanation A`]?.trim();
                const optionB = row[`SubQ${index} Option B`]?.trim();
                const explanationB = row[`SubQ${index} Explanation B`]?.trim();
                const correctOption = row[`SubQ${index} Correct Option`]?.trim()?.toLowerCase();

                if (!statement || !optionA || !explanationA || !optionB || !explanationB || !["a", "b"].includes(correctOption)) {
                    warnings.push({ rowNumber, reason: `SubQ${index}: Invalid or missing fields` });
                    index++;
                    continue;
                }

                subquestions.push({
                    statement,
                    options: { a: { option: optionA, explanation: explanationA }, b: { option: optionB, explanation: explanationB } },
                    correctOption
                });

                index++;
            }

            if (!subquestions.length) {
                warnings.push({ rowNumber, reason: "No valid subquestions found" });
                continue;
            }

            questions.push({
                type: "rapid",
                course: course._id,
                part: part._id,
                publisher: publisher._id,
                unit: unit._id,
                subunit: subunit._id,
                language,
                concept: row["Concept"]?.trim(),
                definition: row["Definition"]?.trim(),
                subquestions
            });

        } catch (err) {
            warnings.push({ rowNumber, reason: `Unexpected error: ${err.message}` });
        }
    }

    if (questions.length > 0) await Question.insertMany(questions);

    console.log(`✅ ${questions.length} Rapid questions inserted.`);
    return { warnings, addedQuestionsCount: questions.length };
};

const addEssayQuestionsFromFile = async (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    fs.unlink(filePath, (err) => { if (err) console.error(err); });

    const questions = [];
    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) { warnings.push({ rowNumber, reason: "Course not found" }); continue; }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) { warnings.push({ rowNumber, reason: "Part not found" }); continue; }

            const publisher = part.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) { warnings.push({ rowNumber, reason: "Publisher not found" }); continue; }

            const unit = publisher.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) { warnings.push({ rowNumber, reason: "Unit not found" }); continue; }

            if (!Array.isArray(unit.type) || !unit.type.includes("essay")) {
                warnings.push({ rowNumber, reason: "Unit does not support Essay type questions" });
                continue;
            }

            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );
            if (!subunit) { warnings.push({ rowNumber, reason: "Subunit not found" }); continue; }

            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) { warnings.push({ rowNumber, reason: "Invalid Language" }); continue; }

            const subquestions = [];
            let index = 1;
            while (row[`SubQ${index} Statement`]) {
                const statement = row[`SubQ${index} Statement`]?.trim();
                const explanation = row[`SubQ${index} Explanation`]?.trim();
                if (!statement || !explanation) { warnings.push({ rowNumber, reason: `SubQ${index}: Missing statement or explanation` }); index++; continue; }
                subquestions.push({ statement, explanation });
                index++;
            }

            if (!subquestions.length) { warnings.push({ rowNumber, reason: "No valid subquestions found" }); continue; }

            questions.push({
                type: "essay",
                course: course._id,
                part: part._id,
                publisher: publisher._id,
                unit: unit._id,
                subunit: subunit._id,
                language,
                content: row["Content"]?.trim(),
                subquestions
            });

        } catch (err) {
            warnings.push({ rowNumber, reason: `Unexpected error: ${err.message}` });
        }
    }

    if (questions.length > 0) await Question.insertMany(questions);

    console.log(`✅ ${questions.length} Essay questions inserted.`);
    return { warnings, addedQuestionsCount: questions.length };
};

const validateMCQQuestionsFile = async (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
    });

    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            const course = await Course.findOne({
                name: row["Course Name"]?.trim()
            });

            if (!course) {
                warnings.push({ rowNumber, reason: `Course not found: ${row["Course Name"]}` });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );

            if (!part) {
                warnings.push({ rowNumber, reason: `Part not found: ${row["Part Name"]}` });
                continue;
            }

            const publisher = part.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );

            if (!publisher) {
                warnings.push({ rowNumber, reason: `Publisher not found: ${row["Publisher Name"]}` });
                continue;
            }

            const unit = publisher.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );

            if (!unit) {
                warnings.push({ rowNumber, reason: `Unit not found: ${row["Unit Name"]}` });
                continue;
            }

            if (!Array.isArray(unit.type) || !unit.type.includes("mcq")) {
                warnings.push({ rowNumber, reason: `Unit does not support MCQ type questions` });
                continue;
            }

            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );

            if (!subunit) {
                warnings.push({ rowNumber, reason: `Subunit not found: ${row["Subunit Name"]}` });
                continue;
            }

            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: `Invalid Language. Must be 'eng', 'ar', or 'fr'` });
                continue;
            }

            const optionA = row["Option A"];
            const explanationA = row["Explanation A"];
            const optionB = row["Option B"];
            const explanationB = row["Explanation B"];
            const optionC = row["Option C"];
            const explanationC = row["Explanation C"];
            const optionD = row["Option D"];
            const explanationD = row["Explanation D"];
            const correctOption = row["Correct Option"]?.trim()?.toLowerCase();

            if (![optionA, optionB, optionC, optionD, explanationA, explanationB, explanationC, explanationD].every(Boolean)) {
                warnings.push({ rowNumber, reason: "Missing options or explanations" });
                continue;
            }

            if (!["a", "b", "c", "d"].includes(correctOption)) {
                warnings.push({ rowNumber, reason: `Correct Option must be one of a, b, c, d` });
                continue;
            }

        } catch (err) {
            warnings.push({
                rowNumber,
                reason: `Unexpected error: ${err.message}`
            });
        }
    }

    return {
        isValid: warnings.length === 0,
        warnings
    };
};

const validateRapidQuestionsFile = async (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    fs.unlink(filePath, (err) => { if (err) console.error(err); });

    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                warnings.push({ rowNumber, reason: "Course not found" });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                warnings.push({ rowNumber, reason: "Part not found" });
                continue;
            }

            const publisher = part.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                warnings.push({ rowNumber, reason: "Publisher not found" });
                continue;
            }

            const unit = publisher.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) {
                warnings.push({ rowNumber, reason: "Unit not found" });
                continue;
            }

            if (!Array.isArray(unit.type) || !unit.type.includes("rapid")) {
                warnings.push({ rowNumber, reason: "Unit does not support Rapid type questions" });
                continue;
            }

            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );
            if (!subunit) {
                warnings.push({ rowNumber, reason: "Subunit not found" });
                continue;
            }

            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: "Invalid Language" });
                continue;
            }

            let hasValidSubQuestion = false;
            let index = 1;

            while (row[`SubQ${index} Statement`]) {
                const statement = row[`SubQ${index} Statement`]?.trim();
                const optionA = row[`SubQ${index} Option A`]?.trim();
                const explanationA = row[`SubQ${index} Explanation A`]?.trim();
                const optionB = row[`SubQ${index} Option B`]?.trim();
                const explanationB = row[`SubQ${index} Explanation B`]?.trim();
                const correctOption = row[`SubQ${index} Correct Option`]?.trim()?.toLowerCase();

                if (!statement || !optionA || !explanationA || !optionB || !explanationB || !["a", "b"].includes(correctOption)) {
                    warnings.push({ rowNumber, reason: `SubQ${index}: Invalid or missing fields` });
                } else {
                    hasValidSubQuestion = true;
                }

                index++;
            }

            if (!hasValidSubQuestion) {
                warnings.push({ rowNumber, reason: "No valid subquestions found" });
            }

        } catch (err) {
            warnings.push({ rowNumber, reason: `Unexpected error: ${err.message}` });
        }
    }

    return {
        isValid: warnings.length === 0,
        warnings
    };
};

const validateEssayQuestionsFile = async (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    fs.unlink(filePath, (err) => { if (err) console.error(err); });

    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                warnings.push({ rowNumber, reason: "Course not found" });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                warnings.push({ rowNumber, reason: "Part not found" });
                continue;
            }

            const publisher = part.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                warnings.push({ rowNumber, reason: "Publisher not found" });
                continue;
            }

            const unit = publisher.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) {
                warnings.push({ rowNumber, reason: "Unit not found" });
                continue;
            }

            if (!Array.isArray(unit.type) || !unit.type.includes("essay")) {
                warnings.push({ rowNumber, reason: "Unit does not support Essay type questions" });
                continue;
            }

            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );
            if (!subunit) {
                warnings.push({ rowNumber, reason: "Subunit not found" });
                continue;
            }

            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: "Invalid Language" });
                continue;
            }

            let hasValidSubQuestion = false;
            let index = 1;

            while (row[`SubQ${index} Statement`]) {
                const statement = row[`SubQ${index} Statement`]?.trim();
                const explanation = row[`SubQ${index} Explanation`]?.trim();

                if (!statement || !explanation) {
                    warnings.push({ rowNumber, reason: `SubQ${index}: Missing statement or explanation` });
                } else {
                    hasValidSubQuestion = true;
                }

                index++;
            }

            if (!hasValidSubQuestion) {
                warnings.push({ rowNumber, reason: "No valid subquestions found" });
            }

        } catch (err) {
            warnings.push({ rowNumber, reason: `Unexpected error: ${err.message}` });
        }
    }

    return {
        isValid: warnings.length === 0,
        warnings
    };
};

const FetchQuestionsWithFilters = async ({
    publisherId,
    selectedUnits = [],
    selectedSubunits = {},
    page = 1,
    limit = 20,
}) => {
    const skip = (page - 1) * limit;
    const orConditions = [];

    const publisherObjectId = mongoose.Types.ObjectId.createFromHexString(publisherId);

    selectedUnits.forEach(unitId => {
        const subunits = selectedSubunits[unitId];
        const unitObjectId = mongoose.Types.ObjectId.createFromHexString(unitId);

        if (!subunits || subunits.length === 0) {
            orConditions.push({ unit: unitObjectId });
        } else {
            const subunitObjectIds = subunits.map(id =>
                mongoose.Types.ObjectId.createFromHexString(id)
            );

            orConditions.push({
                unit: unitObjectId,
                subunit: { $in: subunitObjectIds }
            });

            orConditions.push({
                unit: unitObjectId,
                subunit: { $exists: false }
            });
            orConditions.push({
                unit: unitObjectId,
                subunit: null
            });
        }
    });

    const query = {
        publisher: publisherObjectId,
        $or: orConditions
    };

    const [questions, total] = await Promise.all([
        Question.find(query)
            .skip(skip)
            .limit(limit)
            .lean(),
        Question.countDocuments(query)
    ]);

    return {
        questions,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    };
};

const FetchPracticeExamQuestions = async ({
    courseId,
    partId,
    examType,
    page = 1,
    pageSize = 20
}) => {
    const courseObjId = mongoose.Types.ObjectId.createFromHexString(courseId);
    const partObjId = mongoose.Types.ObjectId.createFromHexString(partId);


    const examLimit = examType === 'quick' ? 50 : 125;


    const course = await Course.findOne(
        { _id: courseObjId, "parts._id": partObjId },
        { "parts.$": 1 }
    ).lean();

    if (!course || !course.parts.length) throw new Error("Part not found");

    const part = course.parts[0];

    if (!part.publishers || !part.publishers.length) {
        throw new Error("No publishers found in this part");
    }


    const publisherIds = part.publishers.map(p => p._id);


    const publisherCount = publisherIds.length;
    const questionsPerPublisher = Math.floor(examLimit / publisherCount);
    const remainder = examLimit % publisherCount;


    let distributedQuestions = [];

    for (let index = 0; index < publisherIds.length; index++) {
        const pubId = publisherIds[index];


        const availableCount = await Question.countDocuments({
            course: courseObjId,
            part: partObjId,
            publisher: pubId
        });

        if (availableCount === 0) continue;

        let allocation = questionsPerPublisher;


        if (index < remainder) {
            allocation += 1;
        }


        allocation = Math.min(allocation, availableCount);


        const randomQuestions = await Question.aggregate([
            {
                $match: {
                    course: courseObjId,
                    part: partObjId,
                    publisher: pubId
                }
            },
            { $sample: { size: allocation } }
        ]);

        distributedQuestions.push(...randomQuestions);
    }


    const shuffledQuestions = distributedQuestions.sort(() => Math.random() - 0.5);
    const limitedQuestions = shuffledQuestions.slice(0, examLimit);

    const totalPages = Math.ceil(limitedQuestions.length / pageSize);
    const paginatedQuestions = limitedQuestions.slice((page - 1) * pageSize, page * pageSize);

    return {
        success: true,
        data: paginatedQuestions,
        pagination: {
            total: limitedQuestions.length,
            limit: pageSize,
            totalPages,
            page
        }
    };
};


const FetchStandardReviewQuestions = async ({ courseId, partId, userLimit = 20, page = 1, pageSize = 20 }) => {
    try {
        const course = await Course.findOne(
            { _id: courseId, "parts._id": partId },
            { "parts.$": 1 }
        ).lean();

        if (!course || !course.parts.length) throw new Error("Part not found");

        const part = course.parts[0];

        const standardPublisher = part.publishers.find(p => p.name === part.standard);
        if (!standardPublisher) throw new Error("Standard publisher not found in this part");

        const matchQuery = {
            course: mongoose.Types.ObjectId.createFromHexString(courseId),
            part: mongoose.Types.ObjectId.createFromHexString(partId),
            publisher: standardPublisher._id,
        };

        const allQuestions = await Question.find(matchQuery).lean();

        const limitedQuestions = allQuestions.slice(0, userLimit);

        const totalPages = Math.ceil(limitedQuestions.length / pageSize);
        const paginatedQuestions = limitedQuestions.slice((page - 1) * pageSize, page * pageSize);

        return {
            success: true,
            packageType: "standard",
            data: paginatedQuestions,
            pagination: {
                total: limitedQuestions.length,
                limit: pageSize,
                totalPages,
                page
            }
        };

    } catch (error) {
        throw error;
    }
};



const FetchMegaReviewQuestions = async ({ courseId, partId, userLimit, page = 1, pageSize = 20 }) => {
    try {
        if (!userLimit || userLimit <= 0) throw new Error("Valid userLimit is required");

        const courseObjId = mongoose.Types.ObjectId.createFromHexString(courseId);
        const partObjId = mongoose.Types.ObjectId.createFromHexString(partId);

        const course = await Course.findOne(
            { _id: courseObjId, "parts._id": partObjId },
            { "parts.$": 1 }
        ).lean();

        if (!course || !course.parts.length) throw new Error("Part not found");

        const part = course.parts[0];

        if (!part.mega || !part.mega.length) throw new Error("Mega publishers not configured for this part");

        const publisherIds = part.mega
            .map(name => part.publishers.find(p => p.name === name)?._id)
            .filter(Boolean);

        if (!publisherIds.length) throw new Error("No valid mega publishers found");


        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, userLimit);
        const questionsNeeded = endIndex - startIndex;

        if (questionsNeeded <= 0) {
            return {
                success: true,
                packageType: "mega",
                data: [],
                pagination: {
                    total: userLimit,
                    limit: pageSize,
                    totalPages: Math.ceil(userLimit / pageSize),
                    page
                }
            };
        }


        const publisherCounts = await Promise.all(
            publisherIds.map(async (pubId) => {
                const count = await Question.countDocuments({
                    course: courseObjId,
                    part: partObjId,
                    publisher: pubId
                });
                return { pubId, count };
            })
        );

        const totalAvailable = publisherCounts.reduce((sum, p) => sum + p.count, 0);

        if (totalAvailable === 0) throw new Error("No questions available");


        let allQuestions = [];
        let questionsFetched = 0;

        for (const { pubId, count } of publisherCounts) {
            if (questionsFetched >= questionsNeeded || count === 0) continue;


            const proportion = count / totalAvailable;
            const targetForPublisher = Math.ceil(questionsNeeded * proportion);
            const toFetch = Math.min(
                targetForPublisher,
                questionsNeeded - questionsFetched,
                count
            );

            if (toFetch <= 0) continue;

            const questions = await Question.aggregate([
                { $match: { course: courseObjId, part: partObjId, publisher: pubId } },
                { $sample: { size: toFetch } }
            ]);

            allQuestions.push(...questions);
            questionsFetched += questions.length;
        }


        if (questionsFetched < questionsNeeded) {
            for (const { pubId, count } of publisherCounts) {
                if (questionsFetched >= questionsNeeded) break;

                const additionalNeeded = questionsNeeded - questionsFetched;
                const questions = await Question.aggregate([
                    { $match: { course: courseObjId, part: partObjId, publisher: pubId } },
                    { $sample: { size: Math.min(additionalNeeded, count) } }
                ]);

                const newQuestions = questions.filter(q =>
                    !allQuestions.some(existing => existing._id.equals(q._id))
                );

                allQuestions.push(...newQuestions);
                questionsFetched += newQuestions.length;
            }
        }

        allQuestions = allQuestions.sort(() => Math.random() - 0.5);

        const totalPages = Math.ceil(userLimit / pageSize);

        return {
            success: true,
            packageType: "mega",
            data: allQuestions,
            pagination: {
                total: userLimit,
                limit: pageSize,
                totalPages,
                page
            }
        };

    } catch (error) {
        throw error;
    }
};

const CountStandardReviewQuestions = async ({ courseId, partId }) => {
    try {
        const courseObjId = mongoose.Types.ObjectId.createFromHexString(courseId);
        const partObjId = mongoose.Types.ObjectId.createFromHexString(partId);

        const course = await Course.findOne(
            { _id: courseObjId, "parts._id": partObjId },
            { "parts.$": 1 }
        ).lean();

        if (!course || !course.parts.length) throw new Error("Part not found");

        const part = course.parts[0];
        const standardPublisher = part.publishers.find(p => p.name === part.standard);

        if (!standardPublisher) throw new Error("Standard publisher not found in this part");

        const totalQuestions = await Question.countDocuments({
            course: courseObjId,
            part: partObjId,
            publisher: standardPublisher._id
        });

        return { success: true, totalQuestions };
    } catch (error) {
        throw error;
    }
};

const CountMegaReviewQuestions = async ({ courseId, partId }) => {
    try {
        const courseObjId = mongoose.Types.ObjectId.createFromHexString(courseId);
        const partObjId = mongoose.Types.ObjectId.createFromHexString(partId);

        const course = await Course.findOne(
            { _id: courseObjId, "parts._id": partObjId },
            { "parts.$": 1 }
        ).lean();

        if (!course || !course.parts.length) throw new Error("Part not found");

        const part = course.parts[0];
        if (!part.mega || !part.mega.length) throw new Error("Mega publishers not configured for this part");

        const megaPublisherIds = part.mega
            .map(name => part.publishers.find(p => p.name === name)?._id)
            .filter(Boolean);

        if (!megaPublisherIds.length) throw new Error("No valid mega publishers found");

        const totalQuestions = await Question.countDocuments({
            course: courseObjId,
            part: partObjId,
            publisher: { $in: megaPublisherIds }
        });

        return { success: true, totalQuestions };
    } catch (error) {
        throw error;
    }
};






module.exports = {
    getAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addMCQQuestionsFromFile,
    addRapidQuestionsFromFile,
    addEssayQuestionsFromFile,
    validateMCQQuestionsFile,
    validateRapidQuestionsFile,
    validateEssayQuestionsFile,
    FetchQuestionsWithFilters,
    FetchPracticeExamQuestions,
    FetchStandardReviewQuestions,
    FetchMegaReviewQuestions,
    CountStandardReviewQuestions,
    CountMegaReviewQuestions
};
