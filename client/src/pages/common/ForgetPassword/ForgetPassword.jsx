import { useState } from 'react';
import './ForgetPassword.css';
import userService from '../../../services/userServices';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';

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
        <div className='forgetpassword'>
            <form onSubmit={handleOnSubmit} className='form'>
                <div className='heading-md h1'>Forget Password</div>
                <div className='text-sm p1'>
                    Enter your email and we’ll send you a reset link.
                </div>
                <input type="text" value={email} name='email' placeholder='Enter Email Here' onChange={handleInputChange} />
                <button className='btn'>Send Link</button>
            </form>
        </div>
    )
}

export default ForgetPassword
