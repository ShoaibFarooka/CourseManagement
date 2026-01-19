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
    const [loadedPages, setLoadedPages] = useState(new Set());
    const [markedQuestions, setMarkedQuestions] = useState(new Set());
    const limit = 10;
    const [totalQuestions, setTotalQuestions] = useState(0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [time, setTime] = useState(QUIZ_TIME);


    //Fetch Questions 
    const fetchQuestions = async (pageToFetch = 1) => {
        try {
            if (loadedPages.has(pageToFetch)) return;

            dispatch(ShowLoading());

            const res = await questionService.fetchQuestionsWithFilters({
                publisherId,
                selectedUnits,
                selectedSubunits,
                page: pageToFetch,
                limit,
            });

            setQuestions(prev => {
                const newQuestions = [...prev];
                const startIndex = (pageToFetch - 1) * limit;

                res.data.forEach((q, idx) => {
                    newQuestions[startIndex + idx] = q;
                });

                return newQuestions;
            });

            setLoadedPages(prev => new Set([...prev, pageToFetch]));
            setTotalQuestions(res.pagination.total);
        } catch (error) {
            message.error(error.response?.data?.error || "Failed to load questions");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchQuestions(1);
    }, []);

    /* Timer */
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

    /*  Answer Handling  */
    const handleAnswerSelect = (key, value) => {
        setAnswers(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    /*  Navigation */
    const goToQuestion = async (index) => {
        const pageNeeded = Math.floor(index / limit) + 1;

        if (!loadedPages.has(pageNeeded)) {
            await fetchQuestions(pageNeeded);
        }

        setCurrentIndex(index);
    };

    const nextQuestion = async () => {
        const nextIndex = currentIndex + 1;

        if (nextIndex < totalQuestions) {
            const pageNeeded = Math.floor(nextIndex / limit) + 1;

            if (!loadedPages.has(pageNeeded)) {
                await fetchQuestions(pageNeeded);
            }

            setCurrentIndex(nextIndex);
        }
    };

    const prevQuestion = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    const currentQuestion = questions[currentIndex];
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === totalQuestions - 1;

    /*  Helper: Check if Question Answered  */
    const isQuestionAnswered = (question) => {
        if (!question) return false;

        if (question.type === "mcq") {
            return answers[`mcq:${question._id}`] !== undefined;
        }

        if (question.type === "essay") {
            const essayAnswer = answers[`essay:${question._id}`];
            return essayAnswer !== undefined && essayAnswer !== null && essayAnswer.trim().length > 0;
        }

        if (question.type === "rapid") {
            const totalSubs = question.subquestions?.length || 0;
            if (totalSubs === 0) return false;

            const answeredSubs = question.subquestions.filter((_, i) =>
                answers[`rapid:${question._id}:${i}`] !== undefined
            ).length;

            return answeredSubs === totalSubs;
        }

        return false;
    };

    const toggleMarkQuestion = (questionId) => {
        setMarkedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const markedCount = markedQuestions.size;

    /*  Progress Calculations */
    const totalStepsFromLoaded = useMemo(() => {
        return questions.reduce((acc, q) => {
            if (!q) return acc;
            if (q.type === "mcq") return acc + 1;
            if (q.type === "essay") return acc + 1;
            if (q.type === "rapid") return acc + (q.subquestions?.length || 0);
            return acc;
        }, 0);
    }, [questions]);

    // Estimate average steps per question from loaded questions
    const averageStepsPerQuestion = useMemo(() => {
        const loadedCount = questions.filter(q => q).length;
        if (loadedCount === 0) return 1;
        return totalStepsFromLoaded / loadedCount;
    }, [totalStepsFromLoaded, questions]);

    // Estimate total steps based on total questions
    const estimatedTotalSteps = Math.round(totalQuestions * averageStepsPerQuestion);

    // Use estimated total steps
    const totalSteps = estimatedTotalSteps > 0 ? estimatedTotalSteps : totalStepsFromLoaded;

    const answeredSteps = useMemo(() => {
        let count = 0;
        questions.forEach(q => {
            if (!q) return;
            if (q.type === "mcq") {
                if (answers[`mcq:${q._id}`] !== undefined) {
                    count += 1;
                }
            } else if (q.type === "essay") {
                const essayAnswer = answers[`essay:${q._id}`];
                if (essayAnswer !== undefined && essayAnswer !== null && essayAnswer.trim().length > 0) {
                    count += 1;
                }
            } else if (q.type === "rapid") {
                const answeredSubCount = q.subquestions?.filter((_, i) =>
                    answers[`rapid:${q._id}:${i}`] !== undefined
                ).length || 0;
                count += answeredSubCount;
            }
        });
        return count;
    }, [answers, questions]);

    const progress = totalSteps === 0 ? 0 : Math.round((answeredSteps / totalSteps) * 100);

    /* Correct And Incorrect  */
    const correctCount = useMemo(() => {
        return questions.reduce((acc, q) => {
            if (!q) return acc;
            if (q.type === "mcq") {
                const key = `mcq:${q._id}`;
                if (answers[key] !== undefined && answers[key] === q.correctOption) {
                    return acc + 1;
                }
            }

            if (q.type === "rapid") {
                const correctSubs = q.subquestions?.reduce((sAcc, sub, i) => {
                    const key = `rapid:${q._id}:${i}`;
                    if (answers[key] !== undefined && answers[key] === sub.correctOption) {
                        return sAcc + 1;
                    }
                    return sAcc;
                }, 0) || 0;
                return acc + correctSubs;
            }

            return acc;
        }, 0);
    }, [questions, answers]);

    const incorrectCount = useMemo(() => {
        return questions.reduce((acc, q) => {
            if (!q) return acc;
            if (q.type === "mcq") {
                const key = `mcq:${q._id}`;
                if (answers[key] !== undefined && answers[key] !== q.correctOption) {
                    return acc + 1;
                }
            }

            if (q.type === "rapid") {
                const incorrectSubs = q.subquestions?.reduce((sAcc, sub, i) => {
                    const key = `rapid:${q._id}:${i}`;
                    if (answers[key] !== undefined && answers[key] !== sub.correctOption) {
                        return sAcc + 1;
                    }
                    return sAcc;
                }, 0) || 0;
                return acc + incorrectSubs;
            }

            return acc;
        }, 0);
    }, [questions, answers]);

    const unansweredCount = totalSteps - answeredSteps;

    /*  Submit Quiz */
    const handleQuizSubmit = () => {
        navigate("/progress-report", {
            state: {
                overallScore: progress,
                correctAnswers: correctCount,
                incorrectAnswers: incorrectCount,
            }
        });
    };

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
                    marked={markedCount}
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
                        isMarked={markedQuestions.has(currentQuestion._id)}
                        onToggleMark={() => toggleMarkQuestion(currentQuestion._id)}
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
                        isMarked={markedQuestions.has(currentQuestion._id)}
                        onToggleMark={() => toggleMarkQuestion(currentQuestion._id)}
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
                        isMarked={markedQuestions.has(currentQuestion._id)}
                        onToggleMark={() => toggleMarkQuestion(currentQuestion._id)}
                    />
                )}
            </div>

            <aside className="quiz-sidebar">
                <ProgressCircle progress={progress} />
                <QuestionNavigator
                    questions={questions}
                    totalQuestions={totalQuestions}
                    currentIndex={currentIndex}
                    onNavigate={goToQuestion}
                    isQuestionAnswered={isQuestionAnswered}
                />
            </aside>
        </div>
    );
};

export default Quiz;