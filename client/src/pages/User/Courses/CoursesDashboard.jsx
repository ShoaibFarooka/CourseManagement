import React, { useState, useRef, useEffect } from "react";
import "./CoursesDashboard.css";
import { message } from 'antd';
import Sidebar from "./components/Sidebar/Sidebar";
import UnitExams from "./components/UnitExams/UnitExams";
import PracticeExams from "./components/PracticeExams/PracticeExams";
import PackageExams from "./components/PackageExams/PackageExams";
import Dashboard from "./components/Dashboard/Dashboard";
import courseService from '../../../services/courseService';
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import {
    fetchAllowedDevices,
    checkCurrentDeviceStatus,
    fetchPurchasedCourses
} from '../../../redux/userSlice';

const CoursesDashboard = () => {
    const [selectedExamType, setSelectedExamType] = useState("Dashboard");
    const [allCourses, setAllCourses] = useState([]);
    const sidebarRef = useRef(null);


    const dispatch = useDispatch();

    const fetchAllCourses = async () => {
        try {
            dispatch(ShowLoading());
            const res = await courseService.fetchAllCoursesWithParts();
            const groupedCourses = {};

            res.courses.forEach(item => {
                if (!groupedCourses[item.courseId]) {
                    groupedCourses[item.courseId] = {
                        id: item.courseId,
                        name: item.courseName,
                        parts: []
                    };
                }

                groupedCourses[item.courseId].parts.push({
                    id: item.partId,
                    name: item.partName
                });
            });

            const formattedCourses = Object.values(groupedCourses);
            setAllCourses(formattedCourses);

        } catch (error) {
            message.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        dispatch(fetchAllowedDevices());
        dispatch(checkCurrentDeviceStatus());
        dispatch(fetchPurchasedCourses());
        fetchAllCourses();
    }, [])

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
            case "Dashboard":
                return <Dashboard
                    allCourses={allCourses}
                />
            case "Unit Exams":
                return <UnitExams allCourses={allCourses} />;
            case "Practice Exams":
                return <PracticeExams allCourses={allCourses} />;
            case "Package Exams":
                return <PackageExams allCourses={allCourses} />;
            default:
                return <Dashboard />;
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

export default CoursesDashboard;
