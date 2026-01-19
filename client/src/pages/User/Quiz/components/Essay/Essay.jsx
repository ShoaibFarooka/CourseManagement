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

    const currentSub = subquestions[activeSubIndex];
    const answerKey = `essay:${data._id}:${activeSubIndex}`;

    useEffect(() => {
        setActiveSubIndex(0);
    }, [data._id]);

    const localAnswer = selectedAnswers[answerKey] || "";

    const wordCount = localAnswer.trim().split(/\s+/).filter(Boolean).length;

    const handleChange = (e) => {
        const value = e.target.value;
        onAnswerSelect(answerKey, value);
    };

    const validateAnswer = () => {
        if (wordCount < 5) {
            message.warning("Please write at least 5 words before continuing.");
            return false;
        }
        return true;
    };

    const handleNextClick = () => {
        if (!validateAnswer()) return;

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

                {wordCount >= 5 && currentSub.explanation && (
                    <div className="essay-correct-answer fade-in">
                        <div className="answer-heading">Correct Answer</div>
                        <p className="answer-text">{currentSub.explanation}</p>
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