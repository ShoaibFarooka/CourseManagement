import React, { useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "./CoursesLayout.css";
import Sidebar from "./components/Sidebar/Sidebar";

const CoursesLayout = () => {
    const sidebarRef = useRef(null);
    const location = useLocation();

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

    const getTitle = () => {
        if (location.pathname.includes("unit-exams")) return "Unit Exams";
        if (location.pathname.includes("practice-exams")) return "Practice Exams";
        if (location.pathname.includes("package-exams")) return "Package Exams";
        return "Dashboard";
    };

    const getSubtitle = () => {
        if (location.pathname.includes("unit-exams"))
            return "Master each unit fast.";
        if (location.pathname.includes("practice-exams"))
            return "Practice before the exam.";
        if (location.pathname.includes("package-exams"))
            return "Complete packages, full prep.";
        return "Join millions who passed.";
    };

    return (
        <>
            <div className="courses-layout">
                <div className="title">{getTitle()}</div>
                <div className="sub-title">
                    {getSubtitle()}
                </div>
            </div>

            <div className="courses-layout-sidebar">
                <Sidebar ref={sidebarRef} />
                <Outlet />
            </div>
        </>
    );
};

export default CoursesLayout;
