import React, { useState, useEffect, useMemo, useRef } from "react";
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
import SubmitModal from "./components/SubmitModal/SubmitModal";
import TimeUpModal from './components/TimeUpModal/TimeUpModal';
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import questionService from "../../../services/questionServices";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import progressService from '../../../services/progressService';
import plannerService from '../../../services/plannerService';

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
        prefetchedQuestions,
        questionLimit,
        plannerDay,
    } = state || {};

    const isPrefetched = prefetchedQuestions && prefetchedQuestions.length > 0;
    const language = useSelector(state => state.user?.user.language);

    // A planner day is a practice session, so it behaves like a unit exam: the first
    // answer is the one scored, and answers feed the unit progress stats.
    const usesFirstAnswers = source === "unit-exam" || source === "package-exam" || source === "planner";
    const tracksUnitProgress = source === "unit-exam" || source === "planner";
    const plannerSelection = source === "planner" ? { courseId, partId, publisherId } : null;

    const [questions, setQuestions] = useState([]);
    const [loadedPages, setLoadedPages] = useState(new Set());
    const [markedQuestions, setMarkedQuestions] = useState(new Set());
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [firstAnswers, setFirstAnswers] = useState({});
    const [time, setTime] = useState(QUIZ_TIME);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const PAGE_SIZE = 20;

    const pendingProgressRef = useRef([]);
    // Planner: questions fully attempted this session, and those not yet sent.
    const plannerReportedRef = useRef(new Set());
    const plannerPendingRef = useRef([]);

    const fetchQuestions = async (pageToFetch = 1) => {
        try {
            if (loadedPages.has(pageToFetch)) return;

            setLoadedPages(prev => new Set([...prev, pageToFetch]));
            dispatch(ShowLoading());

            let res;

            if (source === 'practice-exam') {
                res = await questionService.fetchPracticeExamQuestions({
                    courseId,
                    partId,
                    examType,
                    page: pageToFetch,
                    limit: PAGE_SIZE,
                    language,
                });
            } else if (source === 'package-exam') {
                if (examType === 'standard') {
                    res = await questionService.fetchStandardReviewQuestions({
                        courseId,
                        partId,
                        userLimit: limit,
                        page: pageToFetch,
                        limit: PAGE_SIZE,
                        language,
                    });
                } else if (examType === 'mega') {
                    res = await questionService.fetchMegaReviewQuestions({
                        courseId,
                        partId,
                        userLimit: limit,
                        page: pageToFetch,
                        pageSize: PAGE_SIZE,
                        language,
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
                    language,
                    questionLimit: questionLimit || null,
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

            setTotalQuestions(res.pagination?.total || res?.data?.length || 0);

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
        if (!isPrefetched) {
            const pageNeeded = Math.floor(index / PAGE_SIZE) + 1;
            if (!loadedPages.has(pageNeeded)) {
                await fetchQuestions(pageNeeded);
            }
        }

        setCurrentIndex(index);
    };


    const nextQuestion = async () => {
        const nextIndex = currentIndex + 1;

        if (nextIndex < totalQuestions) {
            if (!isPrefetched) {
                const pageNeeded = Math.floor(nextIndex / PAGE_SIZE) + 1;
                if (!loadedPages.has(pageNeeded)) {
                    await fetchQuestions(pageNeeded);
                }
            }

            setCurrentIndex(nextIndex);
        }
    };


    useEffect(() => {
        if (!location.state?.source) {
            navigate("/dashboard");
            return;
        }


        if (isPrefetched) {
            setQuestions(prefetchedQuestions);
            setTotalQuestions(prefetchedQuestions.length);
            return;
        }

        fetchQuestions(1);
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

    const getIsCorrect = (question, key, value) => {
        if (question.type === "mcq") {
            return value === question.correctOption;
        }
        if (question.type === "rapid") {
            const subIndex = parseInt(key.split(":")[2]);
            const sub = question.subquestions?.[subIndex];
            return value === sub?.correctOption;
        }
        if (question.type === "essay") {
            if (key.endsWith(":rating")) {
                return parseInt(value) >= 3;
            }
            return null;
        }
        return null;
    };


    const handleAnswerSelect = (key, value) => {
        if (usesFirstAnswers && !firstAnswers[key]) {
            setFirstAnswers((prev) => ({ ...prev, [key]: value }));
        }
        setAnswers((prev) => ({ ...prev, [key]: value }));

        if (!tracksUnitProgress) return;

        const question = currentQuestion;
        if (!question) return;
        if (firstAnswers[key] !== undefined) return;

        const isCorrect = getIsCorrect(question, key, value);
        if (isCorrect === null) return;


        pendingProgressRef.current.push({
            courseId,
            partId,
            publisherId,
            unitId: question.unit,
            questionId: question._id,
            isCorrect,
            answeredAt: new Date().toISOString(),
        });

        // Attempting a marked question unmarks it: it now counts as correct/incorrect.
        // The server removes the saved mark when this answer is recorded.
        if (markedQuestions.has(question._id)) {
            setQuestionMarkedLocally(question._id, false);
        }
    };

    const flushProgress = async () => {
        if (pendingProgressRef.current.length === 0) return;

        const batch = [...pendingProgressRef.current];
        pendingProgressRef.current = [];

        try {
            await progressService.recordAnswerBatch(batch, language);
        } catch (err) {
            pendingProgressRef.current = [...batch, ...pendingProgressRef.current];
            console.error("Batch progress sync failed:", err);
        }
    };

    const flushPlannerProgress = async () => {
        if (source !== "planner" || plannerPendingRef.current.length === 0) return;

        const batch = [...plannerPendingRef.current];
        plannerPendingRef.current = [];

        try {
            await plannerService.recordDayProgress({
                ...plannerSelection,
                dayNumber: plannerDay,
                questionIds: batch,
                language,
            });
        } catch (err) {
            plannerPendingRef.current = [...batch, ...plannerPendingRef.current];
            console.error("Planner progress sync failed:", err);
        }
    };

    // Kept in a ref so the interval below always calls the latest closures.
    const flushAllRef = useRef(null);
    flushAllRef.current = () => Promise.all([flushProgress(), flushPlannerProgress()]);

    useEffect(() => {
        if (!tracksUnitProgress) return;

        const interval = setInterval(() => flushAllRef.current(), 30000);
        return () => clearInterval(interval);
    }, [source]);

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

    // Planner: queue each question once it is fully attempted (every subquestion of a
    // rapid/essay question), which is what counts towards completing the day.
    useEffect(() => {
        if (source !== "planner") return;

        questions.forEach(q => {
            if (!q || plannerReportedRef.current.has(q._id)) return;
            if (!isQuestionAnswered(q)) return;

            plannerReportedRef.current.add(q._id);
            plannerPendingRef.current.push(q._id);
        });
    }, [answers, questions]);

    const setQuestionMarkedLocally = (questionId, marked) => {
        setMarkedQuestions(prev => {
            const newSet = new Set(prev);
            if (marked) {
                newSet.add(questionId);
            } else {
                newSet.delete(questionId);
            }
            return newSet;
        });
    };

    // Marks are saved to the database. The button flips straight away and is put back
    // if the save fails.
    const toggleMarkQuestion = async (questionId) => {
        const marked = !markedQuestions.has(questionId);
        setQuestionMarkedLocally(questionId, marked);

        try {
            await progressService.markQuestion(questionId, marked);
        } catch (error) {
            setQuestionMarkedLocally(questionId, !marked);
            message.error(error?.response?.data?.error || "Failed to save the mark. Please try again.");
        }
    };

    // Load the saved mark state for questions as they are loaded (pages arrive lazily),
    // asking about each question only once.
    const markStatusCheckedRef = useRef(new Set());

    useEffect(() => {
        const unchecked = questions
            .filter(q => q && !markStatusCheckedRef.current.has(q._id))
            .map(q => q._id);

        if (!unchecked.length) return;
        unchecked.forEach(id => markStatusCheckedRef.current.add(id));

        // The endpoint takes at most 500 ids; prefetched sessions can be larger.
        const STATUS_BATCH = 500;
        for (let i = 0; i < unchecked.length; i += STATUS_BATCH) {
            const batch = unchecked.slice(i, i + STATUS_BATCH);

            progressService.getMarkedStatus(batch)
                .then(({ markedIds = [] }) => {
                    if (!markedIds.length) return;
                    setMarkedQuestions(prev => new Set([...prev, ...markedIds]));
                })
                .catch(err => {
                    // Allow a retry the next time questions change.
                    batch.forEach(id => markStatusCheckedRef.current.delete(id));
                    console.error("Failed to load marked questions:", err);
                });
        }
    }, [questions]);

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

        // Use firstAnswers for unit-exam, package-exam and planner, otherwise use answers
        const scoreAnswers = usesFirstAnswers ? firstAnswers : answers;

        questions.forEach(q => {
            if (!q) return;

            if (q.type === "mcq") {
                const key = `mcq:${q._id}`;
                if (scoreAnswers[key] !== undefined && scoreAnswers[key] === q.correctOption) {
                    totalCorrect += 1;
                }
            }

            if (q.type === "rapid") {
                const totalSubs = q.subquestions?.length || 0;
                if (totalSubs === 0) return;

                const weightPerSub = 1 / totalSubs;

                q.subquestions?.forEach((sub, i) => {
                    const key = `rapid:${q._id}:${i}`;
                    if (scoreAnswers[key] !== undefined && scoreAnswers[key] === sub.correctOption) {
                        totalCorrect += weightPerSub;
                    }
                });
            }

            // Essay questions remain the same as they use ratings
            if (q.type === "essay") {
                const totalSubs = q.subquestions?.length || 0;
                if (totalSubs === 0) return;

                const weightPerSub = 1 / totalSubs;

                q.subquestions?.forEach((_, i) => {
                    const ratingKey = `essay:${q._id}:${i}:rating`;
                    const rating = answers[ratingKey];
                    if (rating !== undefined) {
                        totalCorrect += (rating / 5) * weightPerSub;
                    }
                });
            }
        });

        return Math.round(totalCorrect * 100) / 100;
    }, [questions, answers, firstAnswers, source]);

    const incorrectCount = useMemo(() => {
        let totalIncorrect = 0;
        const scoreAnswers = usesFirstAnswers ? firstAnswers : answers;

        questions.forEach(q => {
            if (!q) return;

            if (q.type === "mcq") {
                const key = `mcq:${q._id}`;
                if (scoreAnswers[key] !== undefined && scoreAnswers[key] !== q.correctOption) {
                    totalIncorrect += 1;
                }
            }

            if (q.type === "rapid") {
                const totalSubs = q.subquestions?.length || 0;
                if (totalSubs === 0) return;

                const weightPerSub = 1 / totalSubs;

                q.subquestions?.forEach((sub, i) => {
                    const key = `rapid:${q._id}:${i}`;
                    if (scoreAnswers[key] !== undefined && scoreAnswers[key] !== sub.correctOption) {
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
                        totalIncorrect += ((5 - rating) / 5) * weightPerSub;
                    }
                });
            }
        });

        return Math.round(totalIncorrect * 100) / 100;
    }, [questions, answers, firstAnswers, source]);

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



    const handleQuizSubmit = async () => {
        if (tracksUnitProgress) {
            await flushAllRef.current();
        }

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
                essayScore,
                plannerSelection,
            },
        });
    };


    // The question components' Submit buttons open this confirmation first; the
    // time-up flow still submits directly.
    const handleSubmitClick = () => {
        setShowSubmitModal(true);
    };

    const handleSubmitConfirm = () => {
        setShowSubmitModal(false);
        handleQuizSubmit();
    };

    const handleSubmitCancel = () => {
        setShowSubmitModal(false);
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

    const handleExitConfirm = async () => {
        setShowExitModal(false);
        if (source === 'planner') {
            // Keep what the user finished before leaving, so the day resumes from there.
            await flushAllRef.current();
            navigate("/dashboard/planner", { state: { plannerSelection } });
        } else if (source === 'unit-exam') {
            // Save answers given since the last 30-second sync before leaving.
            await flushAllRef.current();
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
                        <div className="title">
                            {toUpperCase(source)}
                            {source === "planner" && plannerDay && ` - Day ${plannerDay}`}
                        </div>
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
                        source={source}
                    />

                    {currentQuestion?.type === "mcq" && (
                        <MCQs
                            question={currentQuestion}
                            questionIndex={currentIndex}
                            selectedOption={answers[`mcq:${currentQuestion._id}`]}
                            firstSelectedAnswer={firstAnswers[`mcq:${currentQuestion._id}`]}
                            onAnswerSelect={handleAnswerSelect}
                            onNext={nextQuestion}
                            onBack={prevQuestion}
                            isFirstQuestion={isFirstQuestion}
                            isLastQuestion={isLastQuestion}
                            handleQuizSubmit={handleSubmitClick}
                            isMarked={markedQuestions.has(currentQuestion._id)}
                            onToggleMark={() => toggleMarkQuestion(currentQuestion._id)}
                            source={source}
                        />
                    )}

                    {currentQuestion?.type === "rapid" && (
                        <Rapid
                            data={currentQuestion}
                            selectedAnswers={answers}
                            firstSelectedAnswers={firstAnswers}
                            onAnswerSelect={handleAnswerSelect}
                            onNext={nextQuestion}
                            onBack={prevQuestion}
                            isFirstQuestion={isFirstQuestion}
                            isLastQuestion={isLastQuestion}
                            handleQuizSubmit={handleSubmitClick}
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
                            handleQuizSubmit={handleSubmitClick}
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

                {/* Submit Confirmation Modal */}
                <CustomModal
                    isOpen={showSubmitModal}
                    onRequestClose={handleSubmitCancel}
                    title="Submit Quiz?"
                    width="60%"
                >
                    <SubmitModal
                        show={showSubmitModal}
                        unansweredCount={unansweredCount}
                        onConfirm={handleSubmitConfirm}
                        onCancel={handleSubmitCancel}
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
                        {...(source === "planner" && {
                            text: "Questions you have fully attempted are saved to your plan. Do you want to exit and continue this day later?",
                        })}
                        {...(source === "unit-exam" && {
                            text: "The answers you have given so far will be saved to your progress. Do you want to exit right now?",
                        })}
                    />
                </CustomModal>
            </div>
        </>
    );
};

export default Quiz;