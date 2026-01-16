import React from 'react'
import './DeviceVerification.css';
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const DeviceVerification = () => {
    return (
        <div className='device-verification'>
            <div className='title'>
                Device Verification
            </div>
            <div className='sub-title'>
                Device Verification Request of device verification has been sent to admin
            </div>
            <div className='contact-now'>
                <button className='button'>
                    Contact Now
                </button>
            </div>
            <div className='social-icons'>
                <a href="#">
                    <FaFacebookF />
                </a>
                <a href="#">
                    <FaInstagram />
                </a>
                <a href="#">
                    <FaWhatsapp />
                </a>
                <a href="#">
                    <FaXTwitter />
                </a>
            </div>
        </div>
    )
}

export default DeviceVerification
