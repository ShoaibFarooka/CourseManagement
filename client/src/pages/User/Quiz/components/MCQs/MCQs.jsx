import React, { useState, useEffect } from "react";
import './MCQs.css';
import { useNavigate } from "react-router-dom";

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
}) => {

    const [localSelection, setLocalSelection] = useState(selectedOption || "");

    const navigate = useNavigate();

    useEffect(() => {
        setLocalSelection(selectedOption || "");
    }, [selectedOption]);

    const handleOptionClick = (optKey) => {
        setLocalSelection(optKey);
    };

    const flushAnswer = () => {
        if (localSelection !== "") {
            onAnswerSelect(question.id, localSelection);
        }
    };

    const handleClickSubmit = () => {
        flushAnswer();
        handleQuizSubmit();
    }

    const optionKeys = question.options ? Object.keys(question.options) : [];

    return (
        <div className="question-section">
            <div className="question-no">Question {questionIndex + 1}</div>
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
                                name={`question-${question.id}`}
                                checked={localSelection === optKey}
                                onChange={() => handleOptionClick(optKey)}
                            />
                            {optText}
                        </label>
                    );
                })}
            </div>

            <div className="question-buttons">
                <button onClick={onBack} disabled={isFirstQuestion}>Back</button>
                <button onClick={handleClickSubmit}>Submit</button>
                <button onClick={() => {
                    flushAnswer();
                    if (onNext) onNext();
                }} disabled={isLastQuestion}>Next</button>
            </div>
        </div>
    );
};

export default MCQs;
