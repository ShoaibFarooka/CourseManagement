import React, { useEffect, useState } from "react";
import "./UnitExamContent.css";
import { FaPlus, FaMinus } from "react-icons/fa";
import arrow from '../../../../../assets/icons/arrow.png';
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import courseService from "../../../../../services/courseService";
import { message } from "antd";
import { useNavigate } from 'react-router-dom';

const UnitExamContent = ({ courseId, partId, publisherId, timeRatio }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [units, setUnits] = useState([]);

    const [selectedUnits, setSelectedUnits] = useState([]);
    const [selectedSubunits, setSelectedSubunits] = useState({});

    const toggleAccordion = (id) => {
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
    }, []);

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
                [unitId]: prev[unitId]?.length ? prev[unitId] : unitSubunits.map(s => s._id)
            }));
        }
    };

    const handleSubunitCheck = (unitId, subunitId) => {
        const otherUnitsSelected = selectedUnits.filter(id => id !== unitId).length > 0;

        if (otherUnitsSelected && !selectedUnits.includes(unitId)) return;

        setSelectedUnits(prev => prev.includes(unitId) ? prev : [...prev, unitId]);

        setSelectedSubunits(prev => {
            const unitSubs = prev[unitId] || [];
            if (unitSubs.includes(subunitId)) {
                return { ...prev, [unitId]: unitSubs.filter(id => id !== subunitId) };
            } else {
                return { ...prev, [unitId]: [...unitSubs, subunitId] };
            }
        });
    };


    const handleClickNext = () => {
        navigate("/quiz", {
            state: {
                source: "unit-exam",
                publisherId,
                selectedUnits,
                selectedSubunits,
                timeRatio,
            }
        });
    };

    return (
        <div className="unit-exams-container">

            <div className="guideline">
                Select the topics you wish to study, click on + icon to expand
            </div>

            <div className="unit-table-header">
                <span>Units <img src={arrow} alt="arrow" /></span>
                <span>Status <img src={arrow} alt="arrow" /></span>
                <span>Proficiency Score <img src={arrow} alt="arrow" /></span>
            </div>

            <div className="unit-topic-list">
                {units.map(topic => (
                    <React.Fragment key={topic.unitId}>

                        <div className="unit-topic-row">
                            <div className="unit-topic-info">
                                <span
                                    className="unit-topic-icon"
                                    onClick={() => toggleAccordion(topic.unitId)}
                                >
                                    {expandedUnit === topic.unitId ? <FaMinus /> : <FaPlus />}
                                </span>

                                <input
                                    type="checkbox"
                                    className="unit-topic-checkbox"
                                    checked={selectedUnits.includes(topic.unitId)}
                                    onChange={() => handleUnitCheck(topic.unitId, topic.subunits)}
                                />
                                <span className="unit-topic-name">{topic.unitName}</span>
                            </div>

                            <div className={`unit-topic-status active`}>
                                Pending
                            </div>

                            <div className="unit-topic-progress">
                                <div className="unit-progress-bar">
                                    <div
                                        className={`unit-progress-fill active`}
                                        style={{ width: `0%` }}
                                    />
                                </div>
                                <span className="unit-progress-text">0%</span>
                            </div>
                        </div>

                        {expandedUnit === topic.unitId && (
                            <div className="unit-subunit-wrapper">
                                <div className="unit-subunit-label">Subunits</div>

                                {topic.subunits.map(sub => {
                                    const otherUnitSelected = selectedUnits.some(id => id !== topic.unitId);
                                    const disabled = otherUnitSelected && !selectedUnits.includes(topic.unitId);

                                    return (
                                        <div key={sub._id} className="unit-subunit-row">
                                            <div className="unit-subunit-info">
                                                <input
                                                    type="checkbox"
                                                    className="unit-topic-checkbox"
                                                    checked={selectedSubunits[topic.unitId]?.includes(sub._id) || false}
                                                    onChange={() => handleSubunitCheck(topic.unitId, sub._id)}
                                                    disabled={disabled}
                                                />
                                                <span className="unit-subunit-name">{sub.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </React.Fragment>
                ))}
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

        </div>
    );
};

export default UnitExamContent;
