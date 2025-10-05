import './UserFooter.css';
import { NavLink } from 'react-router-dom';
import logo1 from '../../assets/icons/logo1.png';
import logo2 from '../../assets/icons/logo2.png';
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useSelector } from 'react-redux';


const UserFooter = () => {

    const { user } = useSelector(state => state.user);

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
            ? { name: "Home", to: "/" }
            : { name: "Log In", to: "/login" },
        { name: "FAQ", to: "/faq" },
        { name: "Support", to: "/support" },
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
