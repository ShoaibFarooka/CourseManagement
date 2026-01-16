import React, { useState, useEffect } from "react";
import "./Essay.css";
import { message } from "antd";

const Essay = ({
    data,
    onNext,
    onBack,
    onAnswerSelect,
    selectedOption = {},
    isLastQuestion,
    isFirstQuestion,
    handleQuizSubmit,
}) => {
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const [localAnswer, setLocalAnswer] = useState("");

    const subquestions = data?.subquestions || [];
    const currentSub = subquestions[activeSubIndex];

    const answerKey =
        data && currentSub
            ? `${data._id || data.id}-${activeSubIndex}`
            : null;

    /** Restore saved answer */
    useEffect(() => {
        if (answerKey) {
            setLocalAnswer(selectedOption[answerKey] || "");
        }
    }, [answerKey, selectedOption]);

    const wordCount =
        localAnswer.trim() === ""
            ? 0
            : localAnswer.trim().split(/\s+/).filter(Boolean).length;

    const saveAnswer = () => {
        const trimmed = localAnswer.trim();
        if (answerKey && trimmed) {
            onAnswerSelect(answerKey, trimmed);
        }
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

        saveAnswer();

        if (activeSubIndex < subquestions.length - 1) {
            setActiveSubIndex((prev) => prev + 1);
        } else {
            setActiveSubIndex(0);
            onNext?.();
        }
    };

    const handleBackClick = () => {
        saveAnswer();

        if (activeSubIndex > 0) {
            setActiveSubIndex((prev) => prev - 1);
        } else {
            onBack?.();
        }
    };

    const handleSubmitClick = () => {
        if (!validateAnswer()) return;

        saveAnswer();
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
            <div className="essay-title">Essay Content</div>

            <p className="essay-content">
                {data.content || "No essay content available."}
            </p>

            <div className="essay-question-section">
                <div className="essay-question">
                    {currentSub.statement}
                </div>

                <textarea
                    className="essay-textarea"
                    placeholder="Write your answer here..."
                    value={localAnswer}
                    onChange={(e) => setLocalAnswer(e.target.value)}
                />

                {wordCount >= 5 && currentSub.explanation && (
                    <div className="essay-correct-answer fade-in">
                        <div className="answer-heading">Correct Answer</div>
                        <p className="answer-text">
                            {currentSub.explanation}
                        </p>
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

                    {isLastQuestion &&
                        activeSubIndex === subquestions.length - 1 && (
                            <button
                                className="submit-btn"
                                onClick={handleSubmitClick}
                            >
                                Submit
                            </button>
                        )}

                    <button
                        className="nav-btn"
                        onClick={handleNextClick}
                        disabled={
                            isLastQuestion &&
                            activeSubIndex === subquestions.length - 1
                        }
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Essay;
