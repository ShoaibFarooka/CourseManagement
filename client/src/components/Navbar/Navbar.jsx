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
import { useDispatch } from 'react-redux';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
            dispatch(setLoggedOut());
            navigate('/admin/login');
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
                        <NavLink to='/admin/dashboard' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Courses</NavLink>
                        <NavLink to='/admin/questions' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Questions</NavLink>

                        <div className='mobile-btns'>
                            <ThemeToggle />
                            <button className='btn' onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>

                <div className='right'>
                    <ThemeToggle />
                    <button className='btn' onClick={handleLogout}>Logout</button>
                </div>


                <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
                    ☰
                </button>


            </div>



        </div>
    )
}

export default Navbar
