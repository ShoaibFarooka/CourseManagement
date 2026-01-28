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

    const totalStepsFromLoaded = useMemo(() => {
        return questions.reduce((acc, q) => {
            if (!q) return acc;
            if (q.type === "mcq") return acc + 1;
            if (q.type === "essay") return acc + 1;
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

    const answeredQuestionsCount = useMemo(() => {
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
        });

        return Math.round(totalIncorrect * 100) / 100;
    }, [questions, answers]);


    const totalActualQuestions = useMemo(() => {
        return questions.filter(q => q).length;
    }, [questions]);

    const unansweredCount = totalActualQuestions - answeredQuestionsCount;

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
        let totalEssay = 0;
        let answeredEssay = 0;

        questions.forEach(q => {
            if (!q || q.type !== "essay") return;

            totalEssay += 1;
            const key = `essay:${q._id}`;
            const essayAnswer = answers[key];
            if (essayAnswer !== undefined && essayAnswer !== null && essayAnswer.trim().length > 0) {
                answeredEssay += 1;
            }
        });

        return totalEssay === 0 ? 0 : Math.round((answeredEssay / totalEssay) * 100);
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
            navigate("/unit-exams");
        } else if (source === 'practice-exam') {
            navigate("/practice-exams");
        } else if (source === 'package-exam') {
            navigate("/package-exams");
        } else {
            navigate("/dashboard");
        }
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };

    if (!questions.length) {
        return <div className="quiz-container">Loading questions...</div>;
    }

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