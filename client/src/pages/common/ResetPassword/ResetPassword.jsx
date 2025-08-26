import './resetPassword.css';
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import userService from "../../../services/userServices"
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState({
        confirmpassword: ""
    });

    const validateData = () => {
        let haserror = false;
        let newerror = {};
        if (password !== confirmPassword) {
            haserror = true;
            newerror.confirmpassword = "Password Does not match";
        } else {
            newerror.confirmpassword = ""
        }
        setError((prev) => ({ ...prev, ...newerror }));
        return !haserror;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateData()) {
            return;
        }

        try {
            dispatch(ShowLoading());
            const response = await userService.resetPassword({
                token,
                newPassword: password
            });
            message.success(response.message || "Password reset successful!");
            navigate("/login");
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className="resetpassword">
            <form
                onSubmit={handleSubmit}
                className="form"
            >
                <div className="heading-md h1">Reset Password</div>
                <p className="text-sm p1">
                    Enter a new password for your account.
                </p>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error.confirmpassword && (<span className='error-text'>{error.confirmpassword}</span>)}
                <button
                    type="submit"
                    className="btn"
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
