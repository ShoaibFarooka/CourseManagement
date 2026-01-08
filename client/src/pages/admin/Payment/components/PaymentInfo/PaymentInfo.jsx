import React, { useState } from "react";
import { message } from "antd";
import paymentRequestService from "../../../../../services/paymentRequestService";
import "./PaymentInfo.css";

const PaymentInfo = ({ paymentRequest, onClose, fetchRequests }) => {
    const [loading, setLoading] = useState(false);
    const { user, course, part, status, _id } = paymentRequest || {};

    if (!paymentRequest) return null;

    const getActionButtons = () => {
        switch (status) {
            case "pending":
                return (
                    <>
                        <button className="approve-btn" onClick={() => handleUpdateStatus("approved")}>Approve</button>
                        <button className="reject-btn" onClick={() => handleUpdateStatus("rejected")}>Reject</button>
                    </>
                );
            case "approved":
                return <button className="reject-btn" onClick={() => handleUpdateStatus("rejected")}>Reject</button>;
            case "rejected":
                return <button className="approve-btn" onClick={() => handleUpdateStatus("approved")}>Approve</button>;
            case "blocked":
                return null;
            default:
                return null;
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setLoading(true);
            await paymentRequestService.updatePaymentRequestStatus(_id, newStatus);
            message.success(`Payment request ${newStatus} successfully`);
            fetchRequests();
            onClose();
        } catch (err) {
            console.error(err);
            message.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-info-container">
            <h2>Payment Request Details</h2>
            <div className="payment-info-row">
                <span className="label">User:</span>
                <span>{user?.name || "-"}</span>
            </div>
            <div className="payment-info-row">
                <span className="label">Course:</span>
                <span>{course?.title || "-"}</span>
            </div>
            <div className="payment-info-row">
                <span className="label">Part:</span>
                <span>{part || "-"}</span>
            </div>
            <div className="payment-info-row">
                <span className="label">Status:</span>
                <span style={{ textTransform: "capitalize" }}>{status}</span>
            </div>

            <div className="payment-info-actions">
                {getActionButtons()}
                <button className="close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default PaymentInfo;
