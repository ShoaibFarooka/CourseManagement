import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useRef
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { FaBars, FaChevronRight } from "react-icons/fa";

const Sidebar = forwardRef((props, ref) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

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
        { label: "Dashboard", path: "/courses/dashboard" },
        { label: "Unit Exams", path: "/courses/unit-exams" },
        { label: "Practice Exams", path: "/courses/practice-exams" },
        { label: "Package Exams", path: "/courses/package-exams" }
    ];

    return (
        <div className="sidebar-wrapper" ref={sidebarRef}>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                <FaBars />
            </button>

            <div className={`sidebar-container ${isSidebarOpen ? "active" : ""}`}>
                <div className="sidebar-title">Select your preference</div>

                <div className="sidebar-menu">
                    {menuItems.map(item => {
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <div
                                key={item.label}
                                className={`menu-item ${isActive ? "active" : ""}`}
                                onClick={() => handleMenuClick(item.path)}
                            >
                                {item.label}
                                <span className="arrow-icon">
                                    <FaChevronRight size={12} />
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default Sidebar;
