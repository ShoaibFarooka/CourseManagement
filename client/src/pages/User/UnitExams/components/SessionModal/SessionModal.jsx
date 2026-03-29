import React from 'react';
import './SessionModal.css';

const SessionModal = ({ unitProgress, sessionLoading, navigateToQuiz }) => {
    return (
        <div className="session-modal">

            <div className="session-modal-desc">
                You have previously attempted this unit.
                How would you like to proceed?
            </div>

            <div className="session-modal-stats">
                <span data-label="Attempted">
                    {unitProgress?.attempted} / {unitProgress?.totalQuestions}
                </span>
                <span data-label="Correct">
                    {unitProgress?.correct}
                </span>
                <span data-label="Wrong">
                    {unitProgress?.wrong}
                </span>
                <span data-label="Remaining">
                    {unitProgress?.unattempted}
                </span>
            </div>

            <div className="session-modal-buttons">
                <button
                    className="session-btn resume"
                    disabled={sessionLoading}
                    onClick={() => navigateToQuiz("continue")}
                >
                    Resume from where I left
                    <span className="session-btn-badge">
                        {unitProgress?.unattempted} left
                    </span>
                </button>

                <button
                    className="session-btn wrong-only"
                    disabled={sessionLoading || !unitProgress?.wrong}
                    onClick={() => navigateToQuiz("wrong-only")}
                >
                    Wrong attempted only
                    <span className="session-btn-badge">
                        {unitProgress?.wrong} questions
                    </span>
                </button>

                <button
                    className="session-btn start-over"
                    disabled={sessionLoading}
                    onClick={() => navigateToQuiz("start-over")}
                >
                    Start over
                    <span className="session-btn-badge">
                        {unitProgress?.totalQuestions} questions
                    </span>
                </button>
            </div>
        </div>
    );
};

export default SessionModal;