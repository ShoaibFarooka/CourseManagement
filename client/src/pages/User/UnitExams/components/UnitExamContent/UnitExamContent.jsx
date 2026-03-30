import React, { useEffect, useState } from "react";
import "./UnitExamContent.css";
import { FaPlus, FaMinus } from "react-icons/fa";
import arrow from '../../../../../assets/icons/arrow.png';
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import { useDispatch, useSelector } from "react-redux";
import courseService from "../../../../../services/courseService";
import { message } from "antd";
import { useNavigate } from 'react-router-dom';
import CustomModal from "../../../../../components/CustomModal/CustomModal";
import progressService from "../../../../../services/progressService";
import SessionModal from "../SessionModal/SessionModal";

const UnitExamContent = ({ courseId, partId, publisherId, timeRatio }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [units, setUnits] = useState([]);
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [selectedSubunits, setSelectedSubunits] = useState({});
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(false);
    const [unitProgress, setUnitProgress] = useState(null);
    const [allUnitsProgress, setAllUnitsProgress] = useState({});

    const toggleAccordion = (id) => {
        setExpandedUnit(prev => (prev === id ? null : id));
    };

    const { purchasedCourses } = useSelector(state => state.user);

    const isPurchased = purchasedCourses?.some(
        p => p.courseId === courseId && p.partId === partId
    );

    const handleToggleUnit = (unitId, unlocked) => {
        if (!unlocked) {
            message.warning("Please purchase this course part to unlock all units");
            return;
        }

        toggleAccordion(unitId);

        if (expandedUnit !== unitId) {
            fetchSubunitProgress(unitId);
        }
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

    const handleUnitCheck = (unitId, unitSubunits) => {
        const isSelected = selectedUnits.includes(unitId);

        if (isSelected) {
            setSelectedUnits(selectedUnits.filter(id => id !== unitId));
            setSelectedSubunits(prev => {
                const copy = { ...prev };
                delete copy[unitId];
                return copy;
            });
        } else {
            setSelectedUnits([...selectedUnits, unitId]);
            setSelectedSubunits(prev => ({
                ...prev,
                [unitId]: prev[unitId]?.length
                    ? prev[unitId]
                    : unitSubunits.map(s => s._id)
            }));
        }
    };

    const handleSubunitCheck = (unitId, subunitId) => {
        const otherUnitSelected = selectedUnits.some(id => id !== unitId);
        if (otherUnitSelected) return;

        setSelectedUnits(prev =>
            prev.includes(unitId) ? prev : [...prev, unitId]
        );

        setSelectedSubunits(prev => {
            const unitSubs = prev[unitId] || [];
            if (unitSubs.includes(subunitId)) {
                return { ...prev, [unitId]: unitSubs.filter(id => id !== subunitId) };
            } else {
                return { ...prev, [unitId]: [...unitSubs, subunitId] };
            }
        });
    };

    const handleClickNext = async () => {
        if (selectedUnits.length !== 1) {
            navigate("/quiz", {
                state: {
                    source: "unit-exam",
                    courseId,
                    partId,
                    publisherId,
                    selectedUnits,
                    selectedSubunits,
                    timeRatio,
                }
            });
            return;
        }

        try {
            setSessionLoading(true);
            const unitId = selectedUnits[0];
            const res = await progressService.getUnitProgress({ courseId, partId, publisherId, unitId });
            setUnitProgress(res.progress);
            setShowSessionModal(true);
        } catch (error) {
            if (error?.response?.status === 404) {
                navigateToQuiz("start-over");
            } else {
                message.error("Something went wrong!");
            }
        } finally {
            setSessionLoading(false);
        }
    };

    const navigateToQuiz = async (mode) => {
        const unitId = selectedUnits[0];

        try {
            setSessionLoading(true);
            let prefetchedQuestions = null;

            if (mode === "continue") {
                const res = await progressService.getContinueSession({
                    courseId,
                    partId,
                    publisherId,
                    unitId
                });
                prefetchedQuestions = res.questions;
            } else if (mode === "wrong-only") {
                const res = await progressService.getWrongOnlySession({
                    courseId,
                    partId,
                    publisherId,
                    unitId
                });
                prefetchedQuestions = res.questions;
            } else if (mode === "start-over") {
                await progressService.getStartOverSession({
                    courseId,
                    partId,
                    publisherId,
                    unitId
                });
            }

            setShowSessionModal(false);

            navigate("/quiz", {
                state: {
                    source: "unit-exam",
                    courseId,
                    partId,
                    publisherId,
                    selectedUnits,
                    selectedSubunits,
                    timeRatio,
                    prefetchedQuestions,
                }
            });
        } catch (error) {
            console.log(error);
            message.error(error?.response?.data?.message || "Something went wrong!");
        } finally {
            setSessionLoading(false);
        }
    };

    const fetchAllUnitsProgress = async () => {
        try {
            const res = await progressService.getAllUnitsProgress({
                courseId,
                partId,
                publisherId,
            });

            setAllUnitsProgress(prev => {
                const merged = { ...prev };
                Object.entries(res.progress || {}).forEach(([unitId, data]) => {
                    merged[unitId] = {
                        subunits: prev[unitId]?.subunits,
                        ...data,
                    };
                });
                return merged;
            });
        } catch (error) {
            console.error("Failed to fetch units progress", error);
        }
    };

    useEffect(() => {
        if (units.length > 0) {
            fetchAllUnitsProgress();
        }
    }, [units, courseId, partId, publisherId]);

    const fetchSubunitProgress = async (unitId) => {
        try {
            const res = await progressService.getAllSubunitsProgress({
                courseId,
                partId,
                publisherId,
                unitId
            });

            const subunitProgress = res.progress || {};

            setAllUnitsProgress(prev => ({
                ...prev,
                [unitId]: {
                    ...prev[unitId],
                    subunits: subunitProgress
                }
            }));
        } catch (error) {
            console.error(`Failed to fetch subunit progress for unit ${unitId}`, error);
        }
    };

    const getAttemptedColor = (attempted, total) => {
        if (!attempted || !total || attempted === 0) return "inactive";
        const ratio = attempted / total;
        if (ratio >= 0.7) return "active";
        if (ratio >= 0.4) return "warning";
        return "error";
    };

    const getProficiencyScore = (progress) => {
        if (!progress || !progress.attempted || progress.attempted === 0) return 0;
        return Math.round(((progress.correct ?? 0) / progress.attempted) * 100);
    };

    const getProficiencyColor = (score) => {
        if (score === 0) return "inactive";
        if (score >= 70) return "active";
        if (score >= 40) return "warning";
        return "error";
    };

    const getSubunitAttemptedColor = (attempted, total) => {
        if (!attempted || !total || attempted === 0) return "inactive";
        const ratio = attempted / total;
        if (ratio >= 0.7) return "active";
        if (ratio >= 0.3) return "warning";
        return "error";
    };

    const getSubunitProficiencyColor = (score) => {
        if (score === 0) return "inactive";
        if (score >= 70) return "active";
        if (score >= 40) return "warning";
        return "error";
    };

    return (
        <div className="unit-exams-container">

            <div className="guideline">
                Select the topics you wish to study, click on + icon to expand
            </div>

            <div className="unit-table-header">
                <span>Units <img src={arrow} alt="arrow" className="arrow" /></span>
                <span>Type <img src={arrow} alt="arrow" className="arrow" /></span>
                <span>Status <img src={arrow} alt="arrow" className="arrow" /></span>
                <span>Proficiency Score <img src={arrow} alt="arrow" className="arrow" /></span>
            </div>

            <div className="unit-topic-list">
                {units.map((topic, index) => {
                    const isUnitUnlocked = isPurchased || index === 0;
                    const progress = allUnitsProgress[topic.unitId];
                    const attempted = progress?.attempted ?? 0;
                    const total = progress?.totalQuestions ?? 0;
                    const proficiency = getProficiencyScore(progress);
                    const attemptedColor = getAttemptedColor(attempted, total);
                    const proficiencyColor = getProficiencyColor(proficiency);

                    return (
                        <React.Fragment key={topic.unitId}>
                            <div className={`unit-topic-row ${!isUnitUnlocked ? "locked" : ""}`}>
                                <div className="unit-topic-info">
                                    <span
                                        className="unit-topic-icon"
                                        onClick={() => handleToggleUnit(topic.unitId, isUnitUnlocked)}
                                    >
                                        {expandedUnit === topic.unitId ? <FaMinus /> : <FaPlus />}
                                    </span>

                                    <input
                                        type="checkbox"
                                        className="unit-topic-checkbox"
                                        checked={selectedUnits.includes(topic.unitId)}
                                        disabled={!isUnitUnlocked}
                                        onChange={() => {
                                            if (!isUnitUnlocked) {
                                                message.warning("Purchase required to unlock this unit");
                                                return;
                                            }
                                            handleUnitCheck(topic.unitId, topic.subunits);
                                        }}
                                    />

                                    <span className="unit-topic-name">
                                        {topic.unitName}
                                        {!isUnitUnlocked && <span className="lock-icon"> 🔒</span>}
                                    </span>
                                </div>

                                <div className="unit-topic-type">
                                    {Array.isArray(topic.type) ? topic.type.join(', ') : topic.type || 'N/A'}
                                </div>

                                <div className={`unit-topic-status ${attemptedColor}`}>
                                    {attempted}/{total}
                                </div>

                                <div className="unit-topic-progress">
                                    <div className="unit-progress-bar">
                                        <div
                                            className={`unit-progress-fill ${proficiencyColor}`}
                                            style={{ width: `${proficiency}%` }}
                                        />
                                    </div>
                                    <span className="unit-progress-text">{proficiency}%</span>
                                </div>
                            </div>

                            {expandedUnit === topic.unitId && isUnitUnlocked && (
                                <div className="unit-subunit-wrapper">
                                    <div className="unit-subunit-label">Subunits</div>
                                    {topic.subunits.map(sub => {
                                        const otherUnitSelected = selectedUnits.some(id => id !== topic.unitId);
                                        const disabled = otherUnitSelected && !selectedUnits.includes(topic.unitId);

                                        // FIX 1: Safe defaults so getProficiencyScore never receives undefined fields
                                        const subProgress = allUnitsProgress[topic.unitId]?.subunits?.[sub._id] || {};
                                        const attemptedSub = subProgress.attempted ?? 0;
                                        const totalSub = subProgress.totalQuestions ?? 0;
                                        const proficiencySub = getProficiencyScore(subProgress);
                                        const attemptedColorSub = getSubunitAttemptedColor(attemptedSub, totalSub);
                                        const proficiencyColorSub = getSubunitProficiencyColor(proficiencySub);

                                        return (
                                            <div key={sub._id} className="unit-subunit-row">

                                                <div className="unit-subunit-info">
                                                    <input
                                                        type="checkbox"
                                                        className="unit-topic-checkbox"
                                                        checked={selectedSubunits[topic.unitId]?.includes(sub._id) || false}
                                                        disabled={disabled}
                                                        onChange={() => handleSubunitCheck(topic.unitId, sub._id)}
                                                    />
                                                    <span className="unit-subunit-name">{sub.name}</span>
                                                </div>

                                                <div></div>

                                                <div className={`unit-topic-status ${attemptedColorSub} subunit-topic-status`}>
                                                    {attemptedSub}/{totalSub}
                                                </div>

                                                <div className="unit-topic-progress">
                                                    <div className="unit-progress-bar">
                                                        <div
                                                            className={`unit-progress-fill ${proficiencyColorSub}`}
                                                            style={{ width: `${proficiencySub}%` }}
                                                        />
                                                    </div>
                                                    <span className="unit-progress-text">{proficiencySub}%</span>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="unit-next-btn-container">
                <button
                    className="button next"
                    disabled={selectedUnits.length === 0}
                    onClick={handleClickNext}
                >
                    Next
                </button>
            </div>

            {
                <CustomModal
                    isOpen={showSessionModal}
                    onRequestClose={() => setShowSessionModal(false)}
                    title="Continue your session?"
                >
                    <SessionModal
                        unitProgress={unitProgress}
                        sessionLoading={sessionLoading}
                        navigateToQuiz={navigateToQuiz}
                    />
                </CustomModal>
            }
        </div>
    );
};

export default UnitExamContent;