import './UserFooter.css';
import { NavLink } from 'react-router-dom';
import logo1 from '../../assets/icons/logo1.png';
import logo2 from '../../assets/icons/logo2.png';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { useSelector } from 'react-redux';


const UserFooter = () => {

    const { user } = useSelector(state => state.user);
    const whatsappNumber = "923254698122";

    const courselinks_1 = [
        { name: "CPA", to: "/courses/cpa" },
        { name: "CIA", to: "/courses/cia" },
        { name: "CMA", to: "/courses/cma" },

        { name: "CFE", to: "/courses/cfe" },
        { name: "CISA", to: "/courses/cisa" },
        { name: "CRMA", to: "/courses/crma" },
    ];

    const companyLinks = [
        { name: "About Us", to: '/About-us' },
        { name: "Contact Us", to: '/Contact-us' },
        { name: "Privacy Policy", to: '/Privacy-Policy' },
    ]

    const accountsLinks = [
        user
            ? { name: "Dashboard", to: "/dashboard" }
            : { name: "Log In", to: "/login" },
        { name: "Profile", to: "/profile" },
        { name: "Home", to: "/" },
    ];
    const half = Math.ceil(courselinks_1.length / 2);
    const firstHalf = courselinks_1.slice(0, half);
    const secondHalf = courselinks_1.slice(half);

    return (
        <div className='user-footer'>

            <div className='container'>

                <div className='logo'>
                    <NavLink className='image-1'><img src={logo1} alt="Logo" /></NavLink>
                    <NavLink className='image-2'><img src={logo2} alt="Logo" /></NavLink>
                </div>

                <div className='links'>
                    <div className='column'>
                        <div className='link-title'>Exam Prep</div>
                        {
                            firstHalf.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        isActive ? 'link active' : 'link'
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))
                        }
                    </div>

                    <div className='column'>
                        <div className='link-title'>Exam Prep</div>
                        {
                            secondHalf.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        isActive ? 'link active' : 'link'
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))
                        }
                    </div>

                    <div className='column'>
                        <div className='link-title'>Company</div>
                        {
                            companyLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        isActive ? 'link active' : 'link'
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))
                        }
                    </div>

                    <div className='column'>
                        <div className='link-title'>My Account</div>
                        {
                            accountsLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        isActive ? 'link active' : 'link'
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))
                        }
                    </div>
                </div>

            </div>

            <div className="bottom">
                <p className='copyright'>Copyright {new Date().getFullYear()}. | All Rights Reserved</p>
                <div className="social-icons">
                    <NavLink to='https://www.facebook.com/share/1H4KsxAGn8/' target='blank' className='icons'><FaFacebookF color="#1877F2" /></NavLink>
                    <NavLink to='https://www.linkedin.com/in/eproexamprep-prep-resources-5a13433a9?utm_source=share_via&utm_content=profile&utm_medium=member_android' target='blank' className='icons'><FaLinkedin color="#0077B5" /></NavLink>
                    <NavLink to='#' className='icons'><FaInstagram color="#E4405F" /></NavLink>
                    <NavLink
                        to={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icons"
                    >
                        <FaWhatsapp color="#25D366" />
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

export default UserFooter
