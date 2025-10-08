import React, { useState } from "react";
import "./OtpVerification.css";
import { FaArrowLeft } from "react-icons/fa";
import { NavLink } from 'react-router-dom'

const OtpVerification = () => {
    const [otp, setOtp] = useState(["", "", "", ""]);

    const handleChange = (value, index) => {
        if (/^[0-9a-zA-Z]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < otp.length - 1) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-input-${index - 1}`).focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Entered OTP: " + otp.join(""));
    };

    return (
        <>
            <div className="otp">
                <div className='title'>Welcome to ProExamPrep</div>
            </div>

            <div className="otp-container">
                <div className="h1">Verify Your Account</div>
                <div className="sub-title">A 4-Digit verification code has been sent on your email</div>

                <div className="form">
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-input-${index}`}
                                type="text"
                                value={digit}
                                maxLength="1"
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                    </div>

                    <button className="verify-btn" onClick={handleSubmit}>
                        Verify Code
                    </button>

                </div>

                <p className="resend">
                    Didn’t receive the code?
                    <button className="req-btn">Request Again</button>
                </p>

                <div className='back-to-login'>
                    <NavLink className="link" to='/login'>
                        <FaArrowLeft width={24} />
                        Back to Login
                    </NavLink>
                </div>
            </div>
        </>
    );
};

export default OtpVerification;
