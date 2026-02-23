import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useRef
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { FaBars, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { message } from "antd";

const Sidebar = forwardRef((props, ref) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const purchasedCourses = useSelector(state => state.user.purchasedCourses);
    const deviceStatus = useSelector(state => state.user.currentDeviceStatus);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const handleMenuClick = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
        setIsSidebarOpen(false);
    };

    useImperativeHandle(ref, () => ({
        sidebarElement: sidebarRef.current,
        closeSidebar: () => setIsSidebarOpen(false),
    }));

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Unit Exams", path: "/dashboard/unit-exams" },
        { label: "Practice Exams", path: "/dashboard/practice-exams" },
        { label: "Package Exams", path: "/dashboard/package-exams" }
    ];

    const hasAccess =
        purchasedCourses &&
        purchasedCourses.length > 0 &&
        deviceStatus === true;

    return (
        <div className="sidebar-wrapper" ref={sidebarRef}>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                <FaBars />
            </button>

            <div className={`sidebar-container ${isSidebarOpen ? "active" : ""}`}>
                <div className="sidebar-title">Select your preference</div>

                <div className="sidebar-menu">
                    {menuItems.map(item => {
                        const isActive =
                            item.label === "Dashboard"
                                ? /^\/dashboard(\/dashboard)?$/.test(location.pathname)
                                : location.pathname === item.path;
                        const isLocked =
                            (item.label === "Practice Exams" ||
                                item.label === "Package Exams") &&
                            !hasAccess;

                        return (
                            <div
                                key={item.label}
                                className={`menu-item ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
                                onClick={() => {
                                    if (isLocked) {
                                        if (!purchasedCourses || purchasedCourses.length === 0) {
                                            message.warning("Please purchase a course first.");
                                        } else if (deviceStatus !== true) {
                                            message.warning("Please verify your device first.");
                                        }
                                    } else {
                                        handleMenuClick(item.path);
                                    }
                                }}
                            >
                                <span>
                                    {item.label}
                                    {isLocked && <span className="lock-icon"> 🔒</span>}
                                </span>

                                {!isLocked && (
                                    <span className="arrow-icon">
                                        <FaChevronRight size={12} />
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default Sidebar;
