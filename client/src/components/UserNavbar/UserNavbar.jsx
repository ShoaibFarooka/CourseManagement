import './UserNavbar.css';
import logo from '../../assets/icons/logo.png';
import { NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ThemeToggel from '../ThemeToggel/ThemeToggel';

const UserNavbar = () => {
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const navLinks = [
        { name: "Accounting Products", to: '/accounting', dropdown: true },
        { name: "About", to: '/about' },
        { name: "Contact Us", to: '/contactus' },
    ];

    const accountingDropdownItems = [
        { name: "Product A", to: "/accounting/product-a" },
        { name: "Product B", to: "/accounting/product-b" },
        { name: "Product C", to: "/accounting/product-c" },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="user-navbar">
            <div className="container">
                <div className="left">
                    <div className="logo">
                        <NavLink to={"/"} className="logo-link">
                            <img src={logo} alt="Logo" />
                        </NavLink>
                    </div>

                    <div className={`nav-list ${openMobileMenu ? "open" : ""}`}>
                        {openMobileMenu && (
                            <button
                                className="close-btn"
                                onClick={() => setOpenMobileMenu(false)}
                            >
                                ×
                            </button>
                        )}

                        {navLinks.map((item) =>
                            item.dropdown ? (
                                <div
                                    key={item.to}
                                    ref={dropdownRef}
                                    className={`dropdown ${openDropdown ? "open" : ""}`}
                                    onClick={() => setOpenDropdown(!openDropdown)}
                                >
                                    <span className="link">
                                        {item.name} ▾
                                    </span>

                                    <div className={`dropdown-menu ${openDropdown ? "open" : ""}`}>
                                        {accountingDropdownItems.map((sub) => (
                                            <NavLink
                                                key={sub.to}
                                                to={sub.to}
                                                className="dropdown-item"
                                                onClick={() => setOpenDropdown(false)}
                                            >
                                                {sub.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        isActive ? "link active" : "link"
                                    }
                                    onClick={() => setOpenDropdown(false)}
                                >
                                    {item.name}
                                </NavLink>
                            )
                        )}

                        <div className="mobile">
                            <button className="signin-btn">Sign in</button>
                            <ThemeToggel />
                        </div>
                    </div>
                </div>

                <div className="right">
                    <button className="signin-btn">Sign in</button>
                    <ThemeToggel />
                </div>

                <button
                    className="hamburger"
                    onClick={() => setOpenMobileMenu(true)}
                >
                    ☰
                </button>
            </div>
        </div>
    );
};

export default UserNavbar;
