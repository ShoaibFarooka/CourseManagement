import React, { useState, useEffect, useMemo } from "react";
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
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import questionService from "../../../services/questionServices";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const QUIZ_TIME = 300;

const Quiz = () => {
    const { state } = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { publisherId, selectedUnits, selectedSubunits } = state || {};

    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalQuestions, setTotalQuestions] = useState(0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [time, setTime] = useState(QUIZ_TIME);

    /* -------------------- Fetch Questions -------------------- */
    const fetchQuestions = async (pageToFetch = 1) => {
        try {
            dispatch(ShowLoading());

            const res = await questionService.fetchQuestionsWithFilters({
                publisherId,
                selectedUnits,
                selectedSubunits,
                page: pageToFetch,
                limit,
            });

            if (pageToFetch === 1) {
                setQuestions(res.data);
            } else {
                setQuestions(prev => [...prev, ...res.data]);
            }

            setTotalQuestions(res.pagination.total);
        } catch (error) {
            message.error(error.response?.data?.error || "Failed to load questions");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchQuestions(page);
    }, [page]);

    /* -------------------- Timer -------------------- */
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" + secs : secs}`;
    };

    /* -------------------- Answer Handling -------------------- */
    const handleAnswerSelect = (key, value) => {
        setAnswers(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    /* -------------------- Navigation -------------------- */
    const goToQuestion = (index) => setCurrentIndex(index);

    const nextQuestion = () => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= questions.length - 3 && questions.length < totalQuestions) {
            setPage(prev => prev + 1);
        }

        setCurrentIndex(Math.min(nextIndex, questions.length - 1));
    };

    const prevQuestion = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    const currentQuestion = questions[currentIndex];
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === totalQuestions - 1;

    /* -------------------- Progress Calculations -------------------- */
    const totalSteps = useMemo(() => {
        return questions.reduce((acc, q) => {
            if (q.type === "mcq") return acc + 1;
            if (q.type === "rapid" || q.type === "essay") {
                return acc + (q.subquestions?.length || 0);
            }
            return acc;
        }, 0);
    }, [questions]);

    const answeredSteps = Object.keys(answers).length;

    const progress = totalSteps === 0
        ? 0
        : Math.round((answeredSteps / totalSteps) * 100);

    /* -------------------- Correct / Incorrect -------------------- */
    const correctCount = useMemo(() => {
        return questions.reduce((acc, q) => {
            if (q.type === "mcq") {
                const key = `mcq:${q._id}`;
                return answers[key] === q.correctOption ? acc + 1 : acc;
            }

            if (q.type === "rapid") {
                return acc + (q.subquestions?.reduce((sAcc, sub, i) => {
                    const key = `rapid:${q._id}:${i}`;
                    return answers[key] === sub.correctOption ? sAcc + 1 : sAcc;
                }, 0) || 0);
            }

            return acc;
        }, 0);
    }, [questions, answers]);

    const incorrectCount = answeredSteps - correctCount;
    const unansweredCount = totalSteps - answeredSteps;

    /* -------------------- Submit Quiz -------------------- */
    const handleQuizSubmit = () => {
        navigate("/progress-report", {
            state: {
                overallScore: progress,
                correctAnswers: correctCount,
                incorrectAnswers: incorrectCount,
            }
        });
    };

    /* -------------------- Render -------------------- */
    return (
        <div className="quiz-container">
            <div className="quiz-main">
                <div className="button-container">
                    <button className="back-btn">
                        <FaChevronLeft /> BACK
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

                {currentQuestion?.type === "mcq" && (
                    <MCQs
                        question={currentQuestion}
                        questionIndex={currentIndex}
                        selectedOption={answers[`mcq:${currentQuestion._id}`]}
                        onAnswerSelect={handleAnswerSelect}
                        onNext={nextQuestion}
                        onBack={prevQuestion}
                        isFirstQuestion={isFirstQuestion}
                        isLastQuestion={isLastQuestion}
                        handleQuizSubmit={handleQuizSubmit}
                    />
                )}

                {currentQuestion?.type === "rapid" && (
                    <Rapid
                        data={currentQuestion}
                        selectedAnswers={answers}
                        onAnswerSelect={handleAnswerSelect}
                        onNext={nextQuestion}
                        onBack={prevQuestion}
                        isFirstQuestion={isFirstQuestion}
                        isLastQuestion={isLastQuestion}
                        handleQuizSubmit={handleQuizSubmit}
                    />
                )}

                {currentQuestion?.type === "essay" && (
                    <Essay
                        data={currentQuestion}
                        selectedAnswers={answers}
                        onAnswerSelect={handleAnswerSelect}
                        onNext={nextQuestion}
                        onBack={prevQuestion}
                        isFirstQuestion={isFirstQuestion}
                        isLastQuestion={isLastQuestion}
                        handleQuizSubmit={handleQuizSubmit}
                    />
                )}
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
    );
};

export default Quiz;
