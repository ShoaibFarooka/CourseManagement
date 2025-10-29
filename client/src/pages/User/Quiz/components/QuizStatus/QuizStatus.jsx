import React from "react";
import "./QuizStatus.css";

const QuizStatus = ({ correct = 0, marked = 0, incorrect = 0, unanswered = 0 }) => {
    return (
        <div className="quiz-status">
            <div className="status-box correct">Correct = {correct}</div>
            <div className="status-box marked">Marked = {marked}</div>
            <div className="status-box incorrect">Incorrect = {incorrect}</div>
            <div className="status-box unanswered">Unanswered = {unanswered}</div>
        </div>
    );
};

export default QuizStatus;
