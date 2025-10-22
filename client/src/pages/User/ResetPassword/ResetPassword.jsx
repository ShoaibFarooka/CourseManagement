import './resetPassword.css';
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, NavLink } from "react-router-dom";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import userService from "../../../services/userServices";
import { FaArrowLeft } from "react-icons/fa";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState({});
    const [isValidToken, setIsValidToken] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                navigate("/invalid-link");
                return;
            }

            try {
                dispatch(ShowLoading());
                const response = await userService.verifyResetToken(token);
                if (response.success) {
                    setIsValidToken(true);
                } else {
                    navigate("/invalid-link");
                }
            } catch (error) {
                message.error("Invalid or expired reset link");
                navigate("/invalid-link");
            } finally {
                dispatch(HideLoading());
            }
        };

        verifyToken();
    }, [token, dispatch, navigate]);

    if (isValidToken === null) {
        return <div className="resetpassword">Verifying link...</div>;
    }

    const validateData = () => {
        let hasError = false;
        let newError = {};
        if (!password.trim()) {
            newError.password = "Password is required";
            hasError = true;
        }
        if (!confirmPassword.trim()) {
            newError.confirmpassword = "Confirm your password";
            hasError = true;
        }
        if (confirmPassword && password !== confirmPassword) {
            newError.confirmpassword = "Passwords do not match";
            hasError = true;
        }
        setError(newError);
        return !hasError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateData()) return;

        try {
            dispatch(ShowLoading());
            const response = await userService.resetPassword({ token, newPassword: password });
            message.success(response.message || "Password reset successful!");
            navigate("/login");
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <>
            <div className="reset-password">
                <div className="title">Welcome to ProExamPrep</div>
            </div>

            <div className="resetpassword">
                <div className="h1">Reset Your Password</div>
                <p className="sub-title">Reset your account password</p>

                <form onSubmit={handleSubmit} className="form">
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="New Password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error.password && <span className="error-text">{error.password}</span>}

                    <div>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Confirm New Password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {error.confirmpassword && <span className="error-text">{error.confirmpassword}</span>}

                    <button type="submit" className="reset-btn">Reset Password</button>

                    <div className="back-to-login">
                        <NavLink className="link" to="/login">
                            <FaArrowLeft width={24} />
                            Back to Login
                        </NavLink>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ResetPassword;
