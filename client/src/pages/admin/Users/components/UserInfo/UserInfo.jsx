import React from "react";
import PaymentTable from "../PaymentTable/PaymentTable";
import DevicesTable from "../DevicesTable/DevicesTable";
import "./UserInfo.css";

const UserInfo = ({ user }) => {
    if (!user) return null;

    const {
        name,
        email,
        country,
        isBlocked,
        payments = [],
        allowedDevices = []
    } = user;

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
                    <span className={`status ${isBlocked ? "blocked" : "active"}`}>
                        {isBlocked ? "Blocked" : "Active"}
                    </span>
                </div>

            </div>

            {/* ================= PAYMENTS ================= */}
            <div className="section">
                <h3 className="section-title">Payments</h3>
                <PaymentTable payments={payments} />
            </div>

            {/* ================= DEVICES ================= */}
            <div className="section">
                <h3 className="section-title">Allowed Devices</h3>
                <DevicesTable devices={allowedDevices} />
            </div>

        </div>
    );
};

export default UserInfo;