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

    const [errors, setErrors] = useState({});

    const accountStatus = user?.isBlocked === false ? "Active" : "Suspended";
    const baseURL = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone ? user.phone.toString() : "",
                country: user.country || "",
            });
            setProfileImage(`${baseURL}${user?.image}`);
        }
    }, [user]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(URL.createObjectURL(e.target.files[0]));
            setImageFile(e.target.files[0]);
        }
    };


    const validateForm = () => {
        const newErrors = {};
        const phoneRegex = /^[0-9]{7,15}$/;

        if (!formData.name.trim()) newErrors.name = "Username is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.country.trim()) newErrors.country = "Country is required";

        const phoneStr = formData.phone ? formData.phone.toString() : "";
        if (!phoneStr.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!phoneRegex.test(phoneStr)) {
            newErrors.phone = "Invalid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;


        const hasFormChanged =
            formData.name !== user?.name ||
            formData.email !== user?.email ||
            (formData.phone || "") !== (user?.phone ? user.phone.toString() : "") ||
            formData.country !== user?.country;

        const hasImageChanged = !!imageFile;

        if (!hasFormChanged && !hasImageChanged) {
            message.info("No changes detected.");
            return;
        }

        try {
            dispatch(ShowLoading());

            if (hasImageChanged) {
                const imageFormData = new FormData();
                imageFormData.append("profileImage", imageFile);
                await userService.updateUserProfileImage(imageFormData);
            }

            if (hasFormChanged) {
                await userService.updateUserInfo(formData);
            }

            message.success("Profile updated successfully!");
        } catch (error) {
            console.log(error);
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
                        src={profileImage}
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
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
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
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Country</label>
                            <CountryDropdown
                                value={formData.country}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, country: val }));
                                    setErrors(prev => ({ ...prev, country: "" }));
                                }}
                                className="input country-dropdown"
                            />
                            {errors.country && <span className="error-text">{errors.country}</span>}
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
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
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
