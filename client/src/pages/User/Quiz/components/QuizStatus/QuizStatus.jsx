import React from "react";
import "./QuizStatus.css";

const QuizStatus = ({ correct = 0, marked = 0, incorrect = 0, unanswered = 0, source }) => {

    const showCorrectAndIncorrectCount = source === "unit-exam" || source === "package-exam";
    return (
        <div className="quiz-status">
            {
                showCorrectAndIncorrectCount && (
                    <div className="status-box correct">Correct = {correct}</div>
                )
            }

            <div className="status-box marked">Marked = {marked}</div>
            {
                showCorrectAndIncorrectCount && (
                    <div className="status-box incorrect">Incorrect = {incorrect}</div>
                )
            }
            <div className="status-box unanswered">Unanswered = {unanswered}</div>
        </div>
    );
};

export default QuizStatus;
