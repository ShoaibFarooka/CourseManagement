import React, { useEffect, useState } from "react";
import './Requests.css';
import deviceRequestService from "../../../services/deviceRequestService";
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { message } from "antd";
import CustomModal from "../../../components/CustomModal/CustomModal";
import RequestInfo from "./components/RequestInfo/RequestInfo";

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const PAGE_LIMIT = 5;

    const dispatch = useDispatch();

    const fetchRequests = async (page = 1) => {
        try {
            dispatch(ShowLoading());

            const response = await deviceRequestService.getAllDevicesRequests(
                page,
                PAGE_LIMIT,
                filter,
                search
            );
            setRequests(response.requests || []);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);

        } catch (error) {
            message.error(error?.response?.data?.error || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage, filter, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleOpenModal = (req) => {
        setIsOpenModal(true);
        setSelectedUser(req.user);
        setSelectedRequest(req);
    };

    const handleCloseModal = () => {
        setIsOpenModal(false);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1 className="heading-lg" style={{ marginBottom: "20px" }}>
                Device Requests
            </h1>

            <div style={{ marginBottom: "20px", width: "130px" }}>
                <select
                    className="global-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className=".input"
                />
            </div>


            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: "10%" }}>#</th>
                            <th style={{ width: "20%" }}>User Name</th>
                            <th style={{ width: "30%" }}>Email</th>
                            <th style={{ width: "20%" }}> Req Status</th>
                            <th style={{ width: "20%", textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            requests.map((req, index) => (
                                <tr key={req._id || index}>
                                    <td>{(currentPage - 1) * PAGE_LIMIT + index + 1}</td>
                                    <td>{req.user?.name || "-"}</td>
                                    <td>{req.user?.email || "-"}</td>
                                    <td style={{ textTransform: "capitalize" }}>{req.status}</td>
                                    <td>
                                        <div className="action-btn-wrapper" style={{ justifyContent: "center" }}>
                                            <button
                                                className="manage-btn"
                                                onClick={() => handleOpenModal(req)}
                                            >
                                                View
                                            </button>
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
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        .map((item, idx) => {
                            if (item === "ellipsis") {
                                return (
                                    <span key={`ellipsis-${idx}`} className="ellipsis">...</span>
                                );
                            }

                            return (
                                <button
                                    key={item}
                                    className={`manage-btn page-btn ${currentPage === item ? "active" : ""}`}
                                    onClick={() => setCurrentPage(item)}
                                >
                                    {item}
                                </button>
                            );
                        })}

                    <button
                        className="btn"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <CustomModal
                isOpen={isOpenModal}
                onRequestClose={handleCloseModal}
                contentLabel="Request Info"
            >
                <RequestInfo
                    user={selectedUser}
                    request={selectedRequest}
                    fetchRequests={() => fetchRequests(currentPage)}
                />
            </CustomModal>
        </div>
    );
};

export default Requests;