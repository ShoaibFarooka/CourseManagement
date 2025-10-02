import './UserNavbar.css';
import logo1 from '../../assets/icons/logo1.png'
import logo2 from '../../assets/icons/logo2.png'
import { NavLink, useNavigate } from 'react-router-dom';
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
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector(state => state.user);

    const navLinks = [
        { name: "Accounting Products", to: '/accounting', dropdown: true },
        { name: "About Us", to: '/About-Us' },
        { name: "Contact Us", to: '/Contact-Us' },
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
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfileDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
        <div className="user-navbar">
            <div className="container">
                <div className="left">
                    <div className="logo">
                        <NavLink to={"/"} className="logo-link">
                            <img className='image-1' src={logo1} alt="Logo" />
                            <img className='image-2' src={logo2} alt='logo' />
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
                            <ThemeToggel />
                            {!user ? (
                                <button className="login-button">Login</button>
                            ) : (
                                <div className="profile-dropdown" ref={profileRef}>
                                    <img
                                        src={Profile}
                                        alt="Profile"
                                        className="profile-pic"
                                        onClick={() => setOpenProfileDropdown(!openProfileDropdown)}
                                    />
                                    <div className={`dropdown-menu ${openProfileDropdown ? "open" : ""}`}>
                                        <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                                        <button
                                            className="dropdown-item"
                                            onClick={handleLogout}
                                        >Logout</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="right">
                    <ThemeToggel />
                    {!user ? (
                        <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                    ) : (
                        <div className="profile-dropdown" ref={profileRef}>
                            <img
                                // write user.avatar for the dynamic funcntionality 
                                src={Profile}
                                alt="Profile"
                                className="profile-pic"
                                onClick={() => setOpenProfileDropdown(!openProfileDropdown)}
                            />
                            <div className={`dropdown-menu ${openProfileDropdown ? "open" : ""}`}>
                                <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                                <button
                                    className="dropdown-item"
                                    onClick={handleLogout}
                                >Logout</button>
                            </div>
                        </div>
                    )}
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
