import React from "react";
import "./TimeUpModal.css";

const TimeUpModal = ({ show, onSubmit, onContinue }) => {
    if (!show) return null;

    return (
        <div className="timeup-modal-content">
            <div className="timeup-text">
                Your time is up! You can submit your quiz now or continue without time limit.
            </div>
            <div className="timeup-buttons">
                <button className="timeup-btn timeup-submit" onClick={onSubmit}>
                    Submit
                </button>
                <button className="timeup-btn timeup-continue" onClick={onContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default TimeUpModal;
