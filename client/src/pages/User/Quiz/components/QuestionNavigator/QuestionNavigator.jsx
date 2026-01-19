import React from "react";
import "./QuestionNavigator.css";

const QuestionNavigator = ({
    questions = [],
    totalQuestions = 0,
    currentIndex,
    onNavigate,
    isQuestionAnswered,
}) => {
    const allQuestionSlots = Array.from({ length: totalQuestions }, (_, i) => {
        const loadedQuestion = questions[i];
        return loadedQuestion || null;
    });

    return (
        <div className="question-navigator">
            <div className="title">All Questions</div>

            <ul>
                {allQuestionSlots.map((q, i) => {
                    const isLoaded = q !== null;
                    const isAnswered = isLoaded && isQuestionAnswered(q);

                    return (
                        <li
                            key={i}
                            onClick={() => onNavigate(i)}
                            className={`question-item
                                ${i === currentIndex ? "active" : ""}
                                ${isAnswered ? "answered" : ""}
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