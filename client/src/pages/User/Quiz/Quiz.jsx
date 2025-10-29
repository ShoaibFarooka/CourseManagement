import React, { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { TiStopwatch } from "react-icons/ti";
import './Quiz.css';
import ProgressBar from "./components/ProgressBar/ProgressBar";
import QuestionSection from "./components/QuestionSection/QuestionSection";
import ProgressCircle from "./components/ProgressCircle/ProgressCircle";
import QuestionNavigator from "./components/QuestionNavigator/QuestionNavigator";
import QuizStatus from "./components/QuizStatus/QuizStatus";

const Quiz = () => {
    const questions = [
        { id: 1, text: "Who is the first president of the United States?", options: ["Liaquat Ali Khan", "Donald Trump", "Vladimir Putin", "Abraham Lincoln"], correct: 3 },
        { id: 2, text: "Capital of France?", options: ["Rome", "Paris", "Berlin", "Madrid"], correct: 1 },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [time, setTime] = useState(300); // 5 minutes in seconds

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / totalQuestions) * 100;

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

    const handleAnswerSelect = (questionId, optionIndex) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    };

    const goToQuestion = (index) => setCurrentIndex(index);
    const nextQuestion = () => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    const prevQuestion = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

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
                    <QuizStatus correct={5} marked={1} incorrect={1} unanswered={1} />

                    <QuestionSection
                        question={questions[currentIndex]}
                        questionIndex={currentIndex}
                        totalQuestions={totalQuestions}
                        selectedOption={answers[questions[currentIndex].id]}
                        onAnswerSelect={handleAnswerSelect}
                        onNext={nextQuestion}
                        onBack={prevQuestion}
                    />
                </div>

                <aside className="quiz-sidebar">
                    <ProgressCircle progress={progress} />
                    <QuestionNavigator
                        questions={questions}
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
