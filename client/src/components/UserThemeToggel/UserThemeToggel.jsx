import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/themeSlice.js";
import { useState, useRef, useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import "./UserThemeToggel.css";

const UserThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.theme);
    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const useIsMobile = (breakpoint = 768) => {
        const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

        useEffect(() => {
            const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, [breakpoint]);

        return isMobile;
    };

    const isMobile = useIsMobile();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleThemeChange = (selectedTheme) => {
        if (theme !== selectedTheme) {
            dispatch(toggleTheme());
        }
        setOpenDropdown(false);
    };

    const ThemeButtons = () => (
        <>
            <button
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => handleThemeChange("light")}
            >
                ☀️ Light {theme === "light" && <FaCheck className="check-icon" />}
            </button>
            <button
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => handleThemeChange("dark")}
            >
                🌙 Dark {theme === "dark" && <FaCheck className="check-icon" />}
            </button>
        </>
    );

    return (
        <div className="theme-toggle-container" ref={dropdownRef}>
            {isMobile ? (
                <div className="theme-buttons-inline">
                    <ThemeButtons />
                </div>
            ) : (
                <>
                    <button
                        className="settings-btn"
                        onClick={() => setOpenDropdown(!openDropdown)}
                    >
                        <FiSettings size={22} />
                    </button>

                    <div className={`theme-dropdown ${openDropdown ? "open" : ""}`}>
                        <ThemeButtons />
                    </div>
                </>
            )}
        </div>
    );
};

export default UserThemeToggle;
