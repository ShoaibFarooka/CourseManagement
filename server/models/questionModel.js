// const mongoose = require("mongoose");

// const essaySchema = new mongoose.Schema(
//     {
//         content: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         subquestions: [{
//             statement: {
//                 type: String,
//                 required: true,
//                 trim: true,
//             },
//             explanation: {
//                 type: String,
//                 required: true,
//                 trim: true,
//             },
//         }]
//     }
// );

// const rapidSchema = new mongoose.Schema(
//     {
//         concept: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         definition: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         subquestions: [{
//             statement: {
//                 type: String,
//                 required: true,
//                 trim: true,
//             },
//             options: {
//                 a: {
//                     option: { type: String, required: true, trim: true },
//                     explanation: { type: String, required: true, trim: true }
//                 },
//                 b: {
//                     option: { type: String, required: true, trim: true },
//                     explanation: { type: String, required: true, trim: true }
//                 },
//             },
//             correctOption: {
//                 type: String,
//                 required: true,
//                 enum: ["a", "b"],
//             },
//         }]
//     }
// );

// const mcqSchema = new mongoose.Schema(
//     {
//         statement: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         options: {
//             a: {
//                 option: { type: String, required: true, trim: true },
//                 explanation: { type: String, required: true, trim: true }
//             },
//             b: {
//                 option: { type: String, required: true, trim: true },
//                 explanation: { type: String, required: true, trim: true }
//             },
//             c: {
//                 option: { type: String, required: true, trim: true },
//                 explanation: { type: String, required: true, trim: true }
//             },
//             d: {
//                 option: { type: String, required: true, trim: true },
//                 explanation: { type: String, required: true, trim: true }
//             },
//         },
//         correctOption: {
//             type: String,
//             required: true,
//             enum: ["a", "b", "c", "d"],
//         },
//     }
// );

// const questionSchema = new mongoose.Schema(
//     {
//         subunitId: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//         },
//         type: {
//             type: String,
//             enum: ['rapid', 'mcq', 'essay'],
//             required: true,
//         },
//         content: {}
//     },
//     { timestamps: true }
// );

// const Question = mongoose.model("question", questionSchema);
// module.exports = Question;


const mongoose = require("mongoose");

const options = {
    discriminatorKey: "type",
    timestamps: true,
};

const questionSchema = new mongoose.Schema({
    publisherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    subunitId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
}, options);

const Question = mongoose.model("question", questionSchema);

Question.discriminator("essay", new mongoose.Schema({
    content: {
        type: String,
        trim: true,
        required: true
    },
    subquestions: [{
        statement: { type: String, trim: true, required: true },
        explanation: { type: String, trim: true, required: true },
    }]
}, { _id: false }));

Question.discriminator("rapid", new mongoose.Schema({
    concept: { type: String, trim: true, required: true },
    definition: { type: String, trim: true, required: true },
    subquestions: [{
        statement: { type: String, trim: true, required: true },
        options: {
            a: {
                option: { type: String, trim: true, required: true },
                explanation: { type: String, trim: true, required: true },
            },
            b: {
                option: { type: String, trim: true, required: true },
                explanation: { type: String, trim: true, required: true },
            },
        },
        correctOption: { type: String, enum: ["a", "b"], required: true },
    }]
}, { _id: false }));

Question.discriminator("mcq", new mongoose.Schema({
    statement: { type: String, trim: true, required: true },
    options: {
        a: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
        b: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
        c: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
        d: {
            option: { type: String, trim: true, required: true },
            explanation: { type: String, trim: true, required: true },
        },
    },
    correctOption: { type: String, enum: ["a", "b", "c", "d"], required: true },
}, { _id: false }));

const test = async () => {
    // await Question.create({
    //     type: "mcq",
    //     publisherId: "68619dd5588712033a4769a7",
    //     subunitId: "686114650e3b5dd5de673b21",
    //     statement: "Which is the largest planet?",
    //     options: {
    //         a: { option: "Earth", explanation: "Too small." },
    //         b: { option: "Mars", explanation: "Nope." },
    //         c: { option: "Jupiter", explanation: "Correct!" },
    //         d: { option: "Venus", explanation: "Hot, but not the biggest." }
    //     },
    //     correctOption: "c"
    // });




    // await Question.create({
    //     type: "rapid",
    //     publisherId: "68619dd5588712033a4769a8",
    //     subunitId: "686114650e3b5dd5de673b20",
    //     concept: "Photosynthesis",
    //     definition: "The process by which green plants make food using sunlight.",
    //     subquestions: [
    //         {
    //             statement: "What gas is produced in photosynthesis?",
    //             options: {
    //                 a: {
    //                     option: "Oxygen",
    //                     explanation: "Correct, it's released as a byproduct.",
    //                 },
    //                 b: {
    //                     option: "Carbon Dioxide",
    //                     explanation: "Incorrect, CO₂ is consumed not produced.",
    //                 },
    //             },
    //             correctOption: "a",
    //         },
    //         {
    //             statement: "What gas is produced in photosynthesis?2",
    //             options: {
    //                 a: {
    //                     option: "Oxygen2",
    //                     explanation: "Correct, it's released as a byproduct.2",
    //                 },
    //                 b: {
    //                     option: "Carbon Dioxide2",
    //                     explanation: "Incorrect, CO₂ is consumed not produced.2",
    //                 },
    //             },
    //             correctOption: "b",
    //         },
    //     ],
    // });





    // await Question.create({
    //     type: "essay",
    //     publisherId: "68619dd5588712033a4769a9",
    //     subunitId: "686114650e3b5dd5de673b22",
    //     content: "Explain the importance of the water cycle.",
    //     subquestions: [
    //         {
    //             statement: "What are the stages of the water cycle?",
    //             explanation: "Evaporation, condensation, precipitation, collection.",
    //         },
    //         {
    //             statement: "Why is it important?",
    //             explanation: "It recycles water and supports all life forms.",
    //         },
    //     ],
    // });






    console.log("Question Created.");
};

// test();


module.exports = Question;
