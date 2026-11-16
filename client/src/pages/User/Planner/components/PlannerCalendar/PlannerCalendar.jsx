import React from "react";
import { Popconfirm } from "antd";
import { FaCheck, FaLock, FaPlay } from "react-icons/fa";
import "./PlannerCalendar.css";

const formatDate = (date, options = { day: "numeric", month: "short" }) =>
    new Date(date).toLocaleDateString("en-GB", options);

const PlannerCalendar = ({
    plan,
    courseName,
    partName,
    publisherName,
    periodLabel,
    onStartDay,
    onResetPlan,
    onChangeSelection,
}) => {
    const focusDay =
        plan.days.find(d => d.dayNumber === plan.currentDay) ||
        plan.days[plan.days.length - 1];

    return (
        <div className="planner-container">
            <div className="planner-header">
                <div className="planner-heading">
                    <div className="title">Your Study Plan</div>
                    <div className="meta">
                        {[courseName, partName, publisherName, periodLabel].filter(Boolean).join(" · ")}
                    </div>
                </div>

                <div className="planner-actions">
                    <button className="action-btn secondary" onClick={onChangeSelection}>
                        Change Selection
                    </button>
                    <Popconfirm
                        title="Reset Plan"
                        description="If you click Yes, all your saved progress will be lost. Are you sure you want to reset?"
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                        placement="bottomRight"
                        styles={{ root: { maxWidth: 300 } }}
                        onConfirm={onResetPlan}
                    >
                        <button className="action-btn danger">
                            Reset Plan
                        </button>
                    </Popconfirm>
                </div>
            </div>

            <div className="planner-summary">
                <div className="summary-card overall">
                    <div className="label">Overall Progress</div>
                    <div className="value">{plan.progress}%</div>
                    <div className="planner-progress-bar">
                        <div className="planner-progress-fill" style={{ width: `${plan.progress}%` }} />
                    </div>
                    <div className="hint">
                        {plan.completedQuestions}/{plan.totalQuestions} questions · {plan.completedDays}/{plan.totalDays} days completed
                    </div>
                </div>

                <div className={`summary-card focus ${plan.isCompleted ? "done" : ""}`}>
                    {plan.isCompleted ? (
                        <>
                            <div className="label">Plan Completed</div>
                            <div className="value">All {plan.totalDays} days done 🎉</div>
                            <div className="hint">Open any day to review its questions.</div>
                        </>
                    ) : (
                        <>
                            <div className="label">
                                Day {focusDay.dayNumber} · {formatDate(focusDay.date, { weekday: "short", day: "numeric", month: "short" })}
                            </div>
                            <div className="value">{focusDay.progress}%</div>
                            <div className="planner-progress-bar">
                                <div className="planner-progress-fill" style={{ width: `${focusDay.progress}%` }} />
                            </div>
                            <div className="hint">
                                {focusDay.completedQuestions}/{focusDay.totalQuestions} questions attempted
                                {plan.currentDay < plan.totalDays && ` · finish to unlock Day ${focusDay.dayNumber + 1}`}
                            </div>
                            <button className="button start-btn" onClick={() => onStartDay(focusDay)}>
                                <FaPlay size={12} /> {focusDay.completedQuestions > 0 ? "Continue" : "Start"} Day {focusDay.dayNumber}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="planner-calendar-title">Calendar</div>
            <div className="planner-calendar">
                {plan.days.map(day => {
                    const isCurrent = day.dayNumber === plan.currentDay;
                    const status = day.isCompleted
                        ? "completed"
                        : !day.isUnlocked
                            ? "locked"
                            : isCurrent
                                ? "current"
                                : "";

                    return (
                        <button
                            key={day.dayNumber}
                            className={`planner-day ${status}`}
                            onClick={() => onStartDay(day)}
                            title={
                                day.isUnlocked
                                    ? `Day ${day.dayNumber}: ${day.completedQuestions}/${day.totalQuestions} questions attempted`
                                    : `Complete Day ${day.dayNumber - 1} to unlock`
                            }
                        >
                            <div className="day-top">
                                <span className="day-number">Day {day.dayNumber}</span>
                                <span className="day-icon">
                                    {day.isCompleted && <FaCheck />}
                                    {!day.isUnlocked && <FaLock />}
                                </span>
                            </div>
                            <div className="day-date">{formatDate(day.date)}</div>
                            <div className="planner-progress-bar small">
                                <div className="planner-progress-fill" style={{ width: `${day.progress}%` }} />
                            </div>
                            <div className="day-count">
                                {day.completedQuestions}/{day.totalQuestions}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PlannerCalendar;
