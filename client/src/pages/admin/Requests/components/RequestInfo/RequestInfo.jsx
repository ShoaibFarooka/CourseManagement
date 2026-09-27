import React, { useEffect, useState } from "react";
import "./RequestInfo.css";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import deviceRequestService from "../../../../../services/deviceRequestService";

const RequestInfo = ({ user, request, fetchRequests }) => {
    const dispatch = useDispatch();

    const [currentUser, setCurrentUser] = useState(user);
    const [currentRequest, setCurrentRequest] = useState(request);

    useEffect(() => {
        setCurrentUser(user);
        setCurrentRequest(request);
    }, [user, request]);

    if (!currentUser || !currentRequest) return null;

    const getDeviceType = (ua) => {
        if (!ua) return "-";
        const lowerUA = ua.toLowerCase();
        if (lowerUA.includes("android") || lowerUA.includes("iphone") || lowerUA.includes("ipad"))
            return "Mobile";
        return "Desktop";
    };

    const refreshRequestState = async () => {
        try {
            const updatedRequests = await fetchRequests();
            if (!updatedRequests) return;

            const updatedReq = updatedRequests.find(r => r._id === currentRequest._id);
            if (updatedReq) {
                setCurrentRequest(updatedReq);
                setCurrentUser(prev => ({
                    ...updatedReq.user,
                    allowedDevices: updatedReq.user.allowedDevices || [],
                }));
            }
        } catch (err) {
            console.log("Failed to refresh request state", err);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            dispatch(ShowLoading());
            await deviceRequestService.approveDeviceRequest(requestId);
            message.success("Request approved successfully");
            setCurrentRequest(prev => ({ ...prev, status: "approved" }));
            await refreshRequestState();
        } catch (err) {
            message.error("Failed to approve request");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleReject = async (requestId) => {
        try {
            dispatch(ShowLoading());
            await deviceRequestService.rejectDeviceRequest(requestId);
            message.success("Request rejected successfully");
            setCurrentRequest(prev => ({ ...prev, status: "rejected" }));
            await refreshRequestState();
        } catch (err) {
            message.error("Failed to reject request");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className="request-info">
            <div className="heading-lg">User Information</div>
            <div className="heading-sm section">
                <div>
                    <span className="label">User Name:</span> {currentUser.name || "-"}
                </div>
                <div>
                    <span className="label">Email:</span> {currentUser.email || "-"}
                </div>
                <div>
                    <span className="label">Account Status:</span>{" "}
                    {currentUser.isBlocked ? (
                        <span className="blocked">Blocked</span>
                    ) : (
                        <span className="active">Active</span>
                    )}
                </div>
            </div>

            <div className="action-buttons">
                {(currentRequest.status === "pending" || currentRequest.status === "revoked") && (
                    <>
                        <button className="btn" onClick={() => handleApprove(currentRequest._id)}>
                            Approve
                        </button>
                        <button className="btn" onClick={() => handleReject(currentRequest._id)}>
                            Reject
                        </button>
                    </>
                )}
            </div>

            <hr />

            <div className="heading-lg">Device Information</div>
            <div className="heading-sm section">
                <div>
                    <span className="label">Visitor ID:</span> {currentRequest.deviceInfo?.visitorId || "-"}
                </div>
                <div>
                    <span className="label">Device Type:</span> {getDeviceType(currentRequest.deviceInfo?.userAgent)}
                </div>
                <div>
                    <span className="label">Location:</span>{" "}
                    {`${currentRequest.deviceInfo?.location?.city || "-"}, ${currentRequest.deviceInfo?.location?.region || "-"}, ${currentRequest.deviceInfo?.location?.country || "-"}`}
                </div>
                <div>
                    <span className="label">Request Status:</span> {currentRequest.status}
                </div>
            </div>
        </div>
    );
};

export default RequestInfo;