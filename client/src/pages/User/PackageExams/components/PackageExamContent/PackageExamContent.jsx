import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PackageExamContent.css";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import questionService from "../../../../../services/questionServices";
import { message } from "antd";

const PackageExamContent = ({ courseId, partId, part, timeRatio }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [selectedExam, setSelectedExam] = useState(null);
    const [limit, setLimit] = useState("");
    const [standardTotal, setStandardTotal] = useState(0);
    const [megaTotal, setMegaTotal] = useState(0);

    const isStandardAvailable = Boolean(part?.standard);
    const isMegaAvailable = Boolean(part?.mega?.length);

    const fetchStandardQuestions = async () => {
        try {
            dispatch(ShowLoading());
            const res = await questionService.CountStandardReviewQuestions({ courseId, partId });
            setStandardTotal(res.totalQuestions || 0);
        } catch (error) {
            message.error(error?.response?.data?.error || "Failed to fetch Standard review question count");
        } finally {
            dispatch(HideLoading());
        }
    };

    const fetchMegaQuestions = async () => {
        try {
            dispatch(ShowLoading());
            const res = await questionService.CountMegaReviewQuestions({ courseId, partId });
            setMegaTotal(res.totalQuestions || 0);
        } catch (error) {
            message.error(error?.response?.data?.error || "Failed to fetch Mega review question count");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        if (isStandardAvailable) fetchStandardQuestions();
        if (isMegaAvailable) fetchMegaQuestions();
    }, [courseId, partId, isStandardAvailable, isMegaAvailable]);

    const handleExamSelect = (examType) => {
        setSelectedExam(examType);
        setLimit("");
    };

    const handleUpdate = () => {
        if (!selectedExam) {
            message.warning("Please select a package");
            return;
        }

        const maxQuestions = selectedExam === "standard" ? standardTotal : megaTotal;
        const numericLimit = Number(limit);

        if (!numericLimit || numericLimit <= 0) {
            message.warning(`Please enter a valid number of questions for ${selectedExam === "standard" ? "Standard" : "Mega"} Review`);
            return;
        }

        if (numericLimit > maxQuestions) {
            message.warning(`You can select a maximum of ${maxQuestions} questions for this part`);
            return;
        }

        navigate("/quiz", {
            state: {
                source: "package-exam",
                courseId,
                partId,
                examType: selectedExam,
                limit: numericLimit,
                timeRatio,
            }
        });
    };

    return (
        <div className="package-exam">

            <div
                className={`package ${selectedExam === "standard" ? "selected" : ""} ${!isStandardAvailable ? "disabled" : ""}`}
                onClick={() => isStandardAvailable && handleExamSelect("standard")}
            >
                <span className="pkg-checkbox">
                    <input
                        type="radio"
                        checked={selectedExam === "standard"}
                        readOnly
                        disabled={!isStandardAvailable}
                    />
                </span>
                <span className="pkg-title">Standard Review Package</span>
            </div>

            {selectedExam === "standard" && isStandardAvailable && (
                <div className="limit-input">
                    <label className="label">Number of Questions (Max {standardTotal})</label>
                    <input
                        type="number"
                        min="1"
                        max={standardTotal}
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        placeholder="Enter question limit"
                        className="input"
                    />
                </div>
            )}

            <div className="description">
                Standard review uses a predefined set of questions from the assigned publisher.
            </div>

            <div
                className={`package ${selectedExam === "mega" ? "selected" : ""} ${!isMegaAvailable ? "disabled" : ""}`}
                onClick={() => isMegaAvailable && handleExamSelect("mega")}
            >
                <span className="pkg-checkbox">
                    <input
                        type="radio"
                        checked={selectedExam === "mega"}
                        readOnly
                        disabled={!isMegaAvailable}
                    />
                </span>
                <span className="pkg-title">Mega Review Package</span>
            </div>

            {selectedExam === "mega" && (
                <div className="limit-input">
                    <label className="label">Number of Questions (Max {megaTotal})</label>
                    <input
                        type="number"
                        min="1"
                        max={megaTotal}
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        placeholder="Enter question limit"
                        className="input"
                    />
                </div>
            )}

            <div className="description">
                Mega review randomly mixes questions from multiple publishers.
            </div>

            <div className="buttons-container">
                <button
                    className="button update"
                    onClick={handleUpdate}
                    disabled={
                        (selectedExam === "standard" && !isStandardAvailable) ||
                        (selectedExam === "mega" && (!isMegaAvailable || megaTotal === 0))
                    }
                >
                    Start Exam
                </button>
            </div>
        </div>
    );
};

export default PackageExamContent;
