import React from "react";
import "./ProgressBar.css";

const ProgressBar = ({ progress }) => (
    <div className="progress-container">
        <div className="progress-bar">
            <div
                className="progress"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <span className="progress-value">{progress}%</span>
    </div>
);

export default ProgressBar;
