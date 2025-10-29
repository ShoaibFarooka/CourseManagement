import React from "react";
import './QuestionNavigator.css';

const QuestionNavigator = ({ questions, currentIndex, onNavigate, answers }) => (
    <div className="question-navigator">
        <div className="title">All Questions</div>
        <ul>
            {questions.map((q, i) => (
                <li
                    key={q.id}
                    onClick={() => onNavigate(i)}
                    className={`question-item ${i === currentIndex ? "active" : ""} ${answers[q.id] !== undefined ? "answered" : ""}`}
                >
                    Question {i + 1}
                </li>
            ))}
        </ul>
    </div>
);

export default QuestionNavigator;
