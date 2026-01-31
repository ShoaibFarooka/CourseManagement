import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./Rapid.css";

const Rapid = ({
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
    source,
}) => {
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const concept = data;
    const subquestions = concept?.subquestions || [];

    if (!concept || subquestions.length === 0) {
        return (
            <div className="rapid-container">
                <div className="title">Core Concepts</div>
                <p>No rapid questions available.</p>
            </div>
        );
    }

    const subquestion = subquestions[activeSubIndex];
    const answerKey = `rapid:${concept._id}:${activeSubIndex}`;

    useEffect(() => {
        const totalSubs = subquestions.length;
        if (totalSubs === 0) return;

        let targetIndex = 0;

        for (let i = 0; i < totalSubs; i++) {
            if (selectedAnswers[`rapid:${concept._id}:${i}`] === undefined) {
                targetIndex = i;
                break;
            }
        }

        if (selectedAnswers[`rapid:${concept._id}:${totalSubs - 1}`] !== undefined) {
            targetIndex = totalSubs - 1;
        }

        setActiveSubIndex(targetIndex);
    }, [concept._id]);

    const localSelection = selectedAnswers[answerKey] || "";
    const showExplanations = source === "unit-exam" || source === "package-exam";

    const optionKeys = Object.keys(subquestion.options || {});

    const handleOptionClick = (optKey) => {
        onAnswerSelect(answerKey, optKey);
    };

    const getOptionClass = (optKey) => {
        if (!localSelection) return "";

        if (source === "practice-exam") {
            return localSelection === optKey ? "selected" : "";
        }

        if (localSelection === optKey) {
            if (optKey === question.correctOption) {
                return "selected correct";
            } else {
                return "selected incorrect";
            }
        }
        return "";
    };

    const handleNextClick = () => {
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
        handleQuizSubmit();
    };

    return (
        <div className="rapid-container">
            <div className="rapid-header">
                <div className="core-concepts">
                    <button className="concept-btn active">{concept.concept}</button>
                </div>
                <button
                    className="mark-btn"
                    onClick={onToggleMark}
                    title={isMarked ? "Unmark question" : "Mark for review"}
                >
                    {isMarked ? <FaBookmark /> : <FaRegBookmark />}
                    {isMarked ? " Marked" : " Mark"}
                </button>
            </div>

            <div className="concept-info">
                <div className="concept">{concept.concept}</div>
                <p>{concept.definition}</p>
            </div>

            <div className="question-section">
                <div className="question">
                    {subquestion.question} ({activeSubIndex + 1}/{subquestions.length})
                </div>

                <div className="options">
                    {optionKeys.map((optKey) => {
                        const optionObj = subquestion.options[optKey];
                        const optionText = typeof optionObj === "string" ? optionObj : optionObj?.option || "";
                        const explanation = typeof optionObj === "object" ? optionObj?.explanation : null;

                        return (
                            <div key={optKey} className="option-wrapper">
                                <label
                                    className={`option ${getOptionClass(optKey)}`}
                                >
                                    <input
                                        type="radio"
                                        name={`rapid-${answerKey}`}
                                        checked={localSelection === optKey}
                                        onChange={() => handleOptionClick(optKey)}
                                    />
                                    {optionText}
                                </label>

                                {showExplanations && explanation && localSelection === optKey && (
                                    <div className="option-explanation">
                                        {explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="navigation">
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
    );
};

export default Rapid;