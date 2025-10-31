import React, { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { TiStopwatch } from "react-icons/ti";
import "./Quiz.css";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import MCQs from "./components/MCQs/MCQs";
import Rapid from "./components/Rapid/Rapid";
import Essay from "./components/Essay/Essay";
import ProgressCircle from "./components/ProgressCircle/ProgressCircle";
import QuestionNavigator from "./components/QuestionNavigator/QuestionNavigator";
import QuizStatus from "./components/QuizStatus/QuizStatus";

const Quiz = () => {
    const questions = [
        {
            id: "mcq-1",
            type: "mcq",
            statement: "Who is the first president of the United States?",
            options: {
                A: "Liaquat Ali Khan",
                B: "Donald Trump",
                C: "Vladimir Putin",
                D: "Abraham Lincoln",
            },
            correctOption: "C",
        },
        {
            id: "mcq-2",
            type: "mcq",
            statement: "Capital of France?",
            options: {
                A: "Rome",
                B: "Paris",
                C: "Berlin",
                D: "Madrid",
            },
            correctOption: "B",
        },
    ];

    const rapidData = [
        {
            id: "rapid-1",
            type: "rapid",
            concept: "Mission of Internal Audit",
            definition:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum.",
            subquestions: [
                {
                    question: "Who is the first president of the United States?",
                    options: {
                        A: "Liaquat Ali Khan",
                        B: "Donald Trump",
                        C: "Vladimir Putin",
                        D: "Abraham Lincoln",
                    },
                    correctOption: "D",
                },
                {
                    question: "What is the capital of the USA?",
                    options: {
                        A: "New York",
                        B: "Los Angeles",
                        C: "Washington D.C.",
                        D: "Chicago",
                    },
                    correctOption: "C",
                },
            ],
        },
        {
            id: "rapid-2",
            type: "rapid",
            concept: "Ethics in Auditing",
            definition: "Morbi sed felis ut nunc viverra posuere.",
            subquestions: [
                {
                    question: "Who is known as the father of auditing?",
                    options: {
                        A: "Watts",
                        B: "George Washington",
                        C: "Newton",
                        D: "Einstein",
                    },
                    correctOption: "A",
                },
            ],
        },
    ];

    const essayData = {
        id: "essay-1",
        type: "essay",
        content:
            "Porem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis...",
        subquestions: [
            { statement: "What is speed?", explanation: "Unit of speed" },
            { statement: "How is avg. speed calculated?", explanation: "Correct formula", },
        ],
    };

    const allQuestions = [...questions, ...rapidData, essayData];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [time, setTime] = useState(300);
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === allQuestions.length - 1;

    useEffect(() => {
        const timer = setInterval(() => {
            setTime((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" + secs : secs}`;
    };

    const handleAnswerSelect = (questionId, optionKey) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    };

    const goToQuestion = (index) => setCurrentIndex(index);

    const nextQuestion = (flushAnswer) => {
        if (flushAnswer) flushAnswer();
        setCurrentIndex((prev) => Math.min(prev + 1, allQuestions.length - 1));
    };

    const prevQuestion = () =>
        setCurrentIndex((prev) => Math.max(prev - 1, 0));

    const totalSteps = allQuestions.reduce((acc, q) => {
        if (q.type === "mcq") return acc + 1;
        if (q.type === "rapid" || q.type === "essay") return acc + (q.subquestions?.length || 0);
        return acc;
    }, 0);

    const answeredSteps = allQuestions.reduce((acc, q) => {
        if (q.type === "mcq") {
            return acc + (answers[q.id] !== undefined ? 1 : 0);
        }
        if (q.type === "rapid" || q.type === "essay") {
            const answeredSubs = q.subquestions?.filter((_, i) => answers[`${q.id}-${i}`] !== undefined)?.length || 0;
            return acc + answeredSubs;
        }
        return acc;
    }, 0);

    const progress = Math.round((answeredSteps / totalSteps) * 100);

    const totalSubQuestions = allQuestions.reduce((acc, q) => {
        if (q.type === "mcq") return acc + 1;
        if (q.type === "rapid" || q.type === "essay") return acc + (q.subquestions?.length || 0);
        return acc;
    }, 0);

    const answeredSubQuestions = Object.keys(answers).length;

    const correctCount = allQuestions.reduce((acc, q) => {
        if (q.type === "mcq") {
            if (answers[q.id] !== undefined && answers[q.id] === q.correctOption) return acc + 1;
        }
        if (q.type === "rapid") {
            const correctSubs = q.subquestions?.reduce((subAcc, sub, i) => {
                const key = `${q.id}-${i}`;
                if (answers[key] !== undefined && answers[key] === sub.correctOption) return subAcc + 1;
                return subAcc;
            }, 0) || 0;
            return acc + correctSubs;
        }
        return acc;
    }, 0);

    const incorrectCount = allQuestions.reduce((acc, q) => {
        if (q.type === "mcq") {
            if (answers[q.id] !== undefined && answers[q.id] !== q.correctOption) return acc + 1;
        }
        if (q.type === "rapid") {
            const incorrectSubs = q.subquestions?.reduce((subAcc, sub, i) => {
                const key = `${q.id}-${i}`;
                if (answers[key] !== undefined && answers[key] !== sub.correctOption) return subAcc + 1;
                return subAcc;
            }, 0) || 0;
            return acc + incorrectSubs;
        }
        return acc;
    }, 0);

    const unansweredCount = totalSubQuestions - answeredSubQuestions;

    const currentQuestion = allQuestions[currentIndex];

    return (
        <>
            <div className="quiz"></div>

            <div className="quiz-container">
                <div className="quiz-main">
                    <div className="button-container">
                        <button className="back-btn">
                            <FaChevronLeft />
                            BACK
                        </button>
                    </div>

                    <div className="quiz-header">
                        <div className="title">RCK MSSE Computer Science (J277)</div>
                        <div className="quiz-timer">
                            <TiStopwatch className="timer-icon" />
                            <span>{formatTime(time)}</span>
                        </div>
                    </div>

                    <ProgressBar progress={progress} />
                    <QuizStatus
                        correct={correctCount}
                        marked={0}
                        incorrect={incorrectCount}
                        unanswered={unansweredCount}
                    />

                    {currentQuestion.type === "mcq" && (
                        <MCQs
                            question={currentQuestion}
                            questionIndex={currentIndex}
                            selectedOption={answers[currentQuestion.id]}
                            onAnswerSelect={handleAnswerSelect}
                            onNext={nextQuestion}
                            onBack={prevQuestion}
                            isFirstQuestion={isFirstQuestion}
                            isLastQuestion={isLastQuestion}
                        />
                    )}

                    {currentQuestion.type === "rapid" && (
                        <Rapid
                            data={currentQuestion}
                            onNext={nextQuestion}
                            onBack={prevQuestion}
                            onAnswerSelect={handleAnswerSelect}
                            selectedOption={answers}
                            isFirstQuestion={isFirstQuestion}
                            isLastQuestion={isLastQuestion}
                        />)}

                    {currentQuestion.type === "essay" && (
                        <Essay
                            data={currentQuestion}
                            onNext={nextQuestion}
                            onBack={prevQuestion}
                            onAnswerSelect={handleAnswerSelect}
                            isFirstQuestion={isFirstQuestion}
                            isLastQuestion={isLastQuestion}
                        />
                    )}
                </div>

                <aside className="quiz-sidebar">
                    <ProgressCircle progress={progress} />
                    <QuestionNavigator
                        questions={allQuestions}
                        currentIndex={currentIndex}
                        onNavigate={goToQuestion}
                        answers={answers}
                    />
                </aside>
            </div>
        </>
    );
};

export default Quiz;
