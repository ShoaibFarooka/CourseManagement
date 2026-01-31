import './Login.css'
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import userService from '../../../services/userServices'
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();
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

    const handleClickLogin = async (e) => {
        e.preventDefault();
        if (!validateData()) {
            return;
        }
        try {
            dispatch(ShowLoading());
            const response = await userService.loginUser(formData);
            if (response.token) {
                Cookies.set('course-managment-jwt-token', response.token, {
                    secure: true,
                    sameSite: 'Lax'
                });
                const from = location.state?.from?.pathname;
                if (response.role === 'admin') {
                    navigate('/admin/courses');
                    message.success("Successfully Logged In");
                } else if (response.role === 'user') {
                    navigate('/dashboard');
                    message.success("Successfully Logged In");
                } else {
                    message.error("Unknown User!");
                }

            } else {
                message.error(response.error || "Login Failed");
            }
        } catch (error) {
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
