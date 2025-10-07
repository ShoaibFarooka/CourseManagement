import React, { useState } from "react";
import requestService from "../../../services/requestService";
import "./Profile.css";
import { getBasicDeviceInfo } from '../../../utilis/deviceInfoUtils';

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleRequestAccess = async () => {
        setLoading(true);
        setMessage("");

        try {

            const deviceInfo = await getBasicDeviceInfo();
            const response = await requestService.createDeviceRequest(deviceInfo);

            setMessage(response.message || "Request sent successfully!");
        } catch (error) {
            setMessage(error.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile">
            <div className="profile-card">
                <h2 className="profile-title">My Profile</h2>

                <div className="profile-info">
                    <p>Welcome back!</p>
                </div>

                <button
                    onClick={handleRequestAccess}
                    disabled={loading}
                    className="request-btn"
                >
                    {loading ? "Sending..." : "Request Device Access"}
                </button>

                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default Profile;
