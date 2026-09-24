import './Login.css'
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { GOOGLE_CLIENT_ID, loadGoogleIdentityServices } from '../../../configs/googleAuth.config';
import userService from '../../../services/userServices'
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';

const Login = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Google Identity Services renders its own button into this container.
    const googleBtnRef = useRef(null);

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
    const handleAuthSuccess = useCallback((response) => {
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
    }, [navigate]);

    // Google hands us a signed ID token. It is passed straight to our server, which
    // verifies the signature, audience and issuer before trusting anything in it —
    // nothing here is trusted client side.
    const handleGoogleCredential = useCallback(async ({ credential }) => {
        if (!credential) {
            message.error("Google sign in failed. Please try again.");
            return;
        }

        try {
            dispatch(ShowLoading());
            const response = await userService.googleLogin(credential);
            handleAuthSuccess(response);
        } catch (error) {
            const errorMessage = error?.response?.data?.error;
            message.error(errorMessage || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    }, [dispatch, handleAuthSuccess, navigate]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.error("VITE_GOOGLE_CLIENT_ID is not set — Google sign in is disabled.");
            return;
        }

        let cancelled = false;

        loadGoogleIdentityServices()
            .then((google) => {
                if (cancelled || !googleBtnRef.current) return;

                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredential,
                    // No silent auto sign in: the user has to actively choose an account.
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                // Cleared first so React's double-invoked effect in development cannot
                // render two stacked buttons.
                googleBtnRef.current.innerHTML = "";

                google.accounts.id.renderButton(googleBtnRef.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "pill",
                    logo_alignment: "center",
                    width: 320,
                });
            })
            .catch(() => {
                if (!cancelled) {
                    console.error("Could not load Google sign in.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [handleGoogleCredential]);

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

                    <div className="google-login" ref={googleBtnRef}></div>

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
