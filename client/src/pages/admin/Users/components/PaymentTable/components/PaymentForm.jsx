import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../../redux/loaderSlice";
import paymentRequestService from "../../../../../../services/paymentRequestService";
import "./PaymentForm.css";

const toDateInputValue = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
};

const PaymentForm = ({ payment, onClose, onUpdated }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        amount: "",
        startDate: "",
        expiryDate: "",
        comment: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!payment) return;
        setFormData({
            amount: payment.amount ?? "",
            startDate: toDateInputValue(payment.startDate),
            expiryDate: toDateInputValue(payment.expiryDate),
            comment: payment.comment || "",
        });
        setErrors({});
    }, [payment]);

    if (!payment) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = ({ amount, startDate, expiryDate }) => {
        const errs = {};
        if (!amount || Number(amount) <= 0) {
            errs.amount = "Amount is required and must be greater than zero";
        }
        if (!startDate) errs.startDate = "Start date is required";
        if (!expiryDate) errs.expiryDate = "Expiry date is required";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            dispatch(ShowLoading());
            await paymentRequestService.updatePaymentRequest(payment._id, formData);
            message.success("Payment updated successfully");
            onUpdated?.({
                ...payment,
                ...formData,
                amount: Number(formData.amount),
            });
            onClose?.();
        } catch (error) {
            message.error(error?.response?.data?.message || "Failed to update payment");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className="paymentForm-conteiner">
            <div className="title">Edit Payment</div>

            <div className="payment-form-row">
                <span className="label">Course:</span>
                <span className="value">{payment.course?.name || "-"}</span>
            </div>
            <div className="payment-form-row">
                <span className="label">Part:</span>
                <span className="value">{payment.part?.name || "-"}</span>
            </div>

            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        className="input"
                        value={formData.amount}
                        onChange={handleChange}
                    />
                    {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>

                <div className="field">
                    <label htmlFor="startDate">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        className="input"
                        value={formData.startDate}
                        onChange={handleChange}
                        max={formData.expiryDate || undefined}
                    />
                    {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                </div>

                <div className="field">
                    <label htmlFor="expiryDate">Expiry Date:</label>
                    <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        className="input"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        min={formData.startDate || undefined}
                    />
                    {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                </div>

                <div className="field">
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

                <div className="form-actions">
                    <button type="submit" className="btn save">Save</button>
                    <button type="button" className="btn cancel" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;