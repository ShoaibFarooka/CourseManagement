import { useEffect, useState } from "react";
import { message, Popconfirm } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import deviceRequestService from "../../../../../services/deviceRequestService";
import { MdSync } from "react-icons/md";
import del from "../../../../../assets/icons/del.png";

const DeviceInfo = ({
    user,
    overwriteMode,
    handleRemoveDevice,
    handleOverwriteDevice,
    getDeviceType,
}) => {
    const dispatch = useDispatch();
    const [devices, setDevices] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getAllUserDevices = async (userId) => {
        try {
            dispatch(ShowLoading());
            const response = await deviceRequestService.fetchUserDevicesById(userId);
            setDevices(response?.devices.devices || []);
        } catch (err) {
            console.error("Error fetching devices:", err);
            message.error(err.message || "Failed to fetch devices");
        } finally {
            dispatch(HideLoading());
        }
    };

    const refreshDevices = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        await getAllUserDevices(user._id);
        setIsRefreshing(false);
    };

    const handleRemoveClick = async (deviceId) => {
        await handleRemoveDevice(deviceId);
        await refreshDevices();
    };

    const handleOverwriteClick = async (deviceId) => {
        await handleOverwriteDevice(deviceId);
        await refreshDevices();
    };

    useEffect(() => {
        if (user?._id) {
            getAllUserDevices(user._id);
        }
    }, [user]);

    if (!devices.length) {
        return <p style={{ marginTop: "10px" }}>No registered devices found.</p>;
    }

    return (
        <div style={{ marginTop: "20px" }}>
            <div className="heading-lg" style={{ marginBottom: "10px" }}>
                Registered Devices
            </div>

            <div className="table-container">
                <table className="table" style={{ width: "100%", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "60%" }}>Device Info</th>
                            <th style={{ width: "40%", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((device, index) => (
                            <tr key={device.deviceId || index}>
                                <td>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span>
                                            <strong>Type:</strong> {getDeviceType(device.userAgent)}
                                        </span>
                                        <span>
                                            <strong>Device ID:</strong> {device.deviceId || "-"}
                                        </span>
                                        <span>
                                            <strong>Location:</strong>{" "}
                                            {`${device.location?.city || "-"}, ${device.location?.region || "-"}, ${device.location?.country || "-"}`}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div
                                        className="action-btn-wrapper"
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "10px",
                                        }}
                                    >
                                        <Popconfirm
                                            title="Are you sure you want to Delete?"
                                            onConfirm={() => handleRemoveClick(device.deviceId)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <button
                                                className="action-btn"
                                                disabled={isRefreshing}
                                            >
                                                <img src={del} alt="Delete" />
                                            </button>
                                        </Popconfirm>

                                        {overwriteMode && (
                                            <button
                                                className="action-btn"
                                                onClick={() => handleOverwriteClick(device.deviceId)}
                                                disabled={isRefreshing}
                                            >
                                                <MdSync />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeviceInfo;
