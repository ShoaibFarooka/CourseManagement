import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useRef,
    useEffect
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { FaBars, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { message, Tooltip } from "antd";

const Sidebar = forwardRef((props, ref) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openTooltip, setOpenTooltip] = useState(null);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const purchasedCourses = useSelector(state => state.user.purchasedCourses);
    const deviceStatus = useSelector(state => state.user.currentDeviceStatus);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const handleMenuClick = (path) => {
        setOpenTooltip(null);
        if (location.pathname !== path) {
            navigate(path);
        }
        setIsSidebarOpen(false);
    };

    useImperativeHandle(ref, () => ({
        sidebarElement: sidebarRef.current,
        closeSidebar: () => setIsSidebarOpen(false),
    }));

    // Whenever the sidebar closes (from any path — toggle, closeSidebar via ref,
    // outside click, navigation, etc.), make sure any open tooltip closes with it.
    useEffect(() => {
        if (!isSidebarOpen) {
            setOpenTooltip(null);
        }
    }, [isSidebarOpen]);

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Unit Exams", path: "/dashboard/unit-exams" },
        { label: "Practice Exams", path: "/dashboard/practice-exams" },
        { label: "Package Exams", path: "/dashboard/package-exams" }
    ];

    const menuTooltips = {
        "Unit Exams": "Unit Exams let you select your course, exam part, and publisher. Start new sessions, resume previous attempts, or practise wrong answers with instant feedback and detailed explanations for every option.",
        "Practice Exams": "Practice Exam simulates the real exam with randomized questions from all publishers. Choose a 125-question full exam or 50-question quick practice. Get your score, detailed review, explanations, and performance analysis after submission.",
        "Package Exams": "Package Exams offers Standard Review with 125 selected questions from one publisher and Mega Review with customizable question counts. Both provide instant results and detailed explanations for every answer option to strengthen your preparation."
    };

    const hasAccess =
        deviceStatus === true &&
        purchasedCourses?.some(p => new Date(p.expiryDate) > new Date());

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

                        const tooltipText = menuTooltips[item.label];

                        const labelContent = (
                            <span>
                                {item.label}
                                {isLocked && <span className="lock-icon"> 🔒</span>}
                                {tooltipText && (
                                    <span
                                        className="tooltip-info-icon"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setOpenTooltip(prev =>
                                                prev === item.label ? null : item.label
                                            );
                                        }}
                                    >
                                        <FaInfoCircle size={12} />
                                    </span>
                                )}
                            </span>
                        );

                        return (
                            <div
                                key={item.label}
                                className={`menu-item ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
                                onPointerEnter={(e) => {
                                    if (e.pointerType === "mouse" && tooltipText) {
                                        setOpenTooltip(item.label);
                                    }
                                }}
                                onPointerLeave={(e) => {
                                    if (e.pointerType === "mouse") {
                                        setOpenTooltip(null);
                                    }
                                }}
                                onClick={() => {
                                    setOpenTooltip(null);
                                    if (isLocked) {
                                        if (!purchasedCourses || purchasedCourses.length === 0) {
                                            message.warning("Please purchase a course first.");
                                        } else if (!purchasedCourses.some(p => new Date(p.expiryDate) > new Date())) {
                                            message.warning("Your course subscription has expired.");
                                        } else if (deviceStatus !== true) {
                                            message.warning("Please verify your device first.");
                                        }
                                    } else {
                                        handleMenuClick(item.path);
                                    }
                                }}
                            >
                                {tooltipText ? (
                                    <Tooltip
                                        title={tooltipText}
                                        rootClassName="custom-tooltip sidebar-menu-tooltip"
                                        placement="right"
                                        trigger={[]}
                                        open={openTooltip === item.label}
                                    >
                                        {labelContent}
                                    </Tooltip>
                                ) : (
                                    labelContent
                                )}

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