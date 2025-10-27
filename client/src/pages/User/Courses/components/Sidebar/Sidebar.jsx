import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./Sidebar.css";
import { FaChevronRight, FaChevronDown, FaBars } from "react-icons/fa";

const Sidebar = () => {

    const [activeMenu, setActiveMenu] = useState("Unit Exams");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const sidebarMenuRef = useRef(null);


    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };


    const toggleMenu = (menuName) => {
        setActiveMenu(menuName);
        setExpandedMenu((prev) => (prev === menuName ? null : menuName));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(event.target)) {
                setExpandedMenu(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const menuItems = [
        {
            name: "Unit Exams",
            subItems: ["Subtopic 1", "Subtopic 2"],
        },
        {
            name: "Practice Exams",
            subItems: ["Practice 1", "Practice 2"],
        },
        {
            name: "Package Exams",
            subItems: ["Package 1", "Package 2"],
        },
    ];

    return (
        <>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                <FaBars />
            </button>

            <div
                className={`sidebar-container ${isSidebarOpen ? "active" : ""}`}
            >
                <div className="sidebar-title">Select your preference</div>

                <div className="sidebar-menu"
                    ref={sidebarMenuRef}>
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            <div
                                className={`menu-item ${activeMenu === item.name ? "active" : ""}`}
                                onClick={() => toggleMenu(item.name)}
                            >
                                <span>{item.name}</span>
                                {item.subItems && (
                                    <span className="arrow-icon">
                                        {expandedMenu === item.name ? (
                                            <FaChevronDown size={12} />
                                        ) : (
                                            <FaChevronRight size={12} />
                                        )}
                                    </span>
                                )}
                            </div>

                            {expandedMenu === item.name && (
                                <div className="submenu">
                                    {item.subItems.map((sub) => (
                                        <div key={`${item.name}-${sub}`} className="submenu-item">
                                            {sub}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
