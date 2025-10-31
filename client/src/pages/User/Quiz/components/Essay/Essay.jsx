import React, { useState, useEffect } from "react";
import "./Essay.css";
import { message } from 'antd';

const Essay = ({
    data = {},
    onNext,
    onBack,
    onAnswerSelect,
    selectedOption = {},
    isLastQuestion,
    isFirstQuestion,
}) => {
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const subquestions = data?.subquestions || [];
    const [localAnswer, setLocalAnswer] = useState("");

    const currentKey = `${data.id}-${activeSubIndex}`;

    useEffect(() => {
        setLocalAnswer(selectedOption[currentKey] || "");
    }, [activeSubIndex]);

    const handleAnswerChange = (e) => {
        setLocalAnswer(e.target.value);
    };

    const flushAnswer = () => {
        const trimmed = localAnswer.trim();
        if (trimmed && onAnswerSelect) {
            onAnswerSelect(currentKey, trimmed);
        }
    };

    const handleClickNext = () => {
        const wordCount = localAnswer.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 5) {
            message.warning("Please write at least 5 words before continuing.");
            return;
        }

        flushAnswer();

        if (activeSubIndex < subquestions.length - 1) {
            setActiveSubIndex(activeSubIndex + 1);
        } else if (onNext) {
            onNext(flushAnswer);
        }
    };

    const handleClickBack = () => {
        if (activeSubIndex > 0) {
            setActiveSubIndex(activeSubIndex - 1);
        } else if (onBack) {
            onBack();
        }
    };

    const handleSubmit = () => {
        const wordCount = localAnswer.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 5) {
            message.warning("Please write at least 5 words before submitting.");
            return;
        }

        flushAnswer();
        alert("Essay submitted successfully!");
    };

    const currentSub = subquestions[activeSubIndex];
    const wordCount =
        localAnswer.trim() === "" ? 0 : localAnswer.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="essay-container">
            <div className="essay-title">Essay Content</div>
            <p className="essay-content">{data.content || "No essay content available."}</p>

            {currentSub ? (
                <div className="essay-question-section">
                    <div className="essay-question">{currentSub.statement}</div>

                    <textarea
                        className="essay-textarea"
                        placeholder="Write your answer here..."
                        value={localAnswer}
                        onChange={handleAnswerChange}
                    />

                    {wordCount >= 5 && currentSub.explanation && (
                        <div className="essay-correct-answer fade-in">
                            <div className="answer-heading">Correct Answer</div>
                            <p className="answer-text">{currentSub.explanation}</p>
                        </div>
                    )}

                    <div className="essay-navigation">
                        <button className="nav-btn" onClick={handleClickBack} disabled={isFirstQuestion}>
                            Back
                        </button>

                        <button className="submit-btn" onClick={handleSubmit}>
                            Submit
                        </button>

                        <button
                            className="nav-btn"
                            onClick={handleClickNext}
                            disabled={isLastQuestion && activeSubIndex === subquestions.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <p>No subquestions available.</p>
            )}
        </div>
    );
};

export default Essay;
