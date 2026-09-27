import React, { useEffect, useState } from "react";
import { message, Popconfirm } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import deviceRequestService from "../../../../../services/deviceRequestService";
import del from "../../../../../assets/icons/del.png";
import "./DevicesTable.css";

const DevicesTable = ({ devices = [], userId, fetchUsers }) => {
    const dispatch = useDispatch();
    const [localDevices, setLocalDevices] = useState(devices);

    useEffect(() => {
        setLocalDevices(devices);
    }, [devices]);

    const handleDeleteDevice = async (deviceId) => {
        try {
            dispatch(ShowLoading());
            await deviceRequestService.removeUserDevice(userId, deviceId);
            message.success("Device removed successfully");
            setLocalDevices(prev => prev.filter(d => d.deviceId !== deviceId));
            await fetchUsers?.();
        } catch (error) {
            message.error(error?.response?.data?.message || error?.message || "Failed to remove device");
        } finally {
            dispatch(HideLoading());
        }
    };

    if (!localDevices.length)
        return <div className="table-container">No Devices Found!</div>;

    return (
        <div className="table-container">
            <table className="table table-striped devices-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Device ID</th>
                        <th>User Agent</th>
                        <th>Country</th>
                        <th>Region</th>
                        <th>City</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {localDevices.map((device, index) => (
                        <tr key={device.deviceId || index}>
                            <td>{index + 1}</td>
                            <td>{device.deviceId}</td>
                            <td>{device.userAgent}</td>
                            <td>{device.location?.country}</td>
                            <td>{device.location?.region}</td>
                            <td>{device.location?.city}</td>
                            <td
                            >
                                <div className="action-btn-wrapper"
                                    style={{ display: "flex", justifyContent: "center" }}
                                >
                                    <Popconfirm
                                        title="Are you sure you want to remove this device?"
                                        onConfirm={() => handleDeleteDevice(device.deviceId)}
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
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DevicesTable;