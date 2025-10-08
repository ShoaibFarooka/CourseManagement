import { useState } from 'react';
import './ForgetPassword.css';
import userService from '../../../services/userServices';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import { FaArrowLeft } from "react-icons/fa";
import { NavLink } from 'react-router-dom'

const ForgetPassword = () => {

    const [email, setEmail] = useState("");
    const dispatch = useDispatch();

    const handleInputChange = (e) => {
        setEmail(e.target.value);
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(ShowLoading());
            await userService.forgotPassword({ email });
            message.success("Password reset link sent to your email");
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
            setEmail("");
        }
    }
    return (
        <>
            <div className='forgetpassword'>
                <div className='title'>Welcome to ProExamPrep</div>
            </div>


            <div className='form-container'>
                <div className='h1'>Forget Password</div>
                <div className='sub-title'>Please enter the email address associated with your account.</div>
                <form onSubmit={handleOnSubmit} className='form'>
                    <div>
                        <label htmlFor="email">Your Email</label>
                        <input className="input" type="text" value={email} name='email' placeholder='Enter Email Here' onChange={handleInputChange} />
                    </div>
                    <button className='send-btn'>Send Link</button>
                    <div className='back-to-login'>
                        <NavLink className="link" to='/login'>
                            <FaArrowLeft width={24} />
                            Back to Login
                        </NavLink>
                    </div>
                </form>
            </div>
        </>
    )
}

export default ForgetPassword
