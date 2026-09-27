import React, { useEffect, useState } from "react";
import PaymentTable from "../PaymentTable/PaymentTable";
import DevicesTable from "../DevicesTable/DevicesTable";
import userService from "../../../../../services/userServices";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import "./UserInfo.css";

const UserInfo = ({ user, fetchUsers }) => {
    const dispatch = useDispatch();
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        setCurrentUser(user);
    }, [user]);

    if (!currentUser) return null;

    const {
        _id,
        name,
        email,
        country,
        isBlocked,
        DeviceVerification,
        payments = [],
        allowedDevices = []
    } = currentUser;

    const handleStatusChange = async (e) => {
        const shouldBlock = e.target.value === "blocked";
        if (shouldBlock === isBlocked) return;

        try {
            dispatch(ShowLoading());
            if (shouldBlock) {
                await userService.blockUser(_id);
                message.success("User blocked successfully");
            } else {
                await userService.unblockUser(_id);
                message.success("User unblocked successfully");
            }
            setCurrentUser(prev => ({ ...prev, isBlocked: shouldBlock }));
            await fetchUsers?.();
        } catch (error) {
            message.error(error?.response?.data?.error || "Failed to update status");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleDeviceVerificationToggle = async (e) => {
        const enabled = e.target.checked;

        try {
            dispatch(ShowLoading());
            await userService.toggleDeviceVerification(_id, enabled);
            message.success(
                enabled
                    ? "Device verification bypass enabled"
                    : "Device verification bypass disabled"
            );
            setCurrentUser(prev => ({ ...prev, DeviceVerification: enabled }));
            await fetchUsers?.();
        } catch (error) {
            message.error(
                error?.response?.data?.error || "Failed to update device verification setting"
            );
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className="user-info-wrapper">

            <div className="title">
                {`${name} Information`}
            </div>

            {/* ================= USER HEADER ================= */}
            <div className="user-info-header">

                <div className="user-info-row">
                    <span className="label">Name:</span>
                    <span className="value">{name}</span>
                </div>

                <div className="user-info-row">
                    <span className="label">Email:</span>
                    <span className="value">{email}</span>
                </div>

                <div className="user-info-row">
                    <span className="label">Country:</span>
                    <span className="value">{country}</span>
                </div>

                <div className="user-info-row">
                    <span className="label">Status:</span>
                    <select
                        className={`status-select ${isBlocked ? "blocked" : "active"}`}
                        value={isBlocked ? "blocked" : "active"}
                        onChange={handleStatusChange}
                    >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>

                <div className="user-info-row">
                    <span className="label">Device Verification Bypass:</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={!!DeviceVerification}
                            onChange={handleDeviceVerificationToggle}
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>

            </div>

            {/* ================= PAYMENTS ================= */}
            <div className="section">
                <h3 className="section-title">Payments</h3>
                <PaymentTable payments={payments} fetchUsers={fetchUsers} />
            </div>

            {/* ================= DEVICES ================= */}
            <div className="section">
                <h3 className="section-title">Allowed Devices</h3>
                <DevicesTable devices={allowedDevices} userId={_id} fetchUsers={fetchUsers} />
            </div>

        </div>
    );
};

export default UserInfo;