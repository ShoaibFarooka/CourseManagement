import React, { useState, forwardRef, useImperativeHandle, useRef } from "react";
import "./Sidebar.css";
import { FaBars, FaChevronRight } from "react-icons/fa";

const Sidebar = forwardRef(({ onMenuSelect }, ref) => {
    const [activeMenu, setActiveMenu] = useState("Unit Exams");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const handleMenuClick = (menuName) => {
        setActiveMenu(menuName);
        onMenuSelect(menuName);
        setIsSidebarOpen(false);
    };

    useImperativeHandle(ref, () => ({
        sidebarElement: sidebarRef.current,
        closeSidebar: () => setIsSidebarOpen(false),
    }));

    const menuItems = ["Unit Exams", "Practice Exams", "Package Exams"];

    return (
        <div className="sidebar-wrapper" ref={sidebarRef}>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                <FaBars />
            </button>

            <div className={`sidebar-container ${isSidebarOpen ? "active" : ""}`}>
                <div className="sidebar-title">Select your preference</div>

                <div className="sidebar-menu">
                    {menuItems.map((item) => (
                        <div
                            key={item}
                            className={`menu-item ${activeMenu === item ? "active" : ""}`}
                            onClick={() => handleMenuClick(item)}
                        >
                            {item}
                            <span className="arrow-icon">
                                <FaChevronRight size={12} />
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Sidebar;
