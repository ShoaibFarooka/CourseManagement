import React, { useEffect, useState } from "react";
import { message, Popconfirm } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import paymentRequestService from "../../../../../services/paymentRequestService";
import CustomModal from "../../../../../components/CustomModal/CustomModal";
import PaymentForm from "./components/PaymentForm";
import edit from "../../../../../assets/icons/edit.png";
import "./PaymentTable.css";
import { MdOutlineFreeCancellation } from "react-icons/md"
import { MdCancel } from "react-icons/md"

const PaymentTable = ({ payments = [], fetchUsers }) => {
    const dispatch = useDispatch();
    const [localPayments, setLocalPayments] = useState(payments);
    const [selectedPartByCourse, setSelectedPartByCourse] = useState({});
    const [editingPayment, setEditingPayment] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        setLocalPayments(payments);
    }, [payments]);

    if (!localPayments.length)
        return <div className="table-container">No Payments Found!</div>;

    // Group payments by course so each course gets one row with a part dropdown
    const groupedByCourse = localPayments.reduce((acc, payment) => {
        const courseId = payment.course?._id || "unknown";
        if (!acc[courseId]) {
            acc[courseId] = { course: payment.course, payments: [] };
        }
        acc[courseId].payments.push(payment);
        return acc;
    }, {});

    const courseGroups = Object.values(groupedByCourse);

    const getSelectedPayment = (courseId, coursePayments) => {
        const selectedId = selectedPartByCourse[courseId] || coursePayments[0]?._id;
        return coursePayments.find(p => p._id === selectedId) || coursePayments[0];
    };

    const handlePartChange = (courseId, paymentId) => {
        setSelectedPartByCourse(prev => ({ ...prev, [courseId]: paymentId }));
    };

    const handleEditClick = (payment) => {
        setEditingPayment(payment);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPayment(null);
    };

    const handlePaymentUpdated = async (updatedPayment) => {
        setLocalPayments(prev =>
            prev.map(p => (p._id === updatedPayment._id ? { ...p, ...updatedPayment } : p))
        );
        await fetchUsers?.();
    };

    const handleToggleCancel = async (payment) => {
        try {
            dispatch(ShowLoading());
            if (payment.isCancelled) {
                await paymentRequestService.uncancelPaymentRequest(payment._id);
                message.success("Payment reinstated successfully");
            } else {
                await paymentRequestService.cancelPaymentRequest(payment._id);
                message.success("Payment cancelled successfully");
            }
            setLocalPayments(prev =>
                prev.map(p =>
                    p._id === payment._id ? { ...p, isCancelled: !payment.isCancelled } : p
                )
            );
            await fetchUsers?.();
        } catch (error) {
            message.error(error?.response?.data?.message || "Failed to update payment status");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className="table-container">
            <table className="table table-striped payments-table">
                <thead>
                    <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "17%" }}>Course</th>
                        <th style={{ width: "13%" }}>Part</th>
                        <th style={{ width: "10%" }}>Amount</th>
                        <th style={{ width: "13%" }}>Start Date</th>
                        <th style={{ width: "13%" }}>Expiry Date</th>
                        <th style={{ width: "10%" }}>Status</th>
                        <th style={{ width: "19%", textAlign: "center" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courseGroups.map((group, index) => {
                        const courseId = group.course?._id || `unknown-${index}`;
                        const selectedPayment = getSelectedPayment(courseId, group.payments);
                        const isCancelled = !!selectedPayment.isCancelled;

                        return (
                            <tr key={courseId}>
                                <td>{index + 1}</td>
                                <td>{group.course?.name || "Unknown Course"}</td>
                                <td>
                                    <select
                                        className="payment-part-select"
                                        value={selectedPayment._id}
                                        onChange={(e) => handlePartChange(courseId, e.target.value)}
                                    >
                                        {group.payments.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.part?.name || "Unknown Part"}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>{selectedPayment.amount}</td>
                                <td>
                                    {selectedPayment.startDate
                                        ? new Date(selectedPayment.startDate).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td>
                                    {selectedPayment.expiryDate
                                        ? new Date(selectedPayment.expiryDate).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td>
                                    {isCancelled ? (
                                        <span className="status blocked">Cancelled</span>
                                    ) : (
                                        <span className="status active">Active</span>
                                    )}
                                </td>
                                <td>
                                    <div
                                        className="action-btn-wrapper"
                                        style={{ display: "flex", justifyContent: "center", gap: "10px" }}
                                    >
                                        <button
                                            className="action-btn"
                                            onClick={() => handleEditClick(selectedPayment)}
                                            disabled={isCancelled}
                                            title={isCancelled ? "Cancelled payments can't be edited" : "Edit"}
                                        >
                                            <img src={edit} alt="Edit" />
                                        </button>

                                        <Popconfirm
                                            title={
                                                isCancelled
                                                    ? "Reinstate this payment?"
                                                    : "Cancel this payment?"
                                            }
                                            onConfirm={() => handleToggleCancel(selectedPayment)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <button className="action-btn">
                                                {isCancelled ? (
                                                    <MdOutlineFreeCancellation className="action-btn-icon reinstate" />
                                                ) : (
                                                    <MdCancel className="action-btn-icon cancel" />
                                                )}
                                            </button>
                                        </Popconfirm>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <CustomModal
                isOpen={isFormOpen}
                onRequestClose={handleCloseForm}
                contentLabel="Edit Payment"
                width="50%"
            >
                <PaymentForm
                    payment={editingPayment}
                    onClose={handleCloseForm}
                    onUpdated={handlePaymentUpdated}
                />
            </CustomModal>
        </div>
    );
};

export default PaymentTable;