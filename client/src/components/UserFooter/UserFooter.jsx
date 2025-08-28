import './UserFooter.css';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/icons/logo.png';
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


const UserFooter = () => {

    const courselinks_1 = [
        { name: "CMA", to: "/cma" },
        { name: "CPA", to: "/cpa" },
        { name: "CIA", to: "/cia" },

        { name: "CFA", to: "/cma" },
        { name: "CPA", to: "/c" },
        { name: "CIA", to: "/a" },
    ];

    const companyLinks = [
        { name: "About", to: '/about' },
        { name: "Contact Us", to: '/contact-us' },
        { name: "Privacy Policy", to: '/privacy-ploicy' },
    ]

    const accountsLinks = [
        { name: "Log In", to: '/login' },
        { name: "FAQ", to: '/Faq' },
        { name: "Support", to: '/support' },
    ]

    const half = Math.ceil(courselinks_1.length / 2);
    const firstHalf = courselinks_1.slice(0, half);
    const secondHalf = courselinks_1.slice(half);

    return (
        <div className='user-footer'>

            <div className='container'>

                <div className='logo'>
                    <NavLink><img src={logo} alt="Logo" /></NavLink>
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
                <p className='copyright'>Copyright 2025 | All Rights Reserved</p>
                <div className="social-icons">
                    <NavLink to={'/'} className='icons'><FaFacebookF /></NavLink>
                    <NavLink to={'/'} className='icons'><FaXTwitter /></NavLink>
                    <NavLink to={'/'} className='icons'><FaInstagram /></NavLink>
                    <NavLink to={'/'} className='icons'><FaWhatsapp /></NavLink>
                </div>
            </div>
        </div>
    )
}

export default UserFooter
