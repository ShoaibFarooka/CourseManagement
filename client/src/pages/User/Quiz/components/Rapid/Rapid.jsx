import React, { useState, useEffect } from "react";
import "./Rapid.css";
import { useNavigate } from "react-router-dom";

const Rapid = ({
    data,
    onNext,
    onBack,
    onAnswerSelect,
    selectedOption,
    isLastQuestion,
    isFirstQuestion,
    handleQuizSubmit,
}) => {
    const concept = data;
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const [localSelection, setLocalSelection] = useState("");

    const subquestion = concept?.subquestions?.[activeSubIndex];
    const key = subquestion ? `${concept.id}-${activeSubIndex}` : null;
    const navigate = useNavigate();

    useEffect(() => {
        if (key) {
            setLocalSelection(selectedOption?.[key] || "");
        }
    }, [key, selectedOption]);

    if (!concept || !subquestion) {
        return (
            <div className="rapid-container">
                <div className="title">Core Concepts</div>
                <p>No rapid questions available.</p>
            </div>
        );
    }

    const optionKeys = Object.keys(subquestion.options || {});

    const handleOptionClick = (optionKey) => {
        setLocalSelection(optionKey);
    };

    const flushAnswer = () => {
        if (key && localSelection) {
            onAnswerSelect?.(key, localSelection);
        }
    };

    const handleNextClick = () => {
        if (!localSelection) {
            alert("Please select an option before moving to next question.");
            return;
        }

        flushAnswer();

        if (activeSubIndex < concept.subquestions.length - 1) {
            setActiveSubIndex(activeSubIndex + 1);
            setLocalSelection("");
        } else {
            setActiveSubIndex(0);
            setLocalSelection("");
            if (onNext) onNext();
        }
    };

    const handleBackClick = () => {
        if (activeSubIndex > 0) {
            setActiveSubIndex(activeSubIndex - 1);
        } else {
            if (onBack) onBack();
        }
    };

    const handleClickSubmit = () => {
        flushAnswer();
        handleQuizSubmit();
    }

    return (
        <div className="rapid-container">
            <div className="title">Core Concepts</div>

            <div className="core-concepts">
                <button className="concept-btn active">{concept.concept}</button>
            </div>

            <div className="concept-info">
                <div className="concept">{concept.concept}</div>
                <p>{concept.definition}</p>
            </div>

            <div className="question-section">
                <div className="question">{subquestion.question}</div>
                <div className="options">
                    {optionKeys.map((optKey) => {
                        const optionObj = subquestion.options[optKey];
                        // Defensive: handle both string and object
                        const optionText =
                            typeof optionObj === "string" ? optionObj : optionObj?.option || "";

                        return (
                            <label
                                key={optKey}
                                className={`option ${localSelection === optKey ? "selected" : ""}`}
                            >
                                <input
                                    type="radio"
                                    name={`rapid-${concept.id}-${activeSubIndex}`}
                                    value={optKey}
                                    checked={localSelection === optKey}
                                    onChange={() => handleOptionClick(optKey)}
                                />
                                {optionText}
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="navigation">
                <button className="nav-btn" onClick={handleBackClick} disabled={isFirstQuestion}>
                    Back
                </button>
                <button className="submit-btn" onClick={handleClickSubmit}>
                    Submit
                </button>
                <button
                    disabled={isLastQuestion}
                    onClick={handleNextClick}
                    className="nav-btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Rapid;
