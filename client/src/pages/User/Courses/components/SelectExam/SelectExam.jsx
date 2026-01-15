import React from "react";
import "./SelectExam.css";

const SelectExam = ({
    examType,
    courses = [],
    parts = [],
    publishers = [],
    selectedCourse,
    selectedPart,
    selectedPublisher,
    onCourseChange,
    onPartChange,
    onPublisherChange,
    onNext,
}) => {
    return (
        <div className="select-exam-wrapper">
            <h2 className="title">Select your Exam</h2>


            <div className="field">
                <label>Select the Course</label>
                <select value={selectedCourse || ""} onChange={onCourseChange}>
                    <option value="">Select Course</option>
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
                    <option value="">Select Part</option>
                    {parts.map(part => (
                        <option key={part.id} value={part.id}>
                            {part.name}
                        </option>
                    ))}
                </select>
            </div>

            {(examType === "unit" || examType === "practice") && (
                <div className="field">
                    <label>Select Publihser</label>
                    <select
                        value={selectedPublisher || ""}
                        onChange={onPublisherChange}
                        disabled={!selectedPart}
                    >
                        <option value="">Select Publihser</option>
                        {publishers.map(publisher => (
                            <option key={publisher._id} value={publisher._id}>
                                {publisher.name}
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
