const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const Question = require("../models/questionModel.js");
const Course = require("../models/courseModel.js");

async function runMCQUploadTest() {
    const filePath = path.resolve(__dirname, "uploads", "mcqs.xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const questions = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            const course = await Course.findOne({ name: row["Course Name"]?.trim() });
            if (!course) {
                errors.push({ rowNumber, row, reason: `Course not found: ${row["Course Name"]}` });
                continue;
            }

            const publisher = course.publishers.find(p =>
                p.name.trim().toLowerCase() === row["Publisher Name"]?.trim().toLowerCase()
            );
            if (!publisher) {
                errors.push({ rowNumber, row, reason: `Publisher not found: ${row["Publisher Name"]}` });
                continue;
            }

            const part = course.parts.find(p =>
                p.name.trim().toLowerCase() === row["Part Name"]?.trim().toLowerCase()
            );
            if (!part) {
                errors.push({ rowNumber, row, reason: `Part not found: ${row["Part Name"]}` });
                continue;
            }

            const unit = part.units.find(u =>
                u.name.trim().toLowerCase() === row["Unit Name"]?.trim().toLowerCase()
            );
            if (!unit) {
                errors.push({ rowNumber, row, reason: `Unit not found: ${row["Unit Name"]}` });
                continue;
            }

            const subunit = unit.subunits.find(s =>
                s.name.trim().toLowerCase() === row["Subunit Name"]?.trim().toLowerCase()
            );
            if (!subunit) {
                errors.push({ rowNumber, row, reason: `Subunit not found: ${row["Subunit Name"]}` });
                continue;
            }

            const correctOption = row["Correct Option"]?.toLowerCase();
            if (!["a", "b", "c", "d"].includes(correctOption)) {
                errors.push({ rowNumber, row, reason: `Correct Option must be one of a, b, c, d` });
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
            errors.push({ rowNumber, row, reason: `Unexpected error: ${err.message}` });
        }
    }

    if (questions.length > 0) {
        try {
            await Question.insertMany(questions);
            console.log(`✅ ${questions.length} MCQ questions inserted.`);
        } catch (err) {
            console.error("❌ Error inserting questions:", err);
            errors.push({ rowNumber: "Bulk Insert", reason: err.message });
        }
    } else {
        console.warn("⚠️ No valid questions to insert.");
    }

    const errorPath = path.join(__dirname, "mcq_upload_errors.json");
    fs.writeFileSync(errorPath, JSON.stringify(errors, null, 2));
    console.log(`📝 Error log written to: ${errorPath}`);
}

// 🔥 auto-run when file is executed directly
module.exports = runMCQUploadTest;
