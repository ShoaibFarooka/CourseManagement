import React, { useEffect, useState } from "react";
import "./PerformanceContent.css";
import { FaPlus, FaMinus, FaEye } from "react-icons/fa";
import arrow from '../../../../../assets/icons/arrow.png';
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import { useDispatch, useSelector } from "react-redux";
import courseService from "../../../../../services/courseService";
import { message } from "antd";
import CustomModal from "../../../../../components/CustomModal/CustomModal";
import PerformanceModal from "../PerformanceModal/PerformanceModal";

const PerformanceContent = ({ courseId, partId, publisherId }) => {
    const dispatch = useDispatch();
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [units, setUnits] = useState([]);
    const [modalConfig, setModalConfig] = useState(null);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);

    const { purchasedCourses } = useSelector(state => state.user);

    const isPurchased = purchasedCourses?.some(
        p => p.courseId === courseId && p.partId === partId
            && new Date(p.expiryDate) > new Date()
    );

    const toggleAccordion = (id, unlocked) => {
        if (!unlocked) {
            message.warning("Please purchase this course part to unlock all units");
            return;
        }
        setExpandedUnit(prev => (prev === id ? null : id));
    };

    const fetchUnitsandSubunits = async () => {
        try {
            dispatch(ShowLoading());
            const res = await courseService.fetchUnitsAndSubunits({
                courseId,
                partId,
                publisherId
            });
            setUnits(res.data);
        } catch (error) {
            message.error(error?.response?.data?.message || "Something went wrong!");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchUnitsandSubunits();
    }, [courseId, partId, publisherId]);

    const handleOpenUnitModal = (e, topic) => {
        e.stopPropagation();
        // Build a map of subunitId -> subunitName for the modal to render names
        const subunitsMap = Object.fromEntries(
            topic.subunits.map(s => [s._id, s.name])
        );
        setModalConfig({
            unitId: topic.unitId,
            unitName: topic.unitName,
            subunitId: null,
            subunitName: null,
            subunitsMap,
            isSubunit: false,
            title: topic.unitName,
        });
        setShowPerformanceModal(true);
    };

    const handleOpenSubunitModal = (e, topic, sub) => {
        e.stopPropagation();
        setModalConfig({
            unitId: topic.unitId,   // parent unit id — needed for the API call
            unitName: topic.unitName,
            subunitId: sub._id,
            subunitName: sub.name,
            subunitsMap: {},
            isSubunit: true,
            title: sub.name,
        });
        setShowPerformanceModal(true);
    };

    return (
        <div className="performance-container">

            <div className="guideline">
                View performance analytics for each unit and subunit
            </div>

            <div className="performance-table-header">
                <span>Units <img src={arrow} alt="arrow" className="arrow" /></span>
                <span>Type <img src={arrow} alt="arrow" className="arrow" /></span>
                <span>Performance <img src={arrow} alt="arrow" className="arrow" /></span>
            </div>

            <div className="performance-topic-list">
                {units.map((topic, index) => {
                    const isUnitUnlocked = isPurchased || index === 0;

                    return (
                        <React.Fragment key={topic.unitId}>
                            <div
                                className={`performance-topic-row ${!isUnitUnlocked ? "locked" : ""}`}
                                onClick={() => toggleAccordion(topic.unitId, isUnitUnlocked)}
                            >
                                <div className="performance-topic-info">
                                    <span className="performance-topic-icon">
                                        {expandedUnit === topic.unitId ? <FaMinus /> : <FaPlus />}
                                    </span>
                                    <span className="performance-topic-name">
                                        {topic.unitName}
                                        {!isUnitUnlocked && <span className="lock-icon"> 🔒</span>}
                                    </span>
                                </div>

                                <div className="performance-topic-type">
                                    {Array.isArray(topic.type) ? topic.type.join(', ') : topic.type || 'N/A'}
                                </div>

                                <div className="performance-eye-cell">
                                    {isUnitUnlocked && (
                                        <button
                                            className="performance-eye-btn"
                                            onClick={(e) => handleOpenUnitModal(e, topic)}
                                            title="View unit performance"
                                        >
                                            <FaEye />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {expandedUnit === topic.unitId && isUnitUnlocked && (
                                <div className="performance-subunit-wrapper">
                                    <div className="performance-subunit-label">Subunits</div>
                                    {topic.subunits.map(sub => (
                                        <div key={sub._id} className="performance-subunit-row">
                                            <div className="performance-subunit-info">
                                                <span className="performance-subunit-name">{sub.name}</span>
                                            </div>

                                            <div></div>

                                            <div className="performance-eye-cell">
                                                <button
                                                    className="performance-eye-btn subunit-eye"
                                                    onClick={(e) => handleOpenSubunitModal(e, topic, sub)}
                                                    title="View subunit performance"
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {showPerformanceModal && modalConfig && (
                <CustomModal
                    isOpen={showPerformanceModal}
                    onRequestClose={() => setShowPerformanceModal(false)}
                    title={`Performance: ${modalConfig.title}`}
                >
                    <PerformanceModal
                        courseId={courseId}
                        partId={partId}
                        publisherId={publisherId}
                        unitId={modalConfig.unitId}
                        unitName={modalConfig.unitName}
                        subunitsMap={modalConfig.subunitsMap}
                        subunitId={modalConfig.subunitId}
                        subunitName={modalConfig.subunitName}
                        isSubunit={modalConfig.isSubunit}
                    />
                </CustomModal>
            )}
        </div>
    );
};

export default PerformanceContent;