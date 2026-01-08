import React, { useEffect, useState } from "react";
import "./RequestInfo.css";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import deviceRequestService from "../../../../../services/deviceRequestService";
import DeviceInfo from "../DeviceInfo/DeviceInfo";

const RequestInfo = ({ user, request, fetchRequests }) => {
    const dispatch = useDispatch();
    const [showDevices, setShowDevices] = useState(false);
    const [overwriteMode, setOverwriteMode] = useState(false);

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

    const handleApprove = async (requestId) => {
        try {
            dispatch(ShowLoading());
            await deviceRequestService.approveDeviceRequest(requestId);
            message.success("Request approved successfully");
            await refreshRequestState();
        } catch (err) {
            console.error("Error approving request:", err);
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
            await refreshRequestState();
        } catch (err) {
            console.error("Error rejecting request:", err);
            message.error("Failed to reject request");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleBlockToggle = async (userId, isBlocked) => {
        try {
            dispatch(ShowLoading());
            if (isBlocked) {
                await deviceRequestService.unblockDeviceRequest(userId);
                message.success("User unblocked successfully");
            } else {
                await deviceRequestService.blockDeviceRequest(userId);
                message.success("User blocked successfully");
            }
            await refreshRequestState();
        } catch (err) {
            console.error("Error toggling block:", err);
            message.error("Failed to change block status");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleOverwriteDevice = async (targetDeviceId) => {
        try {
            dispatch(ShowLoading());
            await deviceRequestService.overwriteDeviceRequest(currentRequest._id, { targetDeviceId });
            message.success("Device overwritten successfully");
            await refreshRequestState();
        } catch (err) {
            console.error("Error overwriting device:", err);
            message.error("Failed to overwrite device");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleRemoveDevice = async (deviceId) => {
        try {
            dispatch(ShowLoading());
            await deviceRequestService.removeUserDevice(currentUser._id, deviceId);
            message.success("Device removed successfully");
            setShowDevices(false);
            await refreshRequestState();
        } catch (err) {
            console.error("Error removing device:", err);
            message.error(err.message || "Failed to remove device");
        } finally {
            dispatch(HideLoading());
        }
    };

    const refreshRequestState = async () => {
        const updatedRequests = await fetchRequests();
        if (!updatedRequests) return;

        const updatedReq = updatedRequests.find((r) => r._id === currentRequest._id);
        if (updatedReq) {
            setCurrentRequest(updatedReq);
            setCurrentUser(updatedReq.user);
        }
    };

    const toggleViewDevices = () => {
        setShowDevices((prev) => !prev);
        setOverwriteMode(false);
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
                        {(!currentUser.allowedDevices || currentUser.allowedDevices.length === 0) ? (
                            <button className="btn" onClick={() => handleApprove(currentRequest._id)}>
                                Approve
                            </button>
                        ) : (
                            <>
                                <button className="btn" onClick={() => handleApprove(currentRequest._id)}>
                                    Add New Device
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        setShowDevices(true);
                                        setOverwriteMode(true);
                                    }}
                                >
                                    Overwrite Existing Device
                                </button>
                            </>
                        )}
                        <button className="btn" onClick={() => handleReject(currentRequest._id)}>
                            Reject
                        </button>
                    </>
                )}

                {!currentUser.isBlocked ? (
                    <button className="btn" onClick={() => handleBlockToggle(currentUser._id, false)}>
                        Block User
                    </button>
                ) : (
                    <button className="btn" onClick={() => handleBlockToggle(currentUser._id, true)}>
                        Unblock User
                    </button>
                )}

                {Array.isArray(currentUser.allowedDevices) && currentUser.allowedDevices.length > 0 && (
                    <button className="btn" onClick={toggleViewDevices}>
                        {showDevices ? "Hide Devices" : "View Devices"}
                    </button>
                )}
            </div>

            <hr />

            <div className="heading-lg">Device Information</div>
            <div className="heading-sm section">
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

            {showDevices && (
                <DeviceInfo
                    user={currentUser}
                    overwriteMode={overwriteMode}
                    handleRemoveDevice={handleRemoveDevice}
                    handleOverwriteDevice={handleOverwriteDevice}
                    getDeviceType={getDeviceType}
                />
            )}
        </div>
    );
};

export default RequestInfo;
