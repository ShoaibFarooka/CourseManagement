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
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import questionService from "../../../services/questionServices";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

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
    const [time, setTime] = useState(300);

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

            setQuestions(prev => [...prev, ...res.data]);
            setTotalQuestions(res.pagination.total);
        } catch (error) {
            message.error(error.response?.data?.error || "Something went wrong!");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchQuestions(page);
    }, [page]);


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

    const handleAnswerSelect = (questionId, optionKey) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
    };

    const goToQuestion = (index) => setCurrentIndex(index);

    const nextQuestion = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length - 3 && questions.length < totalQuestions) {
            setPage(prev => prev + 1);
        }

        setCurrentIndex(Math.min(nextIndex, questions.length - 1));
    };

    const prevQuestion = () =>
        setCurrentIndex(prev => Math.max(prev - 1, 0));

    const currentQuestion = questions[currentIndex];
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === totalQuestions - 1;

    const totalSteps = questions.reduce((acc, q) => {
        if (q.type === "mcq") return acc + 1;
        if (q.type === "rapid" || q.type === "essay") return acc + (q.subquestions?.length || 0);
        return acc;
    }, 0);

    const answeredSteps = questions.reduce((acc, q) => {
        if (q.type === "mcq") return acc + (answers[q.id] ? 1 : 0);
        if (q.type === "rapid" || q.type === "essay") {
            const answeredSubs = q.subquestions?.filter((_, i) => answers[`${q.id}-${i}`])?.length || 0;
            return acc + answeredSubs;
        }
        return acc;
    }, 0);

    const progress = Math.round((answeredSteps / totalSteps) * 100);

    const correctCount = questions.reduce((acc, q) => {
        if (q.type === "mcq" && answers[q.id] === q.correctOption) return acc + 1;
        if (q.type === "rapid") {
            const correctSubs = q.subquestions?.reduce((subAcc, sub, i) => {
                const key = `${q.id}-${i}`;
                if (answers[key] && answers[key] === sub.correctOption) return subAcc + 1;
                return subAcc;
            }, 0) || 0;
            return acc + correctSubs;
        }
        return acc;
    }, 0);

    const incorrectCount = questions.reduce((acc, q) => {
        if (q.type === "mcq" && answers[q.id] && answers[q.id] !== q.correctOption) return acc + 1;
        if (q.type === "rapid") {
            const incorrectSubs = q.subquestions?.reduce((subAcc, sub, i) => {
                const key = `${q.id}-${i}`;
                if (answers[key] && answers[key] !== sub.correctOption) return subAcc + 1;
                return subAcc;
            }, 0) || 0;
            return acc + incorrectSubs;
        }
        return acc;
    }, 0);

    const unansweredCount = totalSteps - Object.keys(answers).length;

    const handleQuizSubmit = () => {
        // Calculate counts per type
        let totalMCQs = 0, correctMCQs = 0;
        let totalRapid = 0, correctRapid = 0;
        let totalEssay = 0, correctEssay = 0;

        questions.forEach(q => {
            if (q.type === "mcq") {
                totalMCQs += 1;
                if (answers[q.id] === q.correctOption) correctMCQs += 1;
            } else if (q.type === "rapid") {
                const subCount = q.subquestions?.length || 0;
                totalRapid += subCount;
                q.subquestions?.forEach((sub, i) => {
                    const key = `${q.id}-${i}`;
                    if (answers[key] && answers[key] === sub.correctOption) correctRapid += 1;
                });
            } else if (q.type === "essay") {
                const subCount = q.subquestions?.length || 0;
                totalEssay += subCount;
                q.subquestions?.forEach((sub, i) => {
                    const key = `${q.id}-${i}`;
                    // For essay, you can consider non-empty answer as "correct" if needed
                    if (answers[key] && answers[key].trim().length > 0) correctEssay += 1;
                });
            }
        });

        const overallScore = Math.round(((correctMCQs + correctRapid + correctEssay) / (totalMCQs + totalRapid + totalEssay)) * 100);
        const mcqScore = totalMCQs > 0 ? Math.round((correctMCQs / totalMCQs) * 100) : 0;
        const rapidScore = totalRapid > 0 ? Math.round((correctRapid / totalRapid) * 100) : 0;
        const essayScore = totalEssay > 0 ? Math.round((correctEssay / totalEssay) * 100) : 0;

        navigate("/progress-report", {
            state: {
                overallScore,
                correctAnswers: correctMCQs + correctRapid + correctEssay,
                incorrectAnswers: (totalMCQs + totalRapid + totalEssay) - (correctMCQs + correctRapid + correctEssay),
                mcqScore,
                rapidScore,
                essayScore,
            }
        });
    };


    return (
        <div className="quiz-container">
            <div className="quiz-main">
                <div className="button-container">
                    <button className="back-btn" onClick={() => console.log("Back")}>
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
                        selectedOption={answers[currentQuestion.id]}
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
                        onNext={nextQuestion}
                        onBack={prevQuestion}
                        onAnswerSelect={handleAnswerSelect}
                        selectedOption={answers}
                        isFirstQuestion={isFirstQuestion}
                        isLastQuestion={isLastQuestion}
                        handleQuizSubmit={handleQuizSubmit}
                    />
                )}

                {currentQuestion?.type === "essay" && (
                    <Essay
                        data={currentQuestion}
                        onNext={nextQuestion}
                        onBack={prevQuestion}
                        onAnswerSelect={handleAnswerSelect}
                        selectedOption={answers}
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
