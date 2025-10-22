import React, { useEffect, useState } from "react";
import requestService from "../../../services/requestService";
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { message, Popconfirm } from "antd";
import del from "../../../assets/icons/del.png";
import CustomModal from "../../../components/CustomModal/CustomModal";
import RequestInfo from "./components/RequestInfo/RequestInfo";

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const dispatch = useDispatch();

    const fetchRequests = async () => {
        try {
            dispatch(ShowLoading());
            const data = await requestService.getAllRequests();
            setRequests(data);
            return data;
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleOpenModal = (req) => {
        setIsOpenModal(true);
        setSelectedUser(req.user);
        setSelectedRequest(req);
    };

    const handleCloseModal = () => {
        setIsOpenModal(false);
    };

    const handleDeleteRequest = async (requestId) => {
        try {
            dispatch(ShowLoading());
            await requestService.deleteDeviceRequest(requestId);
            await fetchRequests();
            message.success("Request deleted successfully");
        } catch (err) {
            console.error("Error deleting request:", err);
            message.error("Failed to delete request");
        } finally {
            dispatch(HideLoading());
        }
    };

    const filteredRequests =
        filter === "blocked"
            ? requests.filter((req) => req.user?.isBlocked)
            : requests.filter(
                (req) =>
                    !req.user?.isBlocked &&
                    (filter === "all" || req.status === filter)
            );

    return (
        <div style={{ padding: "20px" }}>
            <h1 className="heading-lg" style={{ marginBottom: "20px" }}>
                Device Requests
            </h1>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                    className="btn"
                    onClick={() => setFilter("pending")}
                >
                    Pending
                </button>
                <button
                    className="btn"
                    onClick={() => setFilter("approved")}
                >
                    Approved
                </button>
                <button
                    className="btn"
                    onClick={() => setFilter("rejected")}
                >
                    Rejected
                </button>
                <button
                    className="btn"
                    onClick={() => setFilter("blocked")}
                >
                    Blocked
                </button>
                <button
                    className="btn"
                    onClick={() => setFilter("all")}
                >
                    All
                </button>
            </div>

            <div className="table-container" >
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: "5%" }}>#</th>
                            <th style={{ width: "20%" }}>User Name</th>
                            <th style={{ width: "25%" }}>Email</th>
                            <th style={{ width: "15%" }}>Payment Status</th>
                            <th style={{ width: "15%" }}> Req Status</th>
                            <th style={{ width: "15%", textAlign: "center" }}>Actions</th>

                        </tr>
                    </thead>

                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req, index) => (
                                <tr key={req._id || index}>
                                    <td>{index + 1}</td>
                                    <td>{req.user?.name || "-"}</td>
                                    <td>{req.user?.email || "-"}</td>
                                    <td>{
                                        req.user?.paymentStatus === true
                                            ? "Paid"
                                            : req.user?.paymentStatus === false
                                                ? "Unpaid"
                                                : "-"
                                    }</td>
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
                                                onConfirm={() => handleDeleteRequest(req._id)}
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

            <CustomModal
                isOpen={isOpenModal}
                onRequestClose={handleCloseModal}
                contentLabel="Request Info"
            >
                <RequestInfo user={selectedUser} request={selectedRequest} fetchRequests={fetchRequests} />
            </CustomModal>
        </div>
    );
};

export default Requests;
