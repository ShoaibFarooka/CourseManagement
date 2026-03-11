import React from "react";
import "./PaymentTable.css";

const PaymentTable = ({ payments = [] }) => {
    if (!payments.length)
        return <div className="table-container">No Payments Found!</div>;

    return (
        <div className="table-container">
            <table className="table table-striped payments-table">
                <thead>
                    <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "30%" }}>Course</th>
                        <th style={{ width: "20%" }}>Part</th>
                        <th style={{ width: "20%" }}>Amount</th>
                        <th style={{ width: "20%" }}>Start Date</th>
                        <th style={{ width: "20%" }}>Expiry Date</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment, index) => (
                        <tr key={payment._id || index}>
                            <td>{index + 1}</td>
                            <td>{payment.course?.name || "Unknown Course"}</td>
                            <td>{payment.part?.name || "Unknown Part"}</td>
                            <td>{payment.amount}</td>
                            <td>{new Date(payment.startDate).toLocaleDateString()}</td>
                            <td>{new Date(payment.expiryDate).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentTable;