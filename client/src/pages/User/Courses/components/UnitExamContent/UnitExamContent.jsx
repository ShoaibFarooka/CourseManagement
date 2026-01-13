import React, { useState } from "react";
import "./UnitExamContent.css";
import { FaPlus, FaMinus } from "react-icons/fa";
import arrow from '../../../../../assets/icons/arrow.png';

const UnitExamContent = () => {
    const [expandedUnit, setExpandedUnit] = useState(null);

    const topics = [
        {
            id: 1,
            name: "Foundation of Internal Auditing",
            status: "20/23 Attempted",
            statusType: "active",
            proficiency: 80,
            subunits: [
                { id: "1-1", name: "Introduction to IA" },
                { id: "1-2", name: "IA Standards" },
                { id: "1-3", name: "Role of IA" },
            ],
        },
        {
            id: 2,
            name: "Independence, Objectivity and Proficiency",
            status: "12/20 Attempted",
            statusType: "warning",
            proficiency: 50,
            subunits: [
                { id: "2-1", name: "Independence" },
                { id: "2-2", name: "Objectivity" },
            ],
        },
    ];

    const toggleAccordion = (id) => {
        setExpandedUnit(prev => (prev === id ? null : id));
    };

    return (
        <div className="unit-exams-container">

            <div className="guideline">
                Select the topics you wish to study, click on + icon to expand
            </div>

            <div className="table-header">
                <span>Courses <img src={arrow} alt="arrow" /></span>
                <span>Quiz Status <img src={arrow} alt="arrow" /></span>
                <span>Proficiency Score <img src={arrow} alt="arrow" /></span>
            </div>

            <div className="topics-list">
                {topics.map((topic) => (
                    <React.Fragment key={topic.id}>

                        <div className="topic-row">
                            <div className="topic-info">
                                <span
                                    className="topic-icon"
                                    onClick={() => toggleAccordion(topic.id)}
                                >
                                    {expandedUnit === topic.id ? <FaMinus /> : <FaPlus />}
                                </span>

                                <input type="checkbox" className="topic-checkbox" />
                                <span className="topic-name">{topic.name}</span>
                            </div>

                            <div className={`topic-status ${topic.statusType}`}>
                                {topic.status}
                            </div>

                            <div className="topic-progress">
                                <div className="progress-bar">
                                    <div
                                        className={`progress-fill ${topic.statusType}`}
                                        style={{ width: `${topic.proficiency}%` }}
                                    />
                                </div>
                                <span className="progress-text">{topic.proficiency}%</span>
                            </div>
                        </div>

                        {expandedUnit === topic.id && (
                            <div className="subunit-wrapper">
                                {topic.subunits.map(sub => (
                                    <div key={sub.id} className="subunit-row">
                                        <div className="subunit-info">
                                            <input type="checkbox" className="topic-checkbox" />
                                            <span className="subunit-name">{sub.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </React.Fragment>
                ))}
            </div>

            <div className="next-btn-container">
                <button className="button next">Next</button>
            </div>
        </div>
    );
};

export default UnitExamContent;
