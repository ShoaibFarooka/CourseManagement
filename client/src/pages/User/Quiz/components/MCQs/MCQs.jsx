import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa"; // Add this import
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

                    return (
                        <label
                            key={optKey}
                            className={`option ${localSelection === optKey ? "selected" : ""}`}
                        >
                            <input
                                type="radio"
                                name={`mcq-${question._id}`}
                                checked={localSelection === optKey}
                                onChange={() => handleOptionClick(optKey)}
                            />
                            {optText}
                        </label>
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