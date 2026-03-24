import React, { useState } from "react";
import "./OtpVerification.css";
import { FaArrowLeft } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { message as antdMessage } from "antd";
import userService from "../../../services/userServices";
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";

const OtpVerification = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const email = location.state?.email;
    const password = location.state?.password;

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

        if (e.key === "Enter") {
            handleSubmit(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const otpCode = otp.join("");
        if (!email || !password) {
            setError("Email or password not found. Please go back to signup.");
            setLoading(false);
            return;
        }

        try {
            dispatch(ShowLoading());
            await userService.verifyEmailOTP(email, otpCode);
            setMessage("Email verified successfully!");


            const loginResponse = await userService.loginUser({ email, password });

            if (loginResponse.token) {
                Cookies.set("course-managment-jwt-token", loginResponse.token, {
                    secure: true,
                    sameSite: "Lax",
                });

                const from = location.state?.from?.pathname;
                navigate(from || "/dashboard");

                antdMessage.success("Successfully Logged In!");
            } else {
                setError(loginResponse.error || "Login failed after OTP verification.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Expired or Invalid OTP");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError("Email not found. Please go back to signup.");
            return;
        }

        try {
            dispatch(ShowLoading());
            const response = await userService.resendEmailOTP(email);
            setMessage(response.message || "OTP resent successfully");
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend OTP");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <>
            <div className="otp">
                <div className="title">Welcome to ProExamPrep</div>
            </div>

            <div className="otp-container">
                <div className="h1">Verify Your Account</div>
                <div className="sub-title">
                    A 6-Digit verification code has been sent to your email
                </div>




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

                    {message && <p className="success-text">{message}</p>}
                    {error && <p className="error-text error">{error}</p>}

                    <button
                        className="verify-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>
                </div>

                <p className="resend">
                    Didn’t receive the code?
                    <button
                        className="req-btn"
                        onClick={handleResend}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Request Again"}
                    </button>
                </p>

                <div className="back-to-login">
                    <NavLink className="link" to="/login">
                        <FaArrowLeft width={24} />
                        Back to Login
                    </NavLink>
                </div>
            </div>
        </>
    );
};

export default OtpVerification;