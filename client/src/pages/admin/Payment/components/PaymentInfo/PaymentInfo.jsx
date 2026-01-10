import React, { useState } from "react";
import { message } from "antd";
import paymentRequestService from "../../../../../services/paymentRequestService";
import "./PaymentInfo.css";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import { useDispatch } from "react-redux";

const PaymentInfo = ({ paymentRequest, onClose, fetchRequests }) => {

    const { user, course, part, status, _id } = paymentRequest || {};
    const [formData, setFormData] = useState({
        amount: "",
        startDate: "",
        expiryDate: "",
        comment: "",
    });
    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();

    const partName = paymentRequest?.course?.parts?.find(
        (p) => p._id.toString() === paymentRequest.part.toString())?.name || "Unknown Part";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const getActionButtons = () => {
        switch (status) {
            case "pending":
                return (
                    <>
                        <button className="approve-btn" onClick={() => handleApprovePaymentRequest("approved")}>Approve</button>
                        <button className="reject-btn" onClick={() => handleRejectPaymentRequest("rejected")}>Reject</button>
                    </>
                );
            case "approved":
                return <button className="reject-btn" onClick={() => handleRejectPaymentRequest("rejected")}>Reject</button>;
            case "rejected":
                return <button className="approve-btn" onClick={() => handleApprovePaymentRequest("approved")}>Approve</button>;
            case "blocked":
                return null;
            default:
                return null;
        }
    };

    const validatePaymentForm = ({ amount, startDate, expiryDate }) => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!amount || Number(amount) <= 0) {
            errors.amount = "Amount is required and must be greater than zero";
        }

        if (!startDate) {
            errors.startDate = "Start date is required";
        } else if (new Date(startDate) < today) {
            errors.startDate = "Start date cannot be in the past";
        }

        if (!expiryDate) {
            errors.expiryDate = "Expiry date is required";
        } else if (new Date(expiryDate) < today) {
            errors.expiryDate = "Expiry date cannot be in the past";
        }

        if (
            startDate &&
            expiryDate &&
            new Date(expiryDate) < new Date(startDate)
        ) {
            errors.expiryDate = "Expiry date cannot be before start date";
        }

        return errors;
    };

    const handleApprovePaymentRequest = async (newStatus) => {
        const validationErrors = validatePaymentForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            dispatch(ShowLoading());
            const { amount, startDate, expiryDate, comment } = formData;

            await paymentRequestService.approvePaymentRequest(_id, course._id, part,
                {
                    status: newStatus,
                    amount,
                    startDate,
                    expiryDate,
                    comment
                }

            );

            message.success(`Payment request ${newStatus} successfully`);
            setErrors({});
        } catch (error) {
            console.log(error);
            message.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
            fetchRequests();
            onClose();
        }
    };

    const handleRejectPaymentRequest = async (newStatus) => {
        try {
            dispatch(ShowLoading());
            await paymentRequestService.rejectPaymentRequest(_id, { status: newStatus })
            message.success(`Payment request ${newStatus} successfully`);
        } catch (error) {
            message.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
            fetchRequests();
            onClose();
        }
    }


    if (!paymentRequest) return <div>Error Fetching Request!</div>;

    return (
        <div className="payment-info-container">
            <h2>Payment Request Details</h2>
            <div className="payment-info-row">
                <span className="label">User Name:</span>
                <span>{user?.name || "-"}</span>
            </div>
            <div className="payment-info-row">
                <span className="label">Email:</span>
                <span>{user?.email || "-"}</span>
            </div>
            <div className="payment-info-row">
                <span className="label">Course:</span>
                <span>{course?.name || "-"}</span>
            </div>
            <div className="payment-info-row">
                <span className="label">Part:</span>
                <span>{partName || "-"}</span>
            </div>
            <div className="payment-info-row">
                <span className="label">Status:</span>
                <span style={{ textTransform: "capitalize" }}>{status}</span>
            </div>

            <form
                className="form"
                onSubmit={(e) => e.preventDefault()}
            >
                <div className="payment-details">
                    <div className="payment-inputs">
                        <label htmlFor="amount">Amount:</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            className="input"
                            value={formData.amount}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>


                <div className="payment-details">
                    <div className="payment-inputs">
                        <label htmlFor="startDate">Start Date:</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            className="input"
                            value={formData.startDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                </div>


                <div className="payment-details">
                    <div className="payment-inputs">
                        <label htmlFor="expiryDate">Expiry Date:</label>
                        <input
                            type="date"
                            id="expiryDate"
                            name="expiryDate"
                            className="input"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            min={formData.startDate || new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                </div>


                <div className="payment-details">
                    <div className="payment-inputs">
                        <label htmlFor="comment">Comments:</label>
                        <textarea
                            id="comment"
                            name="comment"
                            className="input"
                            rows={3}
                            value={formData.comment}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="payment-info-actions">
                    {getActionButtons()}
                </div>
            </form>

        </div>
    );
};

export default PaymentInfo;
