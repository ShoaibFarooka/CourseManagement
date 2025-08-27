import './AdminFooter.css';
import { NavLink } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import del from '../../assets/icons/del.png';
const Footer = () => {

    const navLinks = [
        { name: "Courses", to: "/admin/courses" },
        { name: "Questions", to: "/admin/questions" },
    ];


    return (
        <div className='admin-footer'>
            <div className='footer-logo'>
                <NavLink to='/admin/Courses' className='logo-link'>
                    <img src={del} alt="Logo" />
                </NavLink>
            </div>
            <div className='container'>

                <div className='footer-links'>
                    {navLinks
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
