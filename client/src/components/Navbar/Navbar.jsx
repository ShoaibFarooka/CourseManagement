import './Navbar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from '../ThemeToggel/ThemeToggel'
import { useState } from 'react'
import del from '../../assets/icons/del.png';
import Cookies from 'js-cookie';
import userService from '../../services/userServices'
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../redux/loaderSlice';
import { setLoggedOut } from '../../redux/logoutSlice';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../redux/userSlice';


const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);
    const role = user?.role || 'guest';


    const navLinks = [
        { name: "Home", to: "/home", roles: ["user", "guest"] },
        { name: "Courses", to: "/admin/courses", roles: ["admin"] },
        { name: "Questions", to: "/admin/questions", roles: ["admin"] },
    ];

    const handleLogin = () => {
        navigate('/signup');
    }

    const handleLogout = async () => {
        try {
            dispatch(ShowLoading());
            const payload = {};
            const response = await userService.logoutUser(payload);
            console.log('Response', response);
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
        <div className='navbar'>

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
                            .filter(link => link.roles.includes(role))
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
                            {user ? (
                                <button className='btn' onClick={handleLogout}>Logout</button>
                            ) : (
                                <button className="btn" onClick={handleLogin}>Sign In</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className='right'>
                    <ThemeToggle />
                    {user ? (
                        <button className='btn' onClick={handleLogout}>Logout</button>
                    ) : (
                        <button className="btn" onClick={handleLogin}>Sign in</button>
                    )}
                </div>


                <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
                    ☰
                </button>


            </div>



        </div>
    )
}

export default Navbar
