import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import "./MCQs.css";

const MCQs = ({
    question,
    questionIndex,
    selectedOption,
    onAnswerSelect,
    onNext,
    onBack,
    isLastQuestion,
    isFirstQuestion,
    handleQuizSubmit,
    isMarked = false,
    onToggleMark,
    source,
}) => {
    const [localSelection, setLocalSelection] = useState(selectedOption || "");

    useEffect(() => {
        setLocalSelection(selectedOption || "");
    }, [selectedOption]);

    const handleOptionClick = (optKey) => {
        setLocalSelection(optKey);
        onAnswerSelect(`mcq:${question._id}`, optKey);
    };

    const handleSubmitClick = () => {
        handleQuizSubmit();
    };

    const optionKeys = question.options ? Object.keys(question.options) : [];
    const showExplanations = source === "unit-exam" || source === "package-exam";

    const getOptionClass = (optKey) => {
        if (!localSelection) return "";

        if (localSelection === optKey) {
            if (optKey === question.correctOption) {
                return "selected correct";
            } else {
                return "selected incorrect";
            }
        }
        return "";
    };

    return (
        <div className="question-section">
            <div className="question-header">
                <div className="question-no">Question {questionIndex + 1}</div>
                <button
                    className="mark-btn"
                    onClick={onToggleMark}
                    title={isMarked ? "Unmark question" : "Mark for review"}
                >
                    {isMarked ? <FaBookmark /> : <FaRegBookmark />}
                    {isMarked ? " Marked" : " Mark"}
                </button>
            </div>

            <div className="question">{question.statement}</div>

            <div className="options">
                {optionKeys.map((optKey) => {
                    const optObj = question.options[optKey];
                    const optText = typeof optObj === "string" ? optObj : optObj?.option || "";
                    const explanation = typeof optObj === "object" ? optObj?.explanation : null;

                    return (
                        <div key={optKey} className="option-wrapper">
                            <label
                                className={`option ${getOptionClass(optKey)}`}
                            >
                                <input
                                    type="radio"
                                    name={`mcq-${question._id}`}
                                    checked={localSelection === optKey}
                                    onChange={() => handleOptionClick(optKey)}
                                />
                                {optText}
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

            <div className="question-buttons">
                <button onClick={onBack} disabled={isFirstQuestion}>
                    Back
                </button>

                {isLastQuestion && (
                    <button className="submit-btn" onClick={handleSubmitClick}>
                        Submit
                    </button>
                )}

                <button
                    onClick={onNext}
                    disabled={isLastQuestion}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default MCQs;