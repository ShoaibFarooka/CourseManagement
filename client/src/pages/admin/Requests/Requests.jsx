import React, { useEffect, useState } from "react";
import requestService from "../../../services/requestService";
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import { message, Popconfirm } from "antd";

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserDevices, setSelectedUserDevices] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const dispatch = useDispatch();

    const fetchRequests = async () => {
        try {
            dispatch(ShowLoading());
            const data = await requestService.getAllRequests();
            setRequests(data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (requestId) => {
        try {
            dispatch(ShowLoading());
            await requestService.approveDeviceRequest(requestId);
            await fetchRequests();
        } catch (err) {
            console.error("Error approving request:", err);
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleReject = async (requestId) => {
        try {
            dispatch(ShowLoading());
            await requestService.rejectDeviceRequest(requestId);
            await fetchRequests();
        } catch (err) {
            console.error("Error rejecting request:", err);
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleBlockToggle = async (userId, isBlocked) => {
        try {
            dispatch(ShowLoading());

            if (isBlocked) {
                await requestService.unblockDeviceRequest(userId);
                message.success("User unblocked successfully");
            } else {
                await requestService.blockDeviceRequest(userId);
                message.success("User blocked successfully");
            }

            await fetchRequests();
        } catch (err) {
            console.error("Error toggling block:", err);
            message.error("Failed to toggle block status");
        } finally {
            dispatch(HideLoading());
        }
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

    const handleViewDevices = async (user, req) => {
        if (selectedUser && selectedUser._id === user._id) {
            setSelectedUser(null);
            setSelectedUserDevices(null);
            setSelectedRequest(null);
            return;
        }

        try {
            const devices = await requestService.getUserDevices(user._id);
            setSelectedUser(user);
            setSelectedUserDevices(devices);
            setSelectedRequest(req);
        } catch (err) {
            console.error("Error fetching devices:", err);
        }
    };

    const handleOverwriteDevice = async (targetDeviceId) => {
        if (!selectedRequest) {
            alert("No request selected to overwrite with!");
            return;
        }

        try {
            dispatch(ShowLoading());
            await requestService.overwriteDeviceRequest(selectedRequest._id, { targetDeviceId });
            alert("Device overwritten successfully.");
            await fetchRequests();
            if (selectedUser) {
                const devices = await requestService.getUserDevices(selectedUser._id);
                setSelectedUserDevices(devices);
            }
        } catch (err) {
            console.error("Error overwriting device:", err);
            alert(err.message || "Failed to overwrite device");
        } finally {
            dispatch(HideLoading());
        }
    };

    const getDeviceType = (ua) => {
        if (!ua) return "-";
        const lowerUA = ua.toLowerCase();
        if (lowerUA.includes("android") || lowerUA.includes("iphone") || lowerUA.includes("ipad")) {
            return "Mobile";
        }
        return "Desktop";
    };

    const handleRemoveDevice = async (deviceId) => {
        if (!selectedUser) return;

        try {
            dispatch(ShowLoading());
            await requestService.removeUserDevice(selectedUser._id, deviceId);
            message.success("Device removed successfully");

            const devices = await requestService.getUserDevices(selectedUser._id);
            setSelectedUserDevices(devices);
        } catch (err) {
            console.error("Error removing device:", err);
            message.error(err.message || "Failed to remove device");
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

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <button className="btn" onClick={() => setFilter("all")}>All</button>
                <button className="btn" onClick={() => setFilter("pending")}>Pending</button>
                <button className="btn" onClick={() => setFilter("approved")}>Approved</button>
                <button className="btn" onClick={() => setFilter("blocked")}>Blocked</button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>User Agent</th>
                            <th>Country</th>
                            <th>Region</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: "center" }}>
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req, index) => (
                                <tr key={req._id || index}>
                                    <td>{index + 1}</td>
                                    <td>{req.user?.name || "-"}</td>
                                    <td>{req.user?.email || "-"}</td>
                                    <td>{getDeviceType(req.deviceInfo?.userAgent)}</td>
                                    <td>{req.deviceInfo?.location?.country || "-"}</td>
                                    <td>{req.deviceInfo?.location?.region || "-"}</td>
                                    <td>{req.deviceInfo?.location?.city || "-"}</td>
                                    <td style={{ textTransform: "capitalize" }}>
                                        {req.status}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            {/* Pending Actions */}
                                            {req.status === "pending" && (
                                                <>
                                                    <button
                                                        className="btn"
                                                        onClick={() => handleApprove(req._id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn"
                                                        style={{ backgroundColor: "red", color: "#fff" }}
                                                        onClick={() => handleReject(req._id)}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {/* Block / Unblock */}
                                            <button
                                                className="btn"
                                                style={{
                                                    backgroundColor: req.user?.isBlocked ? "green" : "darkred",
                                                    color: "#fff",
                                                }}
                                                onClick={() => handleBlockToggle(req.user?._id, req.user?.isBlocked)}
                                            >
                                                {req.user?.isBlocked ? "Unblock User" : "Block User"}
                                            </button>

                                            {/* View Devices */}
                                            <button
                                                className="btn"
                                                style={{ backgroundColor: "#444", color: "#fff" }}
                                                onClick={() => handleViewDevices(req.user, req)}
                                            >
                                                {selectedUser && selectedUser._id === req.user?._id
                                                    ? "Hide Devices"
                                                    : "View Devices"}
                                            </button>

                                            {/* 🗑️ Delete Request */}
                                            <Popconfirm
                                                title="Are you sure you want to Delete?"
                                                onConfirm={() => handleDeleteRequest(req._id)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <button
                                                    className="btn"
                                                    style={{ backgroundColor: "#555", color: "#fff" }}
                                                >
                                                    Delete Request
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

            {/* Allowed Devices Table */}
            {selectedUser && selectedUserDevices && (
                <div style={{ marginTop: "20px" }}>
                    <h2 className="heading-md">
                        Allowed Devices for {selectedUser.name} ({selectedUser.email})
                    </h2>

                    {selectedUserDevices.length === 0 ? (
                        <p className="text-muted">No devices found.</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Device Type</th>
                                        <th>Country</th>
                                        <th>Region</th>
                                        <th>City</th>
                                        <th>Last Used</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedUserDevices.map((dev, idx) => (
                                        <tr key={idx}>
                                            <td>{getDeviceType(dev.userAgent)}</td>
                                            <td>{dev.location?.country || "-"}</td>
                                            <td>{dev.location?.region || "-"}</td>
                                            <td>{dev.location?.city || "-"}</td>
                                            <td>{dev.lastUsedAt ? new Date(dev.lastUsedAt).toLocaleString() : "-"}</td>
                                            <td style={{ display: "flex", gap: "6px" }}>
                                                {selectedRequest && selectedRequest.status === "pending" && (
                                                    <button
                                                        className="btn btn-warning"
                                                        onClick={() => handleOverwriteDevice(dev.deviceId)}
                                                    >
                                                        Overwrite with Request Device
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleRemoveDevice(dev.deviceId)}
                                                >
                                                    Remove Device
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Requests;
