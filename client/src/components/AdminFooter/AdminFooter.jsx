import './AdminFooter.css';
import { NavLink } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import logo1 from '../../assets/icons/logo1.png';
import logo2 from '../../assets/icons/logo2.png';

const AdminFooter = () => {

    const navLinks = [
        { name: "Courses", to: "/admin/courses" },
        { name: "Questions", to: "/admin/questions" },
        { name: "Requests", to: "/admin/requests" },
        { name: "Payments", to: "/admin/payments" }
    ];


    return (
        <div className='admin-footer'>
            <div className='footer-logo'>
                <NavLink className='image-1'><img src={logo1} alt="Logo" /></NavLink>
                <NavLink className='image-2'><img src={logo2} alt="Logo" /></NavLink>
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
                        &copy; copyright {new Date().getFullYear()}. by Name.
                    </div>

                </div>


            </div>
        </div>
    )
}

export default AdminFooter;
