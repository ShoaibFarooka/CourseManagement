import './Login.css'
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { message } from 'antd';
import ThemeToggle from '../../../components/ThemeToggel/ThemeToggel';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const Login = () => {

    const navigate = useNavigate();

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

    const handleClickLogin = (e) => {
        e.preventDefault();
        if (!validateData()) {
            return;
        }
        message.success("Logged in Successfully!", 2);
        navigate('/admin/dashboard');
    }

    return (
        <div className='login'>

            <div className='login-navbar'>
                <NavLink className='logo'>
                    <img src="" alt="Logo" />
                </NavLink>

                <ThemeToggle />
            </div>


            <div className='login-form'>

                <form onSubmit={handleClickLogin} className='form'>
                    <div className='heading-lg h1'>Admin Login</div>
                    <input type="text" name='email' value={formData.email} placeholder='Email' onChange={handleInputChange} />
                    {error.email && <span className='error'>{error.email}</span>}
                    <div className="password-field">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            placeholder="Password"
                            onChange={handleInputChange}
                        />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </span>
                    </div>
                    {error.password && <span className='error'>{error.password}</span>}
                    <button type='submit' className='btn login-btn'>Login</button>
                </form>

            </div>
        </div>
    )
}

export default Login
