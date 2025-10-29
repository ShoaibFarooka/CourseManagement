import React from "react";
import './QuestionSection.css';

const QuestionSection = ({ question, questionIndex, totalQuestions, selectedOption, onAnswerSelect, onNext, onBack }) => {
    return (
        <div className="question-section">
            <div className="question-no">Question {questionIndex + 1}</div>
            <div className="question">{question.text}</div>

            <div className="options">
                {question.options.map((opt, i) => (
                    <label key={i} className={`option ${selectedOption === i ? "selected" : ""}`}>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={selectedOption === i}
                            onChange={() => onAnswerSelect(question.id, i)}
                        />
                        {opt}
                    </label>
                ))}
            </div>

            <div className="question-buttons">
                <button onClick={onBack} disabled={questionIndex === 0}>Back</button>
                <button>Submit</button>
                <button onClick={onNext} disabled={questionIndex === totalQuestions - 1}>Next</button>
            </div>
        </div>
    );
};

export default QuestionSection;
