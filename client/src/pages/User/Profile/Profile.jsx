import React, { useEffect, useState } from "react";
import "./Profile.css";
import profileimg from '../../../assets/images/profile.jpg';
import { CountryDropdown } from 'react-country-region-selector';
import { useSelector, useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import userService from '../../../services/userServices';
import { message } from 'antd';

const Profile = () => {
    const dispatch = useDispatch();
    const { user, currentDeviceStatus } = useSelector(state => state.user);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        country: "",
    });

    const [profileImage, setProfileImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const accountStatus = user?.isBlocked === false ? "Active" : "Suspended";

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                country: user.country || "",
            });
            setProfileImage(user.profileImage || profileimg);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(URL.createObjectURL(e.target.files[0]));
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(ShowLoading());
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append("profileImage", imageFile);
                await userService.updateUserProfileImage(imageFormData);
            }

            const res = await userService.updateUserInfo(formData);

            message.success("Profile updated successfully!");
        } catch (error) {
            message.error(error.response?.data.message || "Something went wrong!");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <>
            <div className="profile"></div>

            <div className="profile-container">
                <div className="profile-image-section">
                    <img
                        src={profileImage || profileimg}
                        alt="Profile"
                        className="profile-image"
                    />
                    <label className="upload-btn">
                        Update Image
                        <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                    </label>
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="title">Profile</div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Country</label>
                            <CountryDropdown
                                value={formData.country}
                                onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
                                className="input country-dropdown"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone No</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>

                    <button type="submit" className="save-btn">
                        Save Changes
                    </button>
                </form>

                <div className="account-info">
                    <div className="status-row">
                        <span>Account Status:</span>
                        <span className={`status ${accountStatus.toLowerCase()}`}>
                            {accountStatus}
                        </span>
                    </div>

                    <div className="status-row">
                        <span>Device Verified:</span>
                        {currentDeviceStatus ? (
                            <span className="verified">Verified ✔</span>
                        ) : (
                            <span className="not-verified">Not Verified</span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
