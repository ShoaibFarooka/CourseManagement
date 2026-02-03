import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./Essay.css";
import { message } from "antd";

const Essay = ({
    data,
    onNext,
    onBack,
    onAnswerSelect,
    selectedAnswers = {},
    isLastQuestion,
    isFirstQuestion,
    handleQuizSubmit,
    isMarked = false,
    onToggleMark,
}) => {
    const subquestions = data?.subquestions || [];
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);

    const currentSub = subquestions[activeSubIndex];
    const answerKey = `essay:${data._id}:${activeSubIndex}:answer`;
    const ratingKey = `essay:${data._id}:${activeSubIndex}:rating`;

    useEffect(() => {
        setActiveSubIndex(0);
        setShowExplanation(false);
    }, [data._id]);

    useEffect(() => {
        // Check if current subquestion already has answer and rating
        const hasAnswer = selectedAnswers[answerKey] && selectedAnswers[answerKey].trim().length > 0;
        const hasRating = selectedAnswers[ratingKey] !== undefined;

        if (hasAnswer && hasRating) {
            setShowExplanation(true);
        } else {
            setShowExplanation(false);
        }
    }, [activeSubIndex, selectedAnswers, answerKey, ratingKey]);

    const localAnswer = selectedAnswers[answerKey] || "";
    const localRating = selectedAnswers[ratingKey] || "";

    const wordCount = localAnswer.trim().split(/\s+/).filter(Boolean).length;

    const handleChange = (e) => {
        const value = e.target.value;
        onAnswerSelect(answerKey, value);
    };

    const handleRatingChange = (e) => {
        const value = e.target.value;
        // Only allow numbers 1-5
        if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 5)) {
            onAnswerSelect(ratingKey, value === "" ? "" : parseInt(value));
        }
    };

    const validateAnswer = () => {
        if (wordCount < 5) {
            message.warning("Please write at least 5 words before continuing.");
            return false;
        }
        return true;
    };

    const validateRating = () => {
        if (showExplanation && (localRating === "" || localRating === undefined)) {
            message.warning("Please rate your answer before continuing.");
            return false;
        }
        return true;
    };

    const handleShowAnswer = () => {
        if (!validateAnswer()) return;
        setShowExplanation(true);
    };

    const handleNextClick = () => {
        if (!validateAnswer()) return;
        if (!validateRating()) return;

        if (activeSubIndex < subquestions.length - 1) {
            setActiveSubIndex(prev => prev + 1);
        } else {
            onNext?.();
        }
    };

    const handleBackClick = () => {
        if (activeSubIndex > 0) {
            setActiveSubIndex(prev => prev - 1);
        } else {
            setActiveSubIndex(0);
            onBack?.();
        }
    };

    const handleSubmitClick = () => {
        if (!validateAnswer()) return;
        if (!validateRating()) return;
        handleQuizSubmit();
    };

    if (!data || !currentSub) {
        return (
            <div className="essay-container">
                <div className="essay-title">Essay Content</div>
                <p>No essay questions available.</p>
            </div>
        );
    }

    return (
        <div className="essay-container">
            <div className="essay-header">
                <div className="essay-title">{data.title || "Essay Question"}</div>
                <button
                    className="mark-btn"
                    onClick={onToggleMark}
                    title={isMarked ? "Unmark question" : "Mark for review"}
                >
                    {isMarked ? <FaBookmark /> : <FaRegBookmark />}
                    {isMarked ? " Marked" : " Mark"}
                </button>
            </div>
            {data.content && <p className="essay-content">{data.content}</p>}

            <div className="essay-question-section">
                <div className="essay-question">
                    {currentSub.statement} ({activeSubIndex + 1}/{subquestions.length})
                </div>

                <textarea
                    className="essay-textarea"
                    placeholder="Write your answer here..."
                    value={localAnswer}
                    onChange={handleChange}
                />


                {!showExplanation && wordCount >= 5 && (
                    <button className="nav-btn" onClick={handleShowAnswer}>
                        Show Answer
                    </button>
                )}

                {showExplanation && currentSub.explanation && (
                    <div className="essay-correct-answer fade-in">
                        <div className="answer-heading">Correct Answer</div>
                        <p className="answer-text">{currentSub.explanation}</p>


                        <div className="rating-section">
                            <label htmlFor="rating-input" className="rating-label">
                                Rate your answer (1-5): How closely does your answer match the explanation?
                            </label>
                            <input
                                id="rating-input"
                                type="number"
                                min="1"
                                max="5"
                                className="input"
                                placeholder="Enter rating (1-5)"
                                value={localRating}
                                onChange={handleRatingChange}
                            />
                        </div>
                    </div>
                )}

                <div className="essay-navigation">
                    <button
                        className="nav-btn"
                        onClick={handleBackClick}
                        disabled={isFirstQuestion && activeSubIndex === 0}
                    >
                        Back
                    </button>

                    {isLastQuestion && activeSubIndex === subquestions.length - 1 && (
                        <button className="submit-btn" onClick={handleSubmitClick}>
                            Submit
                        </button>
                    )}

                    <button
                        className="nav-btn"
                        onClick={handleNextClick}
                        disabled={isLastQuestion && activeSubIndex === subquestions.length - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Essay;