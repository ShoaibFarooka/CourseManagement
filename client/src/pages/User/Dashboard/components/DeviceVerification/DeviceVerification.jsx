import React from 'react'
import './DeviceVerification.css';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';

const DeviceVerification = () => {
    const whatsappNumber = "923254698122";
    const navigate = useNavigate();
    const handleClickContactNow = () => {
        navigate('/Contact-Us')
    }
    return (
        <div className='device-verification'>
            <div className='title'>
                Device Verification
            </div>
            <div className='sub-title'>
                Device Verification Request of device verification has been sent to admin
            </div>
            <div className='contact-now'>
                <button className='button' onClick={handleClickContactNow}>
                    Contact Now
                </button>
                <span className='phone'><FaWhatsapp size={22} /> +923254698122</span>
            </div>
            <div className='social-icons'>
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
    )
}

export default DeviceVerification
