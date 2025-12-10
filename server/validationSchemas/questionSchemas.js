const yup = require("yup");
const mongoose = require("mongoose");


const ObjectId = yup
    .string()
    .test("is-valid", "Invalid ObjectId", (value) =>
        mongoose.Types.ObjectId.isValid(value)
    );

const getAllQuestionsSchema = yup.object().shape({
    courseId: ObjectId.required("Course ID is required"),
    partId: ObjectId.required("Part ID is required"),
    publisherId: ObjectId.required("Publisher ID is required"),
    unitId: ObjectId.required("Unit ID is required"),
    subunitId: ObjectId.required("Subunit ID is required"),
});


const questionIdSchema = yup.object().shape({
    questionId: ObjectId.required("Question ID is required"),
});

const essayQuestionSchema = yup.object().shape({
    language: yup.string().oneOf(["eng", "ar", "fr"]).required("Language is required"),
    content: yup.string().trim().required("Content is required"),
    subquestions: yup.array().of(
        yup.object().shape({
            statement: yup.string().trim().required("Statement is required"),
            explanation: yup.string().trim().required("Explanation is required"),
        })
    ).min(1, "At least one subquestion is required"),
});


const rapidQuestionSchema = yup.object().shape({
    language: yup.string().oneOf(["eng", "ar", "fr"]).required("Language is required"),
    concept: yup.string().trim().required("Concept is required"),
    definition: yup.string().trim().required("Definition is required"),
    subquestions: yup.array().of(
        yup.object().shape({
            statement: yup.string().trim().required("Statement is required"),
            options: yup.object().shape({
                a: yup.object().shape({
                    option: yup.string().trim().required("Option A is required"),
                    explanation: yup.string().trim().required("Explanation A is required"),
                }),
                b: yup.object().shape({
                    option: yup.string().trim().required("Option B is required"),
                    explanation: yup.string().trim().required("Explanation B is required"),
                }),
            }),
            correctOption: yup.string().oneOf(["a", "b"]).required("Correct option is required"),
        })
    ).min(1, "At least one subquestion is required")
});


const mcqQuestionSchema = yup.object().shape({
    language: yup.string().oneOf(["eng", "ar", "fr"]).required("Language is required"),
    statement: yup.string().trim().required("Statement is required"),
    options: yup.object().shape({
        a: yup.object().shape({
            option: yup.string().trim().required("Option A is required"),
            explanation: yup.string().trim().required("Explanation A is required"),
        }),
        b: yup.object().shape({
            option: yup.string().trim().required("Option B is required"),
            explanation: yup.string().trim().required("Explanation B is required"),
        }),
        c: yup.object().shape({
            option: yup.string().trim().required("Option C is required"),
            explanation: yup.string().trim().required("Explanation C is required"),
        }),
        d: yup.object().shape({
            option: yup.string().trim().required("Option D is required"),
            explanation: yup.string().trim().required("Explanation D is required"),
        }),
    }),
    correctOption: yup.string().oneOf(["a", "b", "c", "d"]).required("Correct option is required"),
});



module.exports = {
    essayQuestionSchema,
    rapidQuestionSchema,
    mcqQuestionSchema,
    getAllQuestionsSchema,
    questionIdSchema,
};
