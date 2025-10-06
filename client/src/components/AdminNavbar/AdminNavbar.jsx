import './AdminNavbar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from '../ThemeToggel/ThemeToggel'
import { useState } from 'react'
import del from '../../assets/icons/del.png';
import Cookies from 'js-cookie';
import userService from '../../services/userServices'
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../redux/loaderSlice';
import { setLoggedOut } from '../../redux/logoutSlice';
import { useDispatch } from 'react-redux';
import { clearUser } from '../../redux/userSlice';


const AdminNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const navLinks = [
        { name: "Courses", to: "/admin/courses" },
        { name: "Questions", to: "/admin/questions" },
        { name: "Requests", to: "/admin/requests" }
    ];


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
        <div className='admin-navbar'>

            <div className='container'>

                <div className='left'>
                    <NavLink className='logo'>
                        <img src={del} alt="Logo" />
                    </NavLink>

                    <div className={`nav-list ${isMobileMenuOpen ? 'open' : ''}`}>
                        {isMobileMenuOpen && (
                            <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                                ×
                            </button>
                        )
                        }

                        {navLinks
                            .map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        isActive ? 'nav-link active' : 'nav-link'
                                    }
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
