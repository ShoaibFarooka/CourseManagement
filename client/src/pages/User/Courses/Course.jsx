import React, { useState, useRef, useEffect } from "react";
import "./Course.css";
import Sidebar from "./components/Sidebar/Sidebar";
import UnitExams from "./components/UnitExams/UnitExams";
import PracticeExams from "./components/PracticeExams/PracticeExams";
import PackageExams from "./components/PackageExams/PackageExams";

const Course = () => {
    const [selectedExamType, setSelectedExamType] = useState("Unit Exams");
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                sidebarRef.current.sidebarElement &&
                !sidebarRef.current.sidebarElement.contains(event.target)
            ) {
                sidebarRef.current.closeSidebar();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const renderContent = () => {
        switch (selectedExamType) {
            case "Unit Exams":
                return <UnitExams />;
            case "Practice Exams":
                return <PracticeExams />;
            case "Package Exams":
                return <PackageExams />;
            default:
                return <UnitExams />;
        }
    };

    return (
        <>
            <div className="course">
                <div className="title">Dashboard</div>
                <div className="sub-title">Join the millions who passed with Gleim.</div>
            </div>

            <div className="course-content">
                <Sidebar ref={sidebarRef} onMenuSelect={setSelectedExamType} />
                {renderContent()}
            </div>
        </>
    );
};

export default Course;
