import './Signup.css';
import { CountryDropdown } from 'react-country-region-selector';
import { useState } from 'react';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import userService from '../../../services/userServices';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const Signup = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        name: "",
        country: "",
        phone: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState({
        name: "",
        country: "",
        phone: "",
        email: "",
        password: ""
    });

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleCountryChange = (val) => {
        setFormData(prev => ({
            ...prev,
            country: val
        }))
    }

    const validateEmail = () => {
        const regex = /^[^\s@]+@[^\s@]+\.(com)$/;
        return regex.test(formData.email);
    }

    const validateData = () => {
        let newErrors = {};
        let hasErrors = false;
        if (formData.name.trim() === "") {
            newErrors.name = "Username is required!";
            hasErrors = true;
        } else {
            newErrors.name = "";
        }
        if (formData.country.trim() === "") {
            newErrors.country = "Country is required!";
            hasErrors = true;
        } else {
            newErrors.country = "";
        }
        if (formData.phone.trim() === "") {
            newErrors.phone = "Phone No is required!";
            hasErrors = true;
        } else {
            newErrors.phone = "";
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateData()) {
            return;
        }
        try {
            dispatch(ShowLoading());
            await userService.registerUser(formData, "user");
            const loginUser = {
                email: formData.email,
                password: formData.password
            }
            const response = await userService.loginUser(loginUser);
            if (response.token) {
                Cookies.set('course-managment-jwt-token', response.token, {
                    secure: true,
                    sameSite: 'Lax'
                });
                const from = location.state?.from?.pathname;
                navigate(from || '/');
                message.success("Successfully Logged In");
            } else {
                message.error(response.error || "Login Failed");
            }
        } catch (error) {
            message.error(error?.response?.data?.error || "Login/Registration Failed!");
        } finally {
            dispatch(HideLoading());
        }
    };


    return (
        <>
            <div className='signup'>
                <div className='title'>Welcome to ProExamPrep</div>
            </div>

            <div className='signup-form'>

                <div className='h1'>SignUp</div>

                <div className='box-1'>

                    <div className='row-1'>
                        <div className='username'>
                            <label htmlFor="name" className='heading-sm'>Username</label>
                            <input
                                className='input'
                                type="text"
                                name="name"
                                placeholder='UserName'
                                value={formData.name}
                                onChange={handleInputChange} />
                            {error.name && <span className='error-text'>{error.name}</span>}
                        </div>

                        <div className='country'>
                            <label htmlFor='country' className='heading-sm'>Country</label>
                            <CountryDropdown
                                value={formData.country}
                                onChange={handleCountryChange}
                                className="custom-input"
                            />
                            {error.country && <span className='error-text'>{error.country}</span>}
                        </div>
                    </div>


                    <div className='row-2'>
                        <div className='phone'>
                            <label htmlFor="phone" className='heading-sm'>Phone</label>
                            <input className='input' type="text" name='phone' placeholder='Phone' value={formData.phone} onChange={handleInputChange} />
                            {error.phone && <span className='error-text'>{error.phone}</span>}
                        </div>

                        <div className='email'>
                            <label htmlFor="email" className='heading-sm'>Email</label>
                            <input className='input' type="text" name='email' placeholder='Email' value={formData.email} onChange={handleInputChange} />
                            {error.email && <span className='error-text'>{error.email}</span>}
                        </div>

                    </div>

                    <div className='row-3'>
                        <div className='password'>
                            <label htmlFor="password" className='heading-sm'>Password</label>
                            <input className='input' type="password" name='password' placeholder='Password' value={formData.password} onChange={handleInputChange} />
                            {error.password && <span className='error-text'>{error.password}</span>}
                        </div>
                        <div className='empty'></div>
                    </div>

                </div>

                <div className='sign-up-btn'>
                    <button className='signup-btn' onClick={handleSubmit}>SignUp</button>
                </div>

                <p className="login-now">
                    Already have an account?{" "}
                    <a href="/login">
                        Login
                    </a>
                </p>

            </div>
        </>
    )
}


export default Signup;
