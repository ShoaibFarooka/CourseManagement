import React, { useEffect, useState } from "react";
import "./PerformanceModal.css";
import progressService from "../../../../../services/progressService";

const StatCard = ({ label, value, colorClass }) => (
    <div className={`pm-stat-card ${colorClass || ""}`}>
        <span className="pm-stat-value">{value}</span>
        <span className="pm-stat-label">{label}</span>
    </div>
);

const ProficiencyBar = ({ score }) => {
    const colorClass =
        score >= 70 ? "active" :
            score >= 40 ? "warning" :
                score > 0 ? "error" : "inactive";

    return (
        <div className="pm-proficiency-row">
            <span className="pm-proficiency-label">Proficiency</span>
            <div className="pm-proficiency-bar">
                <div
                    className={`pm-proficiency-fill ${colorClass}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className="pm-proficiency-pct">{score}%</span>
        </div>
    );
};

const StatsBlock = ({ data, loading }) => {
    if (loading) {
        return <div className="pm-loading">Loading...</div>;
    }

    if (!data) return null;

    return (
        <div className="pm-stats-block">
            <div className="pm-stat-cards">
                <StatCard label="Total" value={data.totalQuestions} />
                <StatCard label="Attempted" value={data.attempted} />
                <StatCard
                    label="Correct"
                    value={data.correct}
                    colorClass="correct"
                />
                <StatCard
                    label="Wrong"
                    value={data.wrong}
                    colorClass="wrong"
                />
            </div>
            <ProficiencyBar score={data.proficiency} />
        </div>
    );
};

const PerformanceModal = ({
    courseId,
    partId,
    publisherId,
    unitId,
    unitName,
    subunitId,
    subunitName,
    subunitsMap = {},
    isSubunit,
}) => {









    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const res = await progressService.getUnitPerformance({
                    courseId,
                    partId,
                    publisherId,
                    unitId,
                });
                setPerformance(res.performance);
            } catch (error) {
                console.error("Failed to fetch performance", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && partId && publisherId && unitId) {
            fetchPerformance();
        }
    }, [courseId, partId, publisherId, unitId]);

    // When viewing a subunit, pull its stats from the nested subunits map
    const subunitData = isSubunit && subunitId && performance?.subunits
        ? performance.subunits[subunitId] || null
        : null;

    return (
        <div className="pm-container">
            {isSubunit ? (
                <>
                    {/* Subunit stats */}
                    <div className="pm-section">
                        <h3 className="pm-section-title">{subunitName}</h3>
                        {loading ? (
                            <div className="pm-loading">Loading...</div>
                        ) : subunitData ? (
                            <StatsBlock data={subunitData} loading={false} />
                        ) : (
                            <div className="pm-empty">No attempts recorded for this subunit yet.</div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Unit overall stats */}
                    <div className="pm-section">
                        <h3 className="pm-section-title">{unitName || "Overall Unit Performance"}</h3>
                        <StatsBlock
                            data={performance ? {
                                totalQuestions: performance.totalQuestions,
                                attempted: performance.attempted,
                                correct: performance.correct,
                                wrong: performance.wrong,
                                proficiency: performance.proficiency,
                            } : null}
                            loading={loading}
                        />
                    </div>

                    {/* Per-subunit breakdown */}
                    {!loading && performance?.subunits && Object.keys(performance.subunits).length > 0 && (
                        <div className="pm-section">
                            <h3 className="pm-section-title">Subunit Breakdown</h3>
                            <div className="pm-subunit-list">
                                {Object.entries(performance.subunits).map(([id, data]) => (
                                    <div key={id} className="pm-subunit-item">
                                        <div className="pm-subunit-header">
                                            <span className="pm-subunit-id">{subunitsMap[id] || id}</span>
                                        </div>
                                        <div className="pm-subunit-stats">
                                            <span className="pm-subunit-stat">
                                                <span className="pm-subunit-stat-label">Attempted</span>
                                                <span className="pm-subunit-stat-value">{data.attempted}/{data.totalQuestions}</span>
                                            </span>
                                            <span className="pm-subunit-stat">
                                                <span className="pm-subunit-stat-label">Correct</span>
                                                <span className="pm-subunit-stat-value correct-value">{data.correct}</span>
                                            </span>
                                            <span className="pm-subunit-stat wrong">
                                                <span className="pm-subunit-stat-label">Wrong</span>
                                                <span className="pm-subunit-stat-value">{data.wrong}</span>
                                            </span>
                                            <span className="pm-subunit-stat">
                                                <span className="pm-subunit-stat-label">Proficiency</span>
                                                <span className="pm-subunit-stat-value">{data.proficiency}%</span>
                                            </span>
                                        </div>
                                        <ProficiencyBar score={data.proficiency} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && (!performance?.subunits || Object.keys(performance.subunits).length === 0) && (
                        <div className="pm-empty">No subunit data available yet.</div>
                    )}
                </>
            )}
        </div>
    );
};

export default PerformanceModal;