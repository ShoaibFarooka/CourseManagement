const Question = require("../models/questionModel");
const Course = require("../models/courseModel");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const getAllQuestions = async (subunitId) => {
    const questions = await Question.find({ subunitId });

    if (!questions || questions.length === 0) {
        const error = new Error("No questions found for this subunit.");
        error.code = 404;
        throw error;
    }

    return questions;
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

const runMCQUploadTest = async () => {
    const filePath = path.resolve(__dirname, "mcqs.xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const questions = [];
    const warnings = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 1;

        try {
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

// runMCQUploadTest();


module.exports = {
    getAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
};
