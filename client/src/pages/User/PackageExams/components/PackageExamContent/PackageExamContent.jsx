import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PackageExamContent.css";

const PackageExamContent = ({ courseId, partId, part }) => {
    const navigate = useNavigate();

    const [selectedExam, setSelectedExam] = useState(null); // 'standard' or 'mega'
    const [selectedPublisher, setSelectedPublisher] = useState("");
    const [publishers, setPublishers] = useState([]);

    useEffect(() => {
        if (part?.publishers) {
            setPublishers(part.publishers);
        }
    }, [part]);

    const handleExamSelect = (examType) => {
        setSelectedExam(examType);
        if (examType === "mega") setSelectedPublisher(""); // reset publisher if mega
    };

    const handleUpdate = () => {
        if (selectedExam === "standard" && !selectedPublisher) {
            alert("Please select a publisher for Standard Review");
            return;
        }

        // Navigate to Quiz with state
        navigate("/quiz", {
            state: {
                source: "package-exam", // similar to practice exam source
                courseId,
                partId,
                examType: selectedExam,
                publisherId: selectedPublisher || null,
            },
        });
    };

    return (
        <div className="package-exam">
            {/* Standard Review */}
            <div
                className={`package ${selectedExam === "standard" ? "selected" : ""}`}
                onClick={() => handleExamSelect("standard")}
            >
                <span className="pkg-checkbox">
                    <input
                        type="radio"
                        checked={selectedExam === "standard"}
                        readOnly
                    />
                </span>
                <span className="pkg-title">Standard Review Package</span>
            </div>

            {selectedExam === "standard" && (
                <div className="publisher-dropdown">
                    <label>Select Publisher:</label>
                    <select
                        value={selectedPublisher}
                        onChange={(e) => setSelectedPublisher(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {publishers.map((pub) => (
                            <option key={pub._id} value={pub._id}>
                                {pub.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="description">
                Norem ipsum dolor sit amet, consectetur adipiscing elit...
            </div>

            {/* Mega Review */}
            <div
                className={`package ${selectedExam === "mega" ? "selected" : ""}`}
                onClick={() => handleExamSelect("mega")}
            >
                <span className="pkg-checkbox">
                    <input
                        type="radio"
                        checked={selectedExam === "mega"}
                        readOnly
                    />
                </span>
                <span className="pkg-title">Mega Review Package</span>
            </div>

            <div className="description">
                Norem ipsum dolor sit amet, consectetur adipiscing elit...
            </div>

            {/* Update Button */}
            <div className="buttons-container">
                <button className="button update" onClick={handleUpdate}>
                    Update
                </button>
            </div>
        </div>
    );
};

export default PackageExamContent;
