import React from "react";
import './QuestionNavigator.css';

const QuestionNavigator = ({ questions, currentIndex, onNavigate, answers }) => {

    const isAnswered = (q) => {
        if (q.type === "rapid" || q.type === "essay") {
            return q.subquestions?.every((_, index) => answers[`${q.id}-${index}`] !== undefined);
        } else {
            return answers[q.id] !== undefined;
        }
    };


    return (
        <div className="question-navigator">
            <div className="title">All Questions</div>
            <ul>
                {questions.map((q, i) => (
                    <li
                        key={q.id}
                        onClick={() => onNavigate(i)}
                        className={`question-item ${i === currentIndex ? "active" : ""} ${isAnswered(q) ? "answered" : ""}`}
                    >
                        Question {i + 1}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuestionNavigator;
