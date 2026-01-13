import React from "react";
import "./SelectExam.css";

const SelectExam = ({
    examType,
    courses = [],
    parts = [],
    units = [],
    selectedCourse,
    selectedPart,
    selectedUnit,
    onCourseChange,
    onPartChange,
    onUnitChange,
    onNext,
}) => {
    return (
        <div className="select-exam-wrapper">
            <h2 className="title">Select your Exam</h2>


            <div className="field">
                <label>Select the Course</label>
                <select value={selectedCourse || ""} onChange={onCourseChange}>
                    <option>Select Course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label>Select Course Part</label>
                <select
                    value={selectedPart || ""}
                    onChange={onPartChange}
                    disabled={!selectedCourse}
                >
                    <option>Select Part</option>
                    {parts.map(part => (
                        <option key={part.id} value={part.id}>
                            {part.name}
                        </option>
                    ))}
                </select>
            </div>

            {(examType === "unit" || examType === "practice") && (
                <div className="field">
                    <label>Select Unit</label>
                    <select
                        value={selectedUnit || ""}
                        onChange={onUnitChange}
                        disabled={!selectedPart}
                    >
                        <option>Select Unit</option>
                        {units.map(unit => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="footer">
                <button className="next-btn" onClick={onNext}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default SelectExam;
