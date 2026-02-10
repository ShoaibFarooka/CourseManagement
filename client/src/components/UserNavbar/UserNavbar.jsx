import './UserNavbar.css';
import logo1 from '../../assets/icons/logo1.png'
import logo2 from '../../assets/icons/logo2.png'
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ThemeToggel from '../ThemeToggel/ThemeToggel';
import { useSelector } from 'react-redux';
import userService from '../../services/userServices';
import { ShowLoading, HideLoading } from '../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { clearUser } from '../../redux/userSlice';
import { setLoggedOut } from '../../redux/logoutSlice';
import Profile from '../../assets/images/Profile.jpg';



const UserNavbar = () => {
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openProfileDropdown, setOpenProfileDropdown] = useState(false);
    const [openMobileProfileDropdown, setOpenMobileProfileDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    const mobileProfileRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector(state => state.user);
    const baseURL = import.meta.env.VITE_BASE_URL;

    const navLinks = [
        { name: "Courses", dropdown: true },
        { name: "Dashboard", to: '/dashboard' },
        { name: "About Us", to: '/About-Us' },
        { name: "Contact Us", to: '/Contact-Us' },
    ];

    const accountingDropdownItems = [
        { name: "CPA", to: "/courses/cpa" },
        { name: "CMA", to: "/courses/cma" },
        { name: "CIA", to: "/courses/cia" },
        { name: "CISA", to: "/courses/cisa" },
        { name: "CFE", to: "/courses/cfe" },
        { name: "CRMA", to: "/courses/crma" },
    ];

    const location = useLocation();
    const hideCoursesOn = ["/dashboard", "/quiz", "/progress-report"];
    const showCoursesLink = !hideCoursesOn.includes(location.pathname);




    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                mobileProfileRef.current &&
                !mobileProfileRef.current.contains(event.target)
            ) {
                setOpenMobileProfileDropdown(false);
            }

            if (
                openMobileMenu &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest(".hamburger")
            ) {
                setOpenMobileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMobileMenu]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }

            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfileDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [])


    const handleProfileDropDown = () => {
        navigate('/profile');
        setOpenProfileDropdown(prev => !prev);
    }

    const handleMobileProfileDropDown = () => {
        navigate('/profile');
        setOpenMobileMenu(false);
        setOpenMobileProfileDropdown(prev => !prev);
    }

    const handleClickNavLinks = () => {
        setOpenDropdown(false);
        setOpenMobileMenu(false);
    }

    const handleLogout = async () => {
        try {
            dispatch(ShowLoading());
            const payload = {};
            const response = await userService.logoutUser(payload);
        } catch (error) {
            message.error(error?.response?.data);
        } finally {
            Cookies.remove("course-managment-jwt-token");
            dispatch(clearUser());
            dispatch(setLoggedOut());
            navigate('/login');
            dispatch(HideLoading());
        }
    }

    return (
        <div className="user-navbar" >

            <div className="logo">
                <NavLink to={"/"} className="logo-link">
                    <img className='image-1' src={logo1} alt="Logo" />
                    <img className='image-2' src={logo2} alt='logo' />
                </NavLink>
            </div>



            <div className="left">

                <div
                    className={`nav-list ${openMobileMenu ? "open" : ""}`}
                    ref={mobileMenuRef} >

                    {openMobileMenu && (
                        <button
                            className="close-btn"
                            onClick={() => setOpenMobileMenu(false)}
                        >
                            ×
                        </button>
                    )}

                    {navLinks.map((item) => {
                        if (item.name === "Courses" && !showCoursesLink) return null;

                        return item.dropdown ? (
                            <div
                                key={item.name}
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
                                            className={({ isActive }) =>
                                                isActive ? "dropdown-item active" : "dropdown-item"
                                            }
                                            onClick={handleClickNavLinks}
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
                                onClick={handleClickNavLinks}
                            >
                                {item.name}
                            </NavLink>
                        );
                    })}



                    <div className="mobile">
                        <ThemeToggel />
                        {!user ? (
                            <button className="login-button"
                                onClick={() => navigate('/login')}>Login</button>
                        ) : (
                            <>
                                <button
                                    className="login-button"
                                    onClick={handleLogout}
                                >Logout
                                </button>
                                <div className="profile-dropdown" ref={mobileProfileRef}>
                                    <img
                                        src={user?.image ? `${baseURL}${user.image}` : Profile}
                                        alt="Profile"
                                        className="profile-pic"
                                        onClick={() => setOpenMobileProfileDropdown(!openMobileProfileDropdown)}
                                    />
                                    <div className={`dropdown-menu ${openMobileProfileDropdown ? "open" : ""}`}>
                                        <button
                                            className='dropdown-item'
                                            onClick={handleMobileProfileDropDown}>
                                            Profile
                                        </button>
                                    </div>
                                </div>
                            </>

                        )}
                    </div>
                </div>
            </div>

            <button
                className="hamburger"
                onClick={() => setOpenMobileMenu(true)}
            >
                ☰
            </button>
            <div className="right">
                <ThemeToggel />
                {!user ? (
                    <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                ) : (
                    <div className="profile-dropdown" ref={profileRef}>
                        <img
                            src={user?.image ? `${baseURL}${user.image}` : Profile}
                            alt="Profile"
                            className="profile-pic"
                            onClick={() => setOpenProfileDropdown(!openProfileDropdown)}
                        />
                        <div className={`dropdown-menu ${openProfileDropdown ? "open" : ""}`
                        } onClick={(e) => e.stopPropagation()}>
                            <button
                                className='dropdown-item'
                                onClick={handleProfileDropDown}>
                                Profile
                            </button>
                            <button
                                className="dropdown-item"
                                onClick={handleLogout}
                            >Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNavbar;
