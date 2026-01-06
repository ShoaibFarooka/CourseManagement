import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import arrow from '../../../../../assets/icons/arrow.png';
import profile from '../../../../../assets/images/profile.jpg';

const Dashboard = () => {
    const courses = [
        {
            id: 1,
            name: "Math 101",
            status: "Active",
            statusType: "active",
            startDate: "2026-01-01",
            expiryDate: "2026-01-15",
            parts: ["Part A", "Part B", "Part C"]
        },
        {
            id: 2,
            name: "Physics 201",
            status: "Expired",
            statusType: "error",
            startDate: "2025-12-01",
            expiryDate: "2025-12-31",
            parts: ["Mechanics", "Thermodynamics"]
        },
        {
            id: 3,
            name: "Chemistry 101",
            status: "Available",
            statusType: "inactive",
            startDate: null,
            expiryDate: null,
            parts: ["Organic", "Inorganic"]
        }
    ];

    /**
     * MOCKED PAYMENT DATA
     * (Later comes from backend Payment model)
     */
    const purchasedParts = {
        1: ["Part A"],        // Math 101 → only Part A purchased
        2: ["Mechanics"],     // Physics → only Mechanics purchased
        3: []                 // Chemistry → nothing purchased
    };

    const [selectedParts, setSelectedParts] = useState({});

    /**
     * Auto-select first accessible part
     */
    useEffect(() => {
        const initialSelection = {};
        courses.forEach(course => {
            const accessible = purchasedParts[course.id] || [];
            initialSelection[course.id] =
                accessible[0] || course.parts[0];
        });
        setSelectedParts(initialSelection);
    }, []);

    const getDaysLeft = (startDate, expiryDate) => {
        if (!expiryDate || !startDate) return null;
        const today = new Date();
        const end = new Date(expiryDate);
        const start = new Date(startDate);

        if (today < start) {
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }

        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getExpiryPercentage = (startDate, expiryDate) => {
        if (!expiryDate || !startDate) return 0;

        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(expiryDate);

        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (totalDays <= 0) return 100;
        if (today < start) return 0;
        if (today > end) return 100;

        const elapsedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
        return Math.min(Math.round((elapsedDays / totalDays) * 100), 100);
    };

    const getExpiryColor = (daysLeft, startDate, expiryDate) => {
        if (!expiryDate || !startDate) return "inactive";
        if (daysLeft === 0) return "red";
        if (daysLeft < 5) return "red";
        if (daysLeft < 10) return "yellow";
        return "green";
    };

    const getActionText = (hasAccess, daysLeft) => {
        if (!hasAccess) return "Request Access";
        if (daysLeft === 0) return "Renew Access";
        return "-";
    };

    return (
        <div className="dashboard-container">
            <div className="profile-circle">
                <img
                    src={profile}
                    alt="User"
                    className="profile-image"
                />
            </div>
            <div className="device-request">
                <button className="request-btn">Device-Verification</button>
            </div>
            <div className="table-header">
                <span className="header">Course <img src={arrow} alt="arrow" /></span>
                <span className="header">Parts <img src={arrow} alt="arrow" /></span>
                <span className="header">Status <img src={arrow} alt="arrow" /></span>
                <span className="header">Expiry <img src={arrow} alt="arrow" /></span>
                <span className="header">Action <img src={arrow} alt="arrow" /></span>
            </div>

            <div className="table-body">
                {courses.map(course => {
                    const daysLeft = getDaysLeft(course.startDate, course.expiryDate);
                    const percentage = getExpiryPercentage(course.startDate, course.expiryDate);
                    const color = getExpiryColor(daysLeft, course.startDate, course.expiryDate);

                    const selectedPart = selectedParts[course.id];
                    const hasAccess =
                        purchasedParts[course.id]?.includes(selectedPart);

                    return (
                        <div key={course.id} className="table-row">
                            <div className="table-cell course-name">{course.name}</div>

                            <div className="table-cell parts">
                                <select
                                    className="parts-select"
                                    value={selectedPart || ""}
                                    onChange={e =>
                                        setSelectedParts({
                                            ...selectedParts,
                                            [course.id]: e.target.value
                                        })
                                    }
                                >
                                    {course.parts.map((part, index) => (
                                        <option key={index} value={part}>
                                            {part}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={`table-cell status ${course.statusType}`}>
                                {course.status}
                            </div>

                            <div className="table-cell expiry">
                                <div className="topic-progress">
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${color}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">
                                        {daysLeft !== null
                                            ? daysLeft > 0
                                                ? `${daysLeft} days left`
                                                : "Expired"
                                            : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="table-cell actions">
                                {getActionText(hasAccess, daysLeft) === "-" ? (
                                    <div className="access-granted">-</div>
                                ) : (
                                    <button className="access-btn">
                                        {getActionText(hasAccess, daysLeft)}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
