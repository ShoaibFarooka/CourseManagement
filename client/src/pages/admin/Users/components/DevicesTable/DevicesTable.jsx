import React from "react";
import "./DevicesTable.css";

const DevicesTable = ({ devices = [] }) => {
    if (!devices.length)
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
                    </tr>
                </thead>
                <tbody>
                    {devices.map((device, index) => (
                        <tr key={device.deviceId || index}>
                            <td>{index + 1}</td>
                            <td>{device.deviceId}</td>
                            <td>{device.userAgent}</td>
                            <td>{device.location?.country}</td>
                            <td>{device.location?.region}</td>
                            <td>{device.location?.city}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DevicesTable;