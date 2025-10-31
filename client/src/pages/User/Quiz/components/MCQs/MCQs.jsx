import React, { useState, useEffect } from "react";
import './MCQs.css';

const MCQs = ({ question, questionIndex, selectedOption, onAnswerSelect, onNext, onBack, isLastQuestion, isFirstQuestion }) => {

    const [localSelection, setLocalSelection] = useState(selectedOption || "");

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

    const optionKeys = question.options ? Object.keys(question.options) : [];
    const optionValues = question.options ? Object.values(question.options) : [];

    return (
        <div className="question-section">
            <div className="question-no">Question {questionIndex + 1}</div>
            <div className="question">{question.statement}</div>

            <div className="options">
                {optionValues.map((opt, i) => (
                    <label
                        key={i}
                        className={`option ${localSelection === optionKeys[i] ? "selected" : ""}`}
                    >
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={localSelection === optionKeys[i]}
                            onChange={() => handleOptionClick(optionKeys[i])}
                        />
                        {opt}
                    </label>
                ))}
            </div>

            <div className="question-buttons">
                <button onClick={onBack} disabled={isFirstQuestion}>Back</button>
                <button onClick={flushAnswer}>Submit</button>
                <button onClick={() => {
                    flushAnswer();
                    if (onNext) onNext();
                }} disabled={isLastQuestion}>Next</button>
            </div>
        </div>
    );
};

export default MCQs;
