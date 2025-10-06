import React, { useEffect, useState } from "react";
import requestService from '../../../services/requestService'

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await requestService.getAllRequests();
            setRequests(data);
            setError("");
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (requestId) => {
        try {
            await requestService.approveDeviceRequest(requestId);
            fetchRequests();
        } catch (err) {
            console.error("Error approving request:", err);
        }
    };

    const handleReject = async (requestId) => {
        try {
            await requestService.rejectDeviceRequest(requestId);
            fetchRequests();
        } catch (err) {
            console.error("Error rejecting request:", err);
        }
    };

    if (loading) return <div>Loading requests...</div>;
    if (error) return <div className="error-text">{error}</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h1 className="heading-lg" style={{ marginBottom: "20px" }}>Device Requests</h1>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Visitor ID</th>
                            <th>User Agent</th>
                            <th>Country</th>
                            <th>Region</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center" }}>
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            requests.map((req, index) => (
                                <tr key={req._id || index}>
                                    <td>{index + 1}</td>
                                    <td>{req.visitorId}</td>
                                    <td style={{ maxWidth: "200px", wordBreak: "break-word" }}>{req.userAgent}</td>
                                    <td>{req.country}</td>
                                    <td>{req.region}</td>
                                    <td>{req.city}</td>
                                    <td style={{ textTransform: "capitalize" }}>{req.status}</td>
                                    <td>
                                        {req.status === "pending" ? (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button className="btn" onClick={() => handleApprove(req._id)}>Approve</button>
                                                <button
                                                    className="btn"
                                                    style={{ backgroundColor: "red", color: "#fff" }}
                                                    onClick={() => handleReject(req._id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ textTransform: "capitalize" }}>{req.status}</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Requests;
