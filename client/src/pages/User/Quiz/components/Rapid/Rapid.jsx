import React, { useState, useEffect } from "react";
import "./Rapid.css";

const Rapid = ({
    data,
    onNext,
    onBack,
    onAnswerSelect,
    selectedOption = {},
    isLastQuestion,
    isFirstQuestion,
    handleQuizSubmit,
}) => {
    const concept = data;
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const [localSelection, setLocalSelection] = useState("");

    const subquestion = concept?.subquestions?.[activeSubIndex];

    const answerKey = concept && subquestion
        ? `${concept._id || concept.id}-${activeSubIndex}`
        : null;

    /** Restore saved answer when subquestion changes */
    useEffect(() => {
        if (answerKey) {
            setLocalSelection(selectedOption[answerKey] || "");
        }
    }, [answerKey, selectedOption]);

    if (!concept || !subquestion) {
        return (
            <div className="rapid-container">
                <div className="title">Core Concepts</div>
                <p>No rapid questions available.</p>
            </div>
        );
    }

    const optionKeys = Object.keys(subquestion.options || {});

    const saveAnswer = () => {
        if (answerKey && localSelection) {
            onAnswerSelect(answerKey, localSelection);
        }
    };

    const handleNextClick = () => {
        if (!localSelection) {
            alert("Please select an option before continuing.");
            return;
        }

        saveAnswer();

        if (activeSubIndex < concept.subquestions.length - 1) {
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
        if (!localSelection) {
            alert("Please select an option before submitting.");
            return;
        }

        saveAnswer();
        handleQuizSubmit();
    };

    return (
        <div className="rapid-container">
            <div className="title">Core Concepts</div>

            <div className="core-concepts">
                <button className="concept-btn active">
                    {concept.concept}
                </button>
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
                        const optionText =
                            typeof optionObj === "string"
                                ? optionObj
                                : optionObj?.option || "";

                        return (
                            <label
                                key={optKey}
                                className={`option ${localSelection === optKey ? "selected" : ""
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`rapid-${answerKey}`}
                                    checked={localSelection === optKey}
                                    onChange={() => setLocalSelection(optKey)}
                                />
                                {optionText}
                            </label>
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

                {isLastQuestion &&
                    activeSubIndex === concept.subquestions.length - 1 && (
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
                        activeSubIndex === concept.subquestions.length - 1
                    }
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Rapid;
