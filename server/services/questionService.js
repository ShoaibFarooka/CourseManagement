const Question = require("../models/questionModel");
const Course = require("../models/courseModel");
const fs = require("fs");
const XLSX = require("xlsx");
const getAllQuestions = async ({
    courseId,
    partId,
    publisherId,
    unitId,
    subunitId,
    page = 1,
    limit = 5,
    types = [],
    languages = [],
}) => {
    const filter = {};

    if (subunitId) filter.subunitId = subunitId;
    if (publisherId) filter.publisherId = publisherId;


    let questions = await Question.find(filter);

    if (courseId || partId || unitId) {
        questions = questions.filter(q => {
            const course = q.course?.toString() === courseId;
            const part = q.part?.toString() === partId;
            const unit = q.unit?.toString() === unitId;
            return (!courseId || course) && (!partId || part) && (!unitId || unit);
        });
    }

    if (types.length > 0) {
        questions = questions.filter(q => types.includes(q.type));
    }
    if (languages.length > 0) {
        questions = questions.filter(q => languages.includes(q.language));
    }

    const typeOrder = { mcq: 1, rapid: 2, essay: 3 };
    const languageOrder = { eng: 1, ar: 2, fr: 3 };

    questions.sort((a, b) => {
        const typeDiff = typeOrder[a.type] - typeOrder[b.type];
        if (typeDiff !== 0) return typeDiff;
        return languageOrder[a.language] - languageOrder[b.language];
    });

    const total = questions.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedQuestions = questions.slice(skip, skip + limit);

    return {
        questions: paginatedQuestions,
        total,
        totalPages,
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
                publisherId: publisher._id,
                subunitId: subunit._id,
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
                publisherId: publisher._id,
                subunitId: subunit._id,
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
                publisherId: publisher._id,
                subunitId: subunit._id,
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
    limit = 10,
}) => {

    const skip = (page - 1) * limit;

    const orConditions = [];

    selectedUnits.forEach(unitId => {
        const subunits = selectedSubunits[unitId];

        if (!subunits || subunits.length === 0) {
            orConditions.push({ unit: unitId });
        }

        else {
            orConditions.push({
                unit: unitId,
                subunit: { $in: subunits }
            });
        }
    });

    const query = {
        publisher: publisherId,
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
};
