import { NavLink } from "react-router-dom";
import './InvalidLink.css';

export default function InvalidLink() {
    return (
        <>
            <div className='forgetpassword'>
                <div className='title'>Welcome to ProExamPrep</div>
            </div>

            <div className="invalid-link">
                <h2>Invalid or Expired Reset Link</h2>
                <p>Please request a new password reset Link.</p>
                <NavLink to="/forgot-password" className="back-btn">Go to Forgot Password</NavLink>
            </div>
        </>
    );
}
