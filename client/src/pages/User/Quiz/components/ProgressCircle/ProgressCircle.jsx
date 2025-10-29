import React from "react";
import './ProgressCircle.css';

const ProgressCircle = ({ progress }) => (
    <div className="progress-circle">
        <svg viewBox="0 0 36 36">
            <path
                className="circle-bg"
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
                className="circle"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
        </svg>
        <div className="percentage">{Math.round(progress)}%</div>
    </div>
);
export default ProgressCircle;
