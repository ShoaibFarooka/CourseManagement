import './Login.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { FcGoogle } from 'react-icons/fc';
import Cookies from 'js-cookie';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../configs/firebase.config';
import userService from '../../../services/userServices'
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';

const Login = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState({
        email: "",
        password: ""
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    };

    const validateEmail = () => {
        const regex = /^[^\s@]+@[^\s@]+\.(com)$/;
        return regex.test(formData.email);
    }

    const validateData = () => {
        let newErrors = {};
        let hasErrors = false;
        if (formData.email.trim() === "") {
            newErrors.email = "Email is required!";
            hasErrors = true;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please provide a valid Email!";
            hasErrors = true;
        }
        else {
            newErrors.email = "";
        }
        if (formData.password.trim() === "") {
            newErrors.password = "Password is required!";
            hasErrors = true;
        } else {
            newErrors.password = "";
        }
        setError((prevState) => ({ ...prevState, ...newErrors }));
        return !hasErrors;
    };

    // Shared by the password form and the Google button — both receive the same
    // { token, role } shape from the server.
    const handleAuthSuccess = (response) => {
        if (!response?.token) {
            message.error(response?.error || "Login Failed");
            return;
        }

        Cookies.set('course-managment-jwt-token', response.token, {
            secure: true,
            sameSite: 'Lax'
        });

        if (response.role === 'admin') {
            navigate('/admin/courses');
            message.success("Successfully Logged In");
        } else if (response.role === 'user') {
            navigate('/dashboard');
            message.success("Successfully Logged In");
        } else {
            message.error("Unknown User!");
        }
    };

    const handleClickGoogleLogin = async () => {
        let idToken;

        // The popup runs before the loader is shown — the user is interacting with the
        // Google window, and a full-screen loader behind it only gets in the way.
        try {
            const result = await signInWithPopup(auth, googleProvider);
            idToken = await result.user.getIdToken();
        } catch (error) {
            // Closing the popup or clicking the button twice is a normal action, not an
            // error worth surfacing.
            const ignored = [
                'auth/popup-closed-by-user',
                'auth/cancelled-popup-request',
                'auth/user-cancelled',
            ];
            if (!ignored.includes(error?.code)) {
                message.error("Google sign in failed. Please try again.");
            }
            return;
        }

        try {
            dispatch(ShowLoading());
            const response = await userService.googleLogin(idToken);
            handleAuthSuccess(response);
        } catch (error) {
            message.error(error?.response?.data?.error || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleClickLogin = async (e) => {
        e.preventDefault();
        if (!validateData()) {
            return;
        }
        try {
            dispatch(ShowLoading());
            const response = await userService.loginUser(formData);
            handleAuthSuccess(response);
        } catch (error) {
            const errorMessage = error?.response?.data?.error;
            const status = error?.response?.status;
            if (status === 403 && errorMessage?.includes("Email not verified")) {
                navigate("/otp-verification", {
                    state: {
                        email: formData.email,
                        password: formData.password
                    }
                });
                return;
            }
            message.error(error?.response?.data?.error || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    }

    return (
        <>
            <div className='login'>
                <div className='title'>Welcome to ProExamPrep</div>
            </div>

            <div className='login-form'>

                <div className='h1'>Log in</div>

                <form onSubmit={handleClickLogin} className='form'>
                    <div className='input-field'>
                        <label htmlFor="email">Email</label>
                        <input type="text" name='email' value={formData.email} placeholder='Email' onChange={handleInputChange} className='input' />
                        {error.email && <span className='error-text'>{error.email}</span>}
                    </div>

                    <div className="password-field">
                        <label htmlFor="password">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            placeholder="Password"
                            onChange={handleInputChange}
                            className='input'
                        />
                        {error.password && <span className='error-text'>{error.password}</span>}
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </span>
                        <div className="forget-password">
                            <a href="/forgot-password" className="text-sm">
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    <button type='submit' className='login-btn'>Login</button>

                    <div className="auth-divider"><span>or</span></div>

                    <button
                        type='button'
                        className='google-login-btn'
                        onClick={handleClickGoogleLogin}
                    >
                        <FcGoogle className='google-icon' />
                        <span>Continue with Google</span>
                    </button>

                    <div className="sign-up-now">
                        <p>Don’t have an account?</p>
                        <a href="/signup">
                            Sign up
                        </a>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Login
