import React from "react";
import "./ExitModal.css";

const ExitModal = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="exit-modal-content">
            <div className="exit-text">
                All your progress will be lost. Do you really want to exit right now?
            </div>
            <div className="exit-buttons">
                <button className="exit-btn exit-confirm" onClick={onConfirm}>
                    Exit
                </button>
                <button className="exit-btn exit-cancel" onClick={onCancel}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default ExitModal;
