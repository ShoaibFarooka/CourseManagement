import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import arrow from '../../../../../assets/icons/arrow.png';
import profile from '../../../../../assets/images/profile.jpg';
import CustomModal from '../../../../../components/CustomModal/CustomModal';
import DeviceVerification from "../DeviceVerification/DeviceVerification";
import { ShowLoading, HideLoading } from '../../../../../redux/loaderSlice';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import deviceRequestService from '../../../../../services/deviceRequestService';
import paymentRequestService from '../../../../../services/paymentRequestService';
import { getBasicDeviceInfo } from '../../../../../utilis/deviceInfoUtils';


const Dashboard = ({ allCourses }) => {

    const [selectedParts, setSelectedParts] = useState({});
    const [isOpenDeviceRequestModal, setIsOpenDeviceRequestModal] = useState(false);

    const dispatch = useDispatch();
    const { currentDeviceStatus } = useSelector(state => state.user);

    useEffect(() => {
        const initialSelection = {};
        allCourses.forEach(course => {
            if (course.parts.length > 0) {
                initialSelection[course.id] = course.parts[0].id;
            }
        });
        setSelectedParts(initialSelection);
    }, [allCourses])


    const getDaysLeft = (startDate, expiryDate) => {
        if (!expiryDate || !startDate) return null;
        const today = new Date();
        const end = new Date(expiryDate);
        const start = new Date(startDate);

        if (today < start) {
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }

        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getExpiryPercentage = (startDate, expiryDate) => {
        if (!expiryDate || !startDate) return 0;

        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(expiryDate);

        const totalDays = (end - start) / (1000 * 60 * 60 * 24);

        if (today < start) return 0;
        if (today >= end) return 100;

        const elapsedDays = (today - start) / (1000 * 60 * 60 * 24);

        return Math.round((elapsedDays / totalDays) * 100);
    };

    const getExpiryColor = (daysLeft, startDate, expiryDate) => {
        if (!expiryDate || !startDate) return "inactive";
        if (daysLeft === 0) return "red";
        if (daysLeft < 5) return "red";
        if (daysLeft < 10) return "yellow";
        return "green";
    };



    const handleCloseDeviceRequestModal = () => {
        setIsOpenDeviceRequestModal(false);
    }

    const handleDeviceRequestAccess = async () => {
        try {
            dispatch(ShowLoading());
            const deviceInfo = await getBasicDeviceInfo();
            const res = await deviceRequestService.createDeviceRequest(deviceInfo);

            if (res.alreadyAllowed) {
                message.info("This device is already allowed.");
                return;
            }

            if (res.alreadyRequested) {
                message.info("Your device request is already pending approval.");
                return;
            }

            message.success(res.message || "Device request submitted successfully.");

        } catch (err) {
            message.error(
                err?.response?.data?.message || "Something went wrong"
            );
        } finally {
            dispatch(HideLoading());
            setIsOpenDeviceRequestModal(true);
        }
    };

    const handlePaymentRequest = async (courseId, partId) => {
        try {
            dispatch(ShowLoading());

            const res = await paymentRequestService.createPaymentRequest(courseId, partId);

            message.success(res?.data?.message || "Payment Request Submitted Successfully!");
        } catch (error) {
            if (error?.response?.status === 409) {
                message.warning(error.response.data.message || "You already have a pending request for this course and part.");
            } else {
                message.error(error?.response?.data?.message || "Something went wrong");
            }
        } finally {
            dispatch(HideLoading());
        }
    };

    const { purchasedCourses } = useSelector(state => state.user);
    const getPurchasedInfo = (courseId, partId) => {
        return purchasedCourses.find(pc =>
            String(pc.courseId) === String(courseId) &&
            String(pc.partId) === String(partId)
        );
    };



    return (
        <div className="dashboard-container">
            <div className="profile-circle">
                <img
                    src={profile}
                    alt="User"
                    className="profile-image"
                />
            </div>
            <div className="device-request">
                {currentDeviceStatus === true ? (
                    <span className="verified">Device Verified</span>
                ) : (
                    <button className="request-btn" onClick={handleDeviceRequestAccess}>
                        Device Verification
                    </button>
                )}
            </div>

            <CustomModal
                isOpen={isOpenDeviceRequestModal}
                onRequestClose={handleCloseDeviceRequestModal}
                contentLabel='Device Verification'
                width="60%"
            >
                <DeviceVerification />
            </CustomModal>

            <div className="table-header">
                <span className="header">Course <img src={arrow} alt="arrow" /></span>
                <span className="header">Parts <img src={arrow} alt="arrow" /></span>
                <span className="header">Status <img src={arrow} alt="arrow" /></span>
                <span className="header">Expiry <img src={arrow} alt="arrow" /></span>
                <span className="header">Action <img src={arrow} alt="arrow" /></span>
            </div>

            <div className="table-body">
                {allCourses.map(course => {
                    const selectedPartId = selectedParts[course.id] || (course.parts[0]?.id || "");
                    const purchased = getPurchasedInfo(course.id, selectedPartId);

                    const startDate = purchased?.startDate;
                    const expiryDate = purchased?.expiryDate;

                    const daysLeft = purchased ? getDaysLeft(startDate, expiryDate) : null;
                    const percentage = purchased ? getExpiryPercentage(startDate, expiryDate) : 0;
                    const color = purchased ? getExpiryColor(daysLeft, startDate, expiryDate) : "inactive";

                    const actionText = !purchased
                        ? "Request Access"
                        : daysLeft === 0
                            ? "Renew Access"
                            : "-";

                    const statusText = !purchased
                        ? "Available"
                        : daysLeft > 0
                            ? "Active"
                            : "Expired";

                    return (
                        <div key={course.id + selectedPartId} className="table-row">
                            <div className="table-cell course-name">{course.name}</div>

                            <div className="table-cell parts">
                                <select
                                    className="parts-select"
                                    value={selectedPartId || ""}
                                    onChange={e =>
                                        setSelectedParts({
                                            ...selectedParts,
                                            [course.id]: e.target.value
                                        })
                                    }
                                >
                                    {course.parts.map(partOption => (
                                        <option key={partOption.id} value={partOption.id}>
                                            {partOption.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={`table-cell status ${daysLeft > 0 ? "active" : "inactive"}`}>
                                {statusText}
                            </div>

                            <div className="table-cell expiry">
                                <div className="topic-progress">
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${color}`}
                                            style={{ width: `${Number(percentage)}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">
                                        {daysLeft !== null
                                            ? daysLeft > 0
                                                ? `${daysLeft} days left`
                                                : "Expired"
                                            : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="table-cell actions">
                                {actionText !== "-" ? (
                                    <button
                                        className="access-btn"
                                        onClick={() =>
                                            handlePaymentRequest(course.id, selectedPartId)
                                        }
                                    >
                                        {actionText}
                                    </button>
                                ) : (
                                    <div className="access-granted">-</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default Dashboard;
