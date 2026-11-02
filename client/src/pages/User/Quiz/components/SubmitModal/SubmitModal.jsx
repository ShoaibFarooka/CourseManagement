import React from "react";
import "./SubmitModal.css";

const SubmitModal = ({ show, unansweredCount, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="submit-modal-content">
            <div className="submit-text">
                {unansweredCount > 0 ? (
                    <>
                        You have <span className="submit-count">{unansweredCount}</span>{" "}
                        {unansweredCount === 1 ? "question" : "questions"} remaining unattempted.
                        Click Submit to finish, or Cancel to go back and attempt them.
                    </>
                ) : (
                    "You have attempted all questions. Do you want to submit now?"
                )}
            </div>
            <div className="submit-buttons">
                <button className="submit-btn submit-confirm" onClick={onConfirm}>
                    Submit
                </button>
                <button className="submit-btn submit-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SubmitModal;
