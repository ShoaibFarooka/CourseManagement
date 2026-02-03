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
import CustomModal from "../../../components/CustomModal/CustomModal";
import ExitModal from "./components/ExitModal/ExitModal";
import TimeUpModal from './components/TimeUpModal/TimeUpModal';
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
    const location = useLocation();

    const {
        source,
        publisherId,
        selectedUnits,
        selectedSubunits,
        courseId,
        partId,
        examType,
        limit,
        timeRatio,
    } = state || {};

    const [questions, setQuestions] = useState([]);
    const [loadedPages, setLoadedPages] = useState(new Set());
    const [markedQuestions, setMarkedQuestions] = useState(new Set());
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [time, setTime] = useState(QUIZ_TIME);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const PAGE_SIZE = 20;

    const fetchQuestions = async (pageToFetch = 1) => {
        try {
            if (loadedPages.has(pageToFetch)) {
                console.log(`Page ${pageToFetch} already loaded, skipping`);
                return;
            }

            setLoadedPages(prev => new Set([...prev, pageToFetch]));
            dispatch(ShowLoading());

            let res;

            if (source === 'practice-exam') {
                res = await questionService.fetchPracticeExamQuestions({
                    courseId,
                    partId,
                    examType,
                    page: pageToFetch,
                    limit: PAGE_SIZE
                });
            } else if (source === 'package-exam') {
                if (examType === 'standard') {
                    res = await questionService.fetchStandardReviewQuestions({
                        courseId,
                        partId,
                        page: pageToFetch,
                        limit: PAGE_SIZE
                    });
                } else if (examType === 'mega') {
                    res = await questionService.fetchMegaReviewQuestions({
                        courseId,
                        partId,
                        userLimit: limit,
                        page: pageToFetch,
                        pageSize: PAGE_SIZE
                    });
                } else {
                    throw new Error("Invalid package exam type");
                }
            } else {
                res = await questionService.fetchQuestionsWithFilters({
                    courseId,
                    partId,
                    publisherId,
                    selectedUnits,
                    selectedSubunits,
                    page: pageToFetch,
                    limit: PAGE_SIZE,
                });
            }

            setQuestions(prev => {
                const newQuestions = [...prev];
                const startIndex = (pageToFetch - 1) * PAGE_SIZE;

                (res.data || []).forEach((q, idx) => {
                    newQuestions[startIndex + idx] = q;
                });

                return newQuestions;
            });

            setTotalQuestions(res.pagination?.total || (res?.data?.length || 0));

        } catch (error) {
            setLoadedPages(prev => {
                const newSet = new Set(prev);
                newSet.delete(pageToFetch);
                return newSet;
            });
            message.error(error.response?.data?.error || error.message || "Failed to load questions");
        } finally {
            dispatch(HideLoading());
        }
    };

    const goToQuestion = async (index) => {
        const pageNeeded = Math.floor(index / PAGE_SIZE) + 1;

        if (!loadedPages.has(pageNeeded)) {
            await fetchQuestions(pageNeeded);
        }

        setCurrentIndex(index);
    };

    const nextQuestion = async () => {
        const nextIndex = currentIndex + 1;

        if (nextIndex < totalQuestions) {
            const pageNeeded = Math.floor(nextIndex / PAGE_SIZE) + 1;

            if (!loadedPages.has(pageNeeded)) {
                await fetchQuestions(pageNeeded);
            }

            setCurrentIndex(nextIndex);
        }
    };

    useEffect(() => {
        if (!location.state?.source) {
            navigate("/dashboard");
        } else {
            fetchQuestions(1);
        }
    }, []);

    useEffect(() => {
        if (!timeRatio || !totalQuestions) return;

        const totalTimeInSeconds = Math.round(timeRatio * totalQuestions * 60);
        setTime(totalTimeInSeconds);
    }, [timeRatio, totalQuestions]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
            return 'Are you sure you want to leave? Your quiz progress will be lost.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    /* Timer */
    useEffect(() => {
        if (time <= 0) {
            setShowTimeUpModal(true);
            return;
        }

        const timer = setInterval(() => {
            setTime(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowTimeUpModal(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [time]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" + secs : secs}`;
    };

    const handleAnswerSelect = (key, value) => {
        setAnswers(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const prevQuestion = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    const currentQuestion = questions[currentIndex] || null;
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === totalQuestions - 1;

    const isQuestionAnswered = (question) => {
        if (!question) return false;

        if (question.type === "mcq") {
            return answers[`mcq:${question._id}`] !== undefined;
        }

        if (question.type === "essay") {
            const totalSubs = question.subquestions?.length || 0;
            if (totalSubs === 0) return false;

            const answeredSubs = question.subquestions.filter((_, i) => {
                const answerKey = `essay:${question._id}:${i}:answer`;
                const ratingKey = `essay:${question._id}:${i}:rating`;
                const essayAnswer = answers[answerKey];
                const rating = answers[ratingKey];
                return essayAnswer !== undefined && essayAnswer !== null && essayAnswer.trim().length > 0 && rating !== undefined;
            }).length;

            return answeredSubs === totalSubs;
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

    const totalStepsFromLoaded = useMemo(() => {
        return questions.reduce((acc, q) => {
            if (!q) return acc;
            if (q.type === "mcq") return acc + 1;
            if (q.type === "essay") return acc + (q.subquestions?.length || 0);
            if (q.type === "rapid") return acc + (q.subquestions?.length || 0);
            return acc;
        }, 0);
    }, [questions]);

    const averageStepsPerQuestion = useMemo(() => {
        const loadedCount = questions.filter(q => q).length;
        if (loadedCount === 0) return 1;
        return totalStepsFromLoaded / loadedCount;
    }, [totalStepsFromLoaded, questions]);

    const estimatedTotalSteps = Math.round(totalQuestions * averageStepsPerQuestion);
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
                const answeredSubCount = q.subquestions?.filter((_, i) => {
                    const answerKey = `essay:${q._id}:${i}:answer`;
                    const ratingKey = `essay:${q._id}:${i}:rating`;
                    const essayAnswer = answers[answerKey];
                    const rating = answers[ratingKey];
                    return essayAnswer !== undefined && essayAnswer !== null && essayAnswer.trim().length > 0 && rating !== undefined;
                }).length || 0;
                count += answeredSubCount;
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

    const answeredQuestionsCount = useMemo(() => {
        let count = 0;
        questions.forEach(q => {
            if (!q) return;

            if (q.type === "mcq") {
                if (answers[`mcq:${q._id}`] !== undefined) {
                    count += 1;
                }
            } else if (q.type === "essay") {
                const totalSubs = q.subquestions?.length || 0;
                const answeredSubs = q.subquestions?.filter((_, i) => {
                    const answerKey = `essay:${q._id}:${i}:answer`;
                    const ratingKey = `essay:${q._id}:${i}:rating`;
                    const essayAnswer = answers[answerKey];
                    const rating = answers[ratingKey];
                    return essayAnswer !== undefined && essayAnswer !== null && essayAnswer.trim().length > 0 && rating !== undefined;
                }).length || 0;

                if (totalSubs > 0 && answeredSubs === totalSubs) {
                    count += 1;
                }
            } else if (q.type === "rapid") {
                const totalSubs = q.subquestions?.length || 0;
                const answeredSubs = q.subquestions?.filter((_, i) =>
                    answers[`rapid:${q._id}:${i}`] !== undefined
                ).length || 0;

                if (totalSubs > 0 && answeredSubs === totalSubs) {
                    count += 1;
                }
            }
        });
        return count;
    }, [answers, questions]);

    const correctCount = useMemo(() => {
        let totalCorrect = 0;

        questions.forEach(q => {
            if (!q) return;

            if (q.type === "mcq") {
                const key = `mcq:${q._id}`;
                if (answers[key] !== undefined && answers[key] === q.correctOption) {
                    totalCorrect += 1;
                }
            }

            if (q.type === "rapid") {
                const totalSubs = q.subquestions?.length || 0;
                if (totalSubs === 0) return;

                const weightPerSub = 1 / totalSubs;

                q.subquestions?.forEach((sub, i) => {
                    const key = `rapid:${q._id}:${i}`;
                    if (answers[key] !== undefined && answers[key] === sub.correctOption) {
                        totalCorrect += weightPerSub;
                    }
                });
            }

            if (q.type === "essay") {
                const totalSubs = q.subquestions?.length || 0;
                if (totalSubs === 0) return;

                const weightPerSub = 1 / totalSubs;

                q.subquestions?.forEach((_, i) => {
                    const ratingKey = `essay:${q._id}:${i}:rating`;
                    const rating = answers[ratingKey];
                    if (rating !== undefined) {
                        // Rating is out of 5, so we calculate the percentage and multiply by weight
                        totalCorrect += (rating / 5) * weightPerSub;
                    }
                });
            }
        });

        return Math.round(totalCorrect * 100) / 100;
    }, [questions, answers]);

    const incorrectCount = useMemo(() => {
        let totalIncorrect = 0;

        questions.forEach(q => {
            if (!q) return;

            if (q.type === "mcq") {
                const key = `mcq:${q._id}`;
                if (answers[key] !== undefined && answers[key] !== q.correctOption) {
                    totalIncorrect += 1;
                }
            }

            if (q.type === "rapid") {
                const totalSubs = q.subquestions?.length || 0;
                if (totalSubs === 0) return;

                const weightPerSub = 1 / totalSubs;

                q.subquestions?.forEach((sub, i) => {
                    const key = `rapid:${q._id}:${i}`;
                    if (answers[key] !== undefined && answers[key] !== sub.correctOption) {
                        totalIncorrect += weightPerSub;
                    }
                });
            }

            if (q.type === "essay") {
                const totalSubs = q.subquestions?.length || 0;
                if (totalSubs === 0) return;

                const weightPerSub = 1 / totalSubs;

                q.subquestions?.forEach((_, i) => {
                    const ratingKey = `essay:${q._id}:${i}:rating`;
                    const rating = answers[ratingKey];
                    if (rating !== undefined) {
                        // Incorrect portion is (5 - rating) / 5 * weight
                        totalIncorrect += ((5 - rating) / 5) * weightPerSub;
                    }
                });
            }
        });

        return Math.round(totalIncorrect * 100) / 100;
    }, [questions, answers]);


    const unansweredCount = totalQuestions - answeredQuestionsCount;


    const calculateMCQScore = () => {
        let totalMCQ = 0;
        let correctMCQ = 0;

        questions.forEach(q => {
            if (!q || q.type !== "mcq") return;

            totalMCQ += 1;
            const key = `mcq:${q._id}`;
            if (answers[key] !== undefined && answers[key] === q.correctOption) {
                correctMCQ += 1;
            }
        });

        return totalMCQ === 0 ? 0 : Math.round((correctMCQ / totalMCQ) * 100);
    };

    const calculateRapidScore = () => {
        let totalRapidSubs = 0;
        let correctRapidSubs = 0;

        questions.forEach(q => {
            if (!q || q.type !== "rapid") return;

            const subs = q.subquestions || [];
            totalRapidSubs += subs.length;

            subs.forEach((sub, i) => {
                const key = `rapid:${q._id}:${i}`;
                if (answers[key] !== undefined && answers[key] === sub.correctOption) {
                    correctRapidSubs += 1;
                }
            });
        });

        return totalRapidSubs === 0 ? 0 : Math.round((correctRapidSubs / totalRapidSubs) * 100);
    };

    const calculateEssayScore = () => {
        let totalEssaySubs = 0;
        let totalRatingScore = 0;

        questions.forEach(q => {
            if (!q || q.type !== "essay") return;

            const subs = q.subquestions || [];
            totalEssaySubs += subs.length;

            subs.forEach((_, i) => {
                const ratingKey = `essay:${q._id}:${i}:rating`;
                const rating = answers[ratingKey];
                if (rating !== undefined) {
                    // Convert rating (0-5) to percentage
                    totalRatingScore += (rating / 5) * 100;
                }
            });
        });

        return totalEssaySubs === 0 ? 0 : Math.round(totalRatingScore / totalEssaySubs);
    };



    const handleQuizSubmit = () => {
        const mcqScore = calculateMCQScore();
        const rapidScore = calculateRapidScore();
        const essayScore = calculateEssayScore();

        navigate("/progress-report", {
            state: {
                source,
                overallScore: progress,
                correctAnswers: correctCount,
                incorrectAnswers: incorrectCount,
                mcqScore,
                rapidScore,
                essayScore
            }
        });
    };


    const handleTimeUpSubmit = () => {
        setShowTimeUpModal(false);
        handleQuizSubmit();
    };

    const handleTimeUpContinue = () => {
        setShowTimeUpModal(false);
    };

    const handleBackClick = () => {
        setShowExitModal(true);
    };

    const handleExitConfirm = () => {
        setShowExitModal(false);
        if (source === 'unit-exam') {
            navigate("/dashboard/unit-exams");
        } else if (source === 'practice-exam') {
            navigate("/dashboard/practice-exams");
        } else if (source === 'package-exam') {
            navigate("/dashboard/package-exams");
        } else {
            navigate("/dashboard");
        }
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };

    if (!questions.length) {
        return <div className="quiz-container">
            <span className="question-loading">Quesions Loading......</span>
        </div>;
    }

    const toUpperCase = (string) => {
        return string
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };
    return (
        <>
            <div className="quiz">
            </div>
            <div className="quiz-container">
                <div className="quiz-main">
                    <div className="button-container">
                        <button className="back-btn" onClick={handleBackClick}>
                            <FaChevronLeft /> BACK
                        </button>
                    </div>

                    <div className="quiz-header">
                        <div className="title">{toUpperCase(source)}</div>
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
                            source={source}
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
                            source={source}
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
                            source={source}
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

                {/* Time Up Modal */}
                <CustomModal
                    isOpen={showTimeUpModal}
                    onRequestClose={handleTimeUpContinue}
                    title="Time's Up!"
                    width="60%"
                >
                    <TimeUpModal
                        show={true}
                        onSubmit={handleTimeUpSubmit}
                        onContinue={handleTimeUpContinue}
                    />
                </CustomModal>

                {/* Exit Confirmation Modal */}
                <CustomModal
                    isOpen={showExitModal}
                    onRequestClose={handleExitCancel}
                    title="Exit Quiz?"
                    width="60%"
                >
                    <ExitModal
                        show={showExitModal}
                        onConfirm={handleExitConfirm}
                        onCancel={handleExitCancel}
                    />
                </CustomModal>
            </div>
        </>
    );
};

export default Quiz;