import './Footer.css';
import { NavLink } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import del from '../../assets/icons/del.png';
import { useSelector } from 'react-redux';
const Footer = () => {

    const { user } = useSelector(state => state.user);
    const role = user?.role || 'guest';

    const navLinks = [
        { name: "Home", to: "/home", roles: ["user", "guest"] },
        { name: "Courses", to: "/admin/courses", roles: ["admin"] },
        { name: "Questions", to: "/admin/questions", roles: ["admin"] },
    ];


    return (
        <div className='footer'>
            <div className='footer-logo'>
                <NavLink to='/admin/Courses' className='logo-link'>
                    <img src={del} alt="Logo" />
                </NavLink>
            </div>
            <div className='container'>

                <div className='footer-links'>
                    {navLinks
                        .filter(link => link.roles.includes(role))
                        .map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive ? 'footer-link active' : 'footer-link'
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                </div>

                <div className='container-1'>
                    <div className='social-icons'>
                        <FaFacebookF className="icon" />
                        <FaInstagram className="icon" />
                        <FaTwitter className="icon" />
                    </div>

                    <div className='text-sm copyright'>
                        &copy; copyright 2025. by Name.
                    </div>
                </div>


            </div>
        </div>
    )
}

export default Footer
