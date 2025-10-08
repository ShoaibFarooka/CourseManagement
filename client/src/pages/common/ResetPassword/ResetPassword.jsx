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

        <>
            <div className='reset-password'>
                <div className='title'>Welcome to ProExamPrep</div>
            </div>

            <div className="resetpassword">

                <div className=" h1">Reset Password</div>
                <p className="sub-title">
                    Enter a new password for your account.
                </p>


                <form
                    onSubmit={handleSubmit}
                    className="form"
                >
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            className='input'
                            type="password"
                            placeholder="New Password"
                            name='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            className='input'
                            type="password"
                            placeholder="Confirm New Password"
                            name='confirmPassword'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error.confirmpassword && (<span className='error-text'>{error.confirmpassword}</span>)}

                    <button type="submit" className="reset-btn">
                        Reset Password
                    </button>
                </form>
            </div>
        </>
    );
};

export default ResetPassword;
