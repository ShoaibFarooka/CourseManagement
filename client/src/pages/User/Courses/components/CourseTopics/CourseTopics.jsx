import React from "react";
import "./CourseTopics.css";
import { FaPlus } from "react-icons/fa";
import arrow from '../../../../../assets/icons/arrow.png';

const CourseTopics = () => {
    const topics = [
        {
            id: 1,
            name: "Foundation of Internal Auditing",
            status: "20/23 Attempted",
            statusType: "active",
            proficiency: 80,
        },
        {
            id: 2,
            name: "Independence, Objectivity and Proficiency",
            status: "12/20 Attempted",
            statusType: "warning",
            proficiency: 50,
        },
        {
            id: 3,
            name: "Bold text column",
            status: "6/23 Attempted",
            statusType: "error",
            proficiency: 80,
        },
        ...Array.from({ length: 5 }, (_, i) => ({
            id: `inactive-${i + 1}`,
            name: "Bold text column",
            status: "Inactive",
            statusType: "inactive",
            proficiency: 0,
        })),
    ];

    return (
        <div className="course-topics-container">

            <div className="course-title">
                Select the topics you wish to study, click on + icon to expand
            </div>

            <div className="table-header">
                <span>Courses <img src={arrow} alt="arrow" /></span>
                <span>Quiz Status <img src={arrow} alt="arrow" /></span>
                <span>Proficiency Score <img src={arrow} alt="arrow" /></span>
            </div>

            <div className="topics-list">
                {topics.map((topic) => (
                    <div key={topic.id} className="topic-row">
                        <div className="topic-info">
                            <FaPlus className="topic-icon" />
                            <input
                                type="checkbox"
                                className="topic-checkbox"
                            />
                            <span className="topic-name">{topic.name}</span>
                        </div>

                        <div
                            className={`topic-status ${topic.statusType}`}
                        >
                            {topic.status}
                        </div>

                        <div className="topic-progress">
                            <div className="progress-bar">
                                <div
                                    className={`progress-fill ${topic.statusType}`}
                                    style={{ width: `${topic.proficiency}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">
                                {topic.proficiency}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="next-btn-container">
                <button className="button">Next</button>
            </div>
        </div>
    );
};

export default CourseTopics;
