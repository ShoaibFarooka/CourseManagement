import React from 'react';
import './ProgressCircle.css';

const ProgressCircle = ({ progress = 0, strokeColor = 'var(--progress-bar)' }) => {
    const radius = 15.9155;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="c-progress-circle">
            <svg viewBox="0 0 36 36">
                <path
                    className="c-circle-bg"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                    className="c-circle"
                    stroke={strokeColor}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
            <div className="c-percentage">{Math.round(progress)}%</div>
        </div>
    );
};

export default ProgressCircle;
