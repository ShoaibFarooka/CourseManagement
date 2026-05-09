import React, { useState } from 'react';
import './SessionModal.css';

const SessionModal = ({ unitProgress, sessionLoading, navigateToQuiz }) => {
    const [questionLimit, setQuestionLimit] = useState("");

    const maxQuestions = unitProgress?.totalQuestions || 0;

    const parseLimit = () => {
        const val = Number(questionLimit);
        if (!val || val <= 0) return null;
        return Math.min(val, maxQuestions);
    };

    const handleApplyLimit = () => {
        const limit = parseLimit();

        if (!limit) {
            return;
        }
        navigateToQuiz("limited", limit);
    };

    return (
        <div className="session-modal">

            <div className="session-modal-desc">
                Choose how you want to continue your practice
            </div>

            {/* STATS */}
            <div className="session-modal-stats">
                <span data-label="Attempted">
                    {unitProgress?.attempted} / {unitProgress?.totalQuestions}
                </span>
                <span data-label="Correct">{unitProgress?.correct}</span>
                <span data-label="Wrong">{unitProgress?.wrong}</span>
                <span data-label="Remaining">{unitProgress?.unattempted}</span>
            </div>

            {/* LIMIT INPUT */}
            <div className="session-limit-section">
                <div className="session-question-input">
                    <label>Enter Questions</label>
                    <input
                        type="number"
                        min="1"
                        max={maxQuestions}
                        value={questionLimit}
                        onChange={(e) => setQuestionLimit(e.target.value)}
                        placeholder={`Max ${maxQuestions}`}
                    />
                    <div className="session-question-hint">
                        Leave empty to attempt all available questions
                    </div>
                </div>
                <button
                    className="button session-btn"
                    onClick={handleApplyLimit}
                    disabled={sessionLoading}
                >
                    Apply Limit
                </button>
            </div>


            {/* SESSION ACTION BUTTONS (NO LIMIT PASSING) */}
            <div className="session-modal-buttons">

                <button
                    className="session-btn resume"
                    disabled={sessionLoading || !unitProgress?.unattempted}
                    onClick={() => navigateToQuiz("continue")}
                >
                    Continue
                    <span className="session-btn-badge">
                        {unitProgress?.unattempted} left
                    </span>
                </button>

                <button
                    className="session-btn wrong-only"
                    disabled={sessionLoading || !unitProgress?.wrong}
                    onClick={() => navigateToQuiz("wrong-only")}
                >
                    Wrong Only
                    <span className="session-btn-badge">
                        {unitProgress?.wrong} questions
                    </span>
                </button>

                <button
                    className="session-btn start-over"
                    disabled={sessionLoading}
                    onClick={() => navigateToQuiz("start-over")}
                >
                    Start Over
                    <span className="session-btn-badge">
                        {unitProgress?.totalQuestions} questions
                    </span>
                </button>

            </div>
        </div>
    );
};

export default SessionModal;