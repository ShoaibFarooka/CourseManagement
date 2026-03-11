import './AdminNavbar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggel/ThemeToggel';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import userService from '../../services/userServices';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../redux/loaderSlice';
import { setLoggedOut } from '../../redux/logoutSlice';
import { useDispatch } from 'react-redux';
import { clearUser } from '../../redux/userSlice';
import logo1 from '../../assets/icons/logo1.png';
import logo2 from '../../assets/icons/logo2.png';


const AdminNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mobileMenuRef = useRef(null);

    const navLinks = [
        { name: "Courses", to: "/admin/courses" },
        { name: "Questions", to: "/admin/questions" },
        { name: "Requests", to: "/admin/requests" },
        { name: "Payment", to: "/admin/payments" },
        { name: "Users", to: "/admin/users" }
    ];

    const handleLogout = async () => {
        try {
            dispatch(ShowLoading());
            await userService.logoutUser({});
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isMobileMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest(".hamburger")
            ) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobileMenuOpen]);

    return (
        <div className='admin-navbar'>
            <div className='container'>
                <div className='left'>
                    <NavLink to="/admin/courses" className="logo">
                        <img className='image-1' src={logo1} alt="Logo" />
                        <img className='image-2' src={logo2} alt='logo' />
                    </NavLink>

                    <div className={`nav-list ${isMobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
                        {isMobileMenuOpen && (
                            <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                                ×
                            </button>
                        )}

                        {navLinks.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        ))}

                        <div className='mobile-btns'>
                            <ThemeToggle />
                            <button className='btn' onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className='right'>
                    <ThemeToggle />
                    <button className='btn' onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
                    ☰
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar;
