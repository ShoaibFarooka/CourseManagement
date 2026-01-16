import React from "react";
import "./QuestionNavigator.css";

const QuestionNavigator = ({
    questions = [],
    currentIndex,
    onNavigate,
    answers = {},
}) => {
    const isAnswered = (q) => {
        const questionId = q._id || q.id;

        if (q.type === "rapid" || q.type === "essay") {
            if (!Array.isArray(q.subquestions)) return false;

            return q.subquestions.every((_, index) => {
                const key = `${questionId}-${index}`;
                return answers[key]?.toString().trim() !== "";
            });
        }

        // MCQ
        return answers[questionId] !== undefined;
    };

    return (
        <div className="question-navigator">
            <div className="title">All Questions</div>

            <ul>
                {questions.map((q, i) => {
                    const questionId = q._id || q.id;

                    return (
                        <li
                            key={questionId}
                            onClick={() => onNavigate(i)}
                            className={`question-item
                                ${i === currentIndex ? "active" : ""}
                                ${isAnswered(q) ? "answered" : ""}
                            `}
                        >
                            Question {i + 1}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default QuestionNavigator;
