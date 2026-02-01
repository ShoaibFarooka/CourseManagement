import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import arrow from "../../../assets/icons/arrow.png";
import profile from "../../../assets/images/profile.jpg";
import CustomModal from "../../../components/CustomModal/CustomModal";
import DeviceVerification from "./components/DeviceVerification/DeviceVerification";
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import deviceRequestService from "../../../services/deviceRequestService";
import paymentRequestService from "../../../services/paymentRequestService";
import courseService from "../../../services/courseService";
import { getBasicDeviceInfo } from "../../../utilis/deviceInfoUtils";

const Dashboard = () => {
    const dispatch = useDispatch();

    const { currentDeviceStatus, purchasedCourses, user } = useSelector(
        state => state.user
    );
    const baseURL = import.meta.env.VITE_BASE_URL;
    const [allCourses, setAllCourses] = useState([]);
    const [selectedParts, setSelectedParts] = useState({});
    const [isOpenDeviceRequestModal, setIsOpenDeviceRequestModal] = useState(false);

    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        const initialSelection = {};
        allCourses.forEach(course => {
            if (course.parts.length > 0) {
                initialSelection[course.id] = course.parts[0].id;
            }
        });
        setSelectedParts(initialSelection);
    }, [allCourses]);

    const fetchAllCourses = async () => {
        try {
            dispatch(ShowLoading());

            const res = await courseService.fetchAllCoursesWithParts();
            const groupedCourses = {};

            res.courses.forEach(item => {
                if (!groupedCourses[item.courseId]) {
                    groupedCourses[item.courseId] = {
                        id: item.courseId,
                        name: item.courseName,
                        parts: []
                    };
                }

                const exists = groupedCourses[item.courseId].parts.find(
                    part => part.id === item.partId
                );

                if (!exists) {
                    groupedCourses[item.courseId].parts.push({
                        id: item.partId,
                        name: item.partName,
                        publishers: item.publishers || []
                    });
                }
            });

            setAllCourses(Object.values(groupedCourses));
        } catch (error) {
            message.error(
                error?.response?.data?.message || "Something went wrong"
            );
        } finally {
            dispatch(HideLoading());
        }
    };

    const getPurchasedInfo = (courseId, partId) => {
        return purchasedCourses.find(
            pc =>
                String(pc.courseId) === String(courseId) &&
                String(pc.partId) === String(partId)
        );
    };

    const getDaysLeft = (startDate, expiryDate) => {
        if (!expiryDate || !startDate) return null;

        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(expiryDate);

        if (today < start) {
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }

        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const getExpiryPercentage = (startDate, expiryDate) => {
        if (!expiryDate || !startDate) return 0;

        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(expiryDate);

        const total = (end - start) / (1000 * 60 * 60 * 24);

        if (today < start) return 0;
        if (today >= end) return 100;

        const elapsed = (today - start) / (1000 * 60 * 60 * 24);
        return Math.round((elapsed / total) * 100);
    };

    const getExpiryColor = (daysLeft, startDate, expiryDate) => {
        if (!expiryDate || !startDate) return "inactive";
        if (daysLeft === 0) return "red";
        if (daysLeft < 5) return "red";
        if (daysLeft < 10) return "yellow";
        return "green";
    };

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

            const res = await paymentRequestService.createPaymentRequest(
                courseId,
                partId
            );

            message.success(
                res?.data?.message || "Payment Request Submitted Successfully!"
            );
        } catch (error) {
            if (error?.response?.status === 409) {
                message.warning(error.response.data.message);
            } else {
                message.error(
                    error?.response?.data?.message || "Something went wrong"
                );
            }
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className="dashboard-container">
            <div className="profile-circle">
                <img src={user?.image ? `${baseURL}${user.image}` : profile} alt="User" className="profile-image" />
            </div>

            <div className="device-request">
                {currentDeviceStatus ? (
                    <span className="verified">Device Verified</span>
                ) : (
                    <button
                        className="request-btn"
                        onClick={handleDeviceRequestAccess}
                    >
                        Device Verification
                    </button>
                )}
            </div>

            <CustomModal
                isOpen={isOpenDeviceRequestModal}
                onRequestClose={() => setIsOpenDeviceRequestModal(false)}
                contentLabel="Device Verification"
                width="60%"
            >
                <DeviceVerification />
            </CustomModal>

            <div className="table-header">
                <span className="header">Course <img src={arrow} alt="" /></span>
                <span className="header">Parts <img src={arrow} alt="" /></span>
                <span className="header">Status <img src={arrow} alt="" /></span>
                <span className="header">Expiry <img src={arrow} alt="" /></span>
                <span className="header">Action <img src={arrow} alt="" /></span>
            </div>

            <div className="table-body">
                {allCourses.map(course => {
                    const selectedPartId = selectedParts[course.id];
                    const purchased = getPurchasedInfo(course.id, selectedPartId);

                    const daysLeft = purchased
                        ? getDaysLeft(purchased.startDate, purchased.expiryDate)
                        : null;

                    const percentage = purchased
                        ? getExpiryPercentage(
                            purchased.startDate,
                            purchased.expiryDate
                        )
                        : 0;

                    const color = purchased
                        ? getExpiryColor(
                            daysLeft,
                            purchased.startDate,
                            purchased.expiryDate
                        )
                        : "inactive";

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
                        <div
                            key={`${course.id}-${selectedPartId}`}
                            className="table-row"
                        >
                            <div className="table-cell course-name">
                                {course.name}
                            </div>

                            <div className="table-cell parts">
                                <select
                                    className="parts-select"
                                    value={selectedPartId}
                                    onChange={e =>
                                        setSelectedParts({
                                            ...selectedParts,
                                            [course.id]: e.target.value
                                        })
                                    }
                                >
                                    {course.parts.map(part => (
                                        <option key={part.id} value={part.id}>
                                            {part.name}
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
                                            style={{ width: `${percentage}%` }}
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
                                            handlePaymentRequest(
                                                course.id,
                                                selectedPartId
                                            )
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
