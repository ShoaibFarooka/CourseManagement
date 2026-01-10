import React, { useEffect, useState } from "react";
import "./Payment.css";
import paymentRequestService from "../../../services/paymentRequestService"
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import CustomModal from "../../../components/CustomModal/CustomModal";
import PaymentInfo from "./components/PaymentInfo/PaymentInfo"
import del from '../../../assets/icons/del.png';
import { message, Popconfirm } from "antd";

const Payment = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_LIMIT = 5;

    const dispatch = useDispatch();

    const fetchPaymentRequests = async (page = 1) => {
        try {
            dispatch(ShowLoading());

            const response = await paymentRequestService.getAllPaymentRequests(
                page,
                PAGE_LIMIT,
                filter
            );

            setRequests(response.requests || []);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);

        } catch (error) {
            message.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    useEffect(() => {
        fetchPaymentRequests(currentPage);
    }, [currentPage, filter]);

    const handleOpenModal = (req) => {
        setIsOpenModal(true);
        setSelectedRequest(req);
    };

    const handleCloseModal = () => {
        setIsOpenModal(false);
    };

    const handleDeletePaymentRequest = async (id) => {
        try {
            dispatch(ShowLoading());
            await paymentRequestService.deletepaymentRequest(id);
            fetchPaymentRequests(currentPage);
            message.success("Request Deleted Successfully");
        } catch (error) {
            message.error(error.response?.data?.error || "Something went Wrong!");
        } finally {
            dispatch(HideLoading());
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1 className="heading-lg" style={{ marginBottom: "20px" }}>
                Payment Requests
            </h1>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {["all", "pending", "approved", "rejected"].map(status => (
                    <button
                        key={status}
                        className={`btn ${filter === status ? "active" : ""}`}
                        onClick={() => setFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: "5%" }}>#</th>
                            <th style={{ width: "40%" }}>User</th>
                            <th style={{ width: "30%" }}>Status</th>
                            <th style={{ width: "25%", textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center" }}>
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            requests.map((req, index) => (
                                <tr key={req._id}>
                                    <td>{(currentPage - 1) * PAGE_LIMIT + index + 1}</td>
                                    <td>{req.user?.name || "-"}</td>
                                    <td style={{ textTransform: "capitalize" }}>{req.status}</td>
                                    <td>
                                        <div className="action-btn-wrapper" style={{ justifyContent: "center" }}>
                                            <button
                                                className="manage-btn"
                                                onClick={() => handleOpenModal(req)}
                                            >
                                                View
                                            </button>


                                            <Popconfirm
                                                title="Are you sure you want to Delete?"
                                                onConfirm={() => handleDeletePaymentRequest(req._id)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <button className="action-btn">
                                                    <img src={del} alt="Delete" />
                                                </button>
                                            </Popconfirm>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="btn"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(currentPage - page) <= 2
                        )
                        .reduce((acc, page, idx, arr) => {
                            if (idx > 0 && page - arr[idx - 1] > 1) {
                                acc.push("ellipsis");
                            }
                            acc.push(page);
                            return acc;
                        }, [])
                        .map((item, idx) =>
                            item === "ellipsis" ? (
                                <span key={`ellipsis-${idx}`} className="ellipsis">...</span>
                            ) : (
                                <button
                                    key={item}
                                    className={`manage-btn page-btn ${currentPage === item ? "active" : ""}`}
                                    onClick={() => setCurrentPage(item)}
                                >
                                    {item}
                                </button>
                            )
                        )}

                    <button
                        className="btn"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
            <CustomModal
                isOpen={isOpenModal}
                onRequestClose={handleCloseModal}
                contentLabel="Payment Request Info"
                width="60%"
            >
                <PaymentInfo
                    paymentRequest={selectedRequest}
                    fetchPaymentRequests={fetchPaymentRequests}
                    onClose={handleCloseModal}
                />
            </CustomModal>
        </div>
    );
};

export default Payment;
