const Question = require("../models/questionModel");
const Course = require("../models/courseModel");
const fs = require("fs");
const XLSX = require("xlsx");

const getAllQuestions = async (
    subunitId,
    publisherId,
    page = 1,
    limit = 5,
    types = [],
    languages = []
) => {
    const filter = {
        subunitId,
        publisherId,
    };

    if (types.length > 0) {
        filter.type = { $in: types };
    }

    if (languages.length > 0) {
        filter.language = { $in: languages };
    }

    const skip = (page - 1) * limit;

    let questions = await Question.find(filter);


    const typeOrder = { mcq: 1, rapid: 2, essay: 3 };
    const languageOrder = { eng: 1, ar: 2, fr: 3 };


    questions.sort((a, b) => {
        const typeDiff = typeOrder[a.type] - typeOrder[b.type];
        if (typeDiff !== 0) return typeDiff;

        return languageOrder[a.language] - languageOrder[b.language];
    });

    const total = questions.length;
    const totalPages = Math.ceil(total / limit);
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
        const rowNumber = i + 1;

        try {
            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: `Invalid Language. Must be 'eng', 'ar', or 'fr'` });
                continue;
            }

            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                warnings.push({ rowNumber, reason: `Course not found: ${row["Course Name"]}` });
                continue;
            }

            const publisher = course.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                warnings.push({ rowNumber, reason: `Publisher not found: ${row["Publisher Name"]}` });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                warnings.push({ rowNumber, reason: `Part not found: ${row["Part Name"]}` });
                continue;
            }

            const unit = part.units.find(u =>
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

            const correctOption = row["Correct Option"]?.toLowerCase();
            if (!["a", "b", "c", "d"].includes(correctOption)) {
                warnings.push({ rowNumber, reason: `Correct Option must be one of a, b, c, d` });
                continue;
            }

            questions.push({
                type: "mcq",
                publisherId: publisher._id,
                subunitId: subunit._id,
                language,
                statement: row["Statement"],
                options: {
                    a: { option: row["Option A"], explanation: row["Explanation A"] },
                    b: { option: row["Option B"], explanation: row["Explanation B"] },
                    c: { option: row["Option C"], explanation: row["Explanation C"] },
                    d: { option: row["Option D"], explanation: row["Explanation D"] },
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

    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
    });

    const questions = [];
    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 1;

        try {
            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: `Invalid Language. Must be 'eng', 'ar', or 'fr'` });
                continue;
            }

            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                warnings.push({ rowNumber, reason: `Course not found: ${row["Course Name"]}` });
                continue;
            }

            const publisher = course.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                warnings.push({ rowNumber, reason: `Publisher not found: ${row["Publisher Name"]}` });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                warnings.push({ rowNumber, reason: `Part not found: ${row["Part Name"]}` });
                continue;
            }

            const unit = part.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) {
                warnings.push({ rowNumber, reason: `Unit not found: ${row["Unit Name"]}` });
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
                warnings.push({ rowNumber, reason: `Subunit not found: ${row["Subunit Name"]}` });
                continue;
            }

            const subquestions = [];
            let index = 1;

            while (row[`SubQ${index} Statement`]) {
                const statement = row[`SubQ${index} Statement`]?.trim();
                const optionA = row[`SubQ${index} Option A`]?.trim();
                const explanationA = row[`SubQ${index} Explanation A`]?.trim();
                const optionB = row[`SubQ${index} Option B`]?.trim();
                const explanationB = row[`SubQ${index} Explanation B`]?.trim();
                const correctOption = row[`SubQ${index} Correct Option`]?.trim().toLowerCase();

                if (!["a", "b"].includes(correctOption)) {
                    warnings.push({ rowNumber, reason: `SubQ${index}: Invalid Correct Option (must be 'a' or 'b')` });
                    index++;
                    continue;
                }

                subquestions.push({
                    statement,
                    options: {
                        a: { option: optionA, explanation: explanationA },
                        b: { option: optionB, explanation: explanationB },
                    },
                    correctOption,
                });

                index++;
            }

            if (subquestions.length === 0) {
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

    if (questions.length > 0) {
        await Question.insertMany(questions);
    }

    console.log(`✅ ${questions.length} Rapid questions inserted.`);
    console.log("Warnings: ", warnings);

    return { warnings, addedQuestionsCount: questions.length };
};


const addEssayQuestionsFromFile = async (filePath) => {
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
        const rowNumber = i + 1;

        try {
            const language = row["Language"]?.trim()?.toLowerCase();
            if (!["eng", "ar", "fr"].includes(language)) {
                warnings.push({ rowNumber, reason: `Invalid Language. Must be 'eng', 'ar', or 'fr'` });
                continue;
            }

            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                warnings.push({ rowNumber, reason: `Course not found: ${row["Course Name"]}` });
                continue;
            }

            const publisher = course.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                warnings.push({ rowNumber, reason: `Publisher not found: ${row["Publisher Name"]}` });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                warnings.push({ rowNumber, reason: `Part not found: ${row["Part Name"]}` });
                continue;
            }

            const unit = part.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) {
                warnings.push({ rowNumber, reason: `Unit not found: ${row["Unit Name"]}` });
                continue;
            }
            if (!Array.isArray(unit.type) || !unit.type.includes("essay")) {
                warnings.push({ rowNumber, reason: `Unit does not support Essay type questions` });
                continue;
            }


            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );
            if (!subunit) {
                warnings.push({ rowNumber, reason: `Subunit not found: ${row["Subunit Name"]}` });
                continue;
            }

            const subquestions = [];
            let index = 1;

            while (row[`SubQ${index} Statement`]) {
                const statement = row[`SubQ${index} Statement`]?.trim();
                const explanation = row[`SubQ${index} Explanation`]?.trim();

                if (!statement || !explanation) {
                    warnings.push({ rowNumber, reason: `SubQ${index}: Missing statement or explanation` });
                    index++;
                    continue;
                }

                subquestions.push({ statement, explanation });
                index++;
            }

            if (subquestions.length === 0) {
                warnings.push({ rowNumber, reason: "No valid subquestions found" });
                continue;
            }

            // ✅ Add to valid questions
            questions.push({
                type: "essay",
                publisherId: publisher._id,
                subunitId: subunit._id,
                language,
                content: row["Content"]?.trim(),
                subquestions,
            });

        } catch (err) {
            warnings.push({ rowNumber, reason: `Unexpected error: ${err.message}` });
        }
    }

    if (questions.length > 0) {
        await Question.insertMany(questions);
    }

    console.log(`✅ ${questions.length} Essay questions inserted.`);
    console.log("Warnings: ", warnings);

    return { warnings, addedQuestionsCount: questions.length };
};


module.exports = {
    getAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addMCQQuestionsFromFile,
    addRapidQuestionsFromFile,
    addEssayQuestionsFromFile
};
