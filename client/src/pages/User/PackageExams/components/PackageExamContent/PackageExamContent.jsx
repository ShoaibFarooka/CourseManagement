import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PackageExamContent.css";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../../../redux/loaderSlice";
import questionService from "../../../../../services/questionServices";
import { message } from "antd";

const PackageExamContent = ({ courseId, partId, part }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [selectedExam, setSelectedExam] = useState(null);
    const [limit, setLimit] = useState("");
    const [totalQuestions, setTotalQuestions] = useState(0);

    const isStandardAvailable = Boolean(part?.standard);
    const isMegaAvailable = Boolean(part?.mega?.length);


    const fetchTotalQuestions = async () => {
        try {
            dispatch(ShowLoading());
            const res = await questionService.CountQuestionsInPart({ courseId, partId });
            setTotalQuestions(res.totalQuestions || 0);
        } catch (error) {
            message.error(error?.response?.data?.error || "Failed to fetch question count");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        if (isMegaAvailable) {
            fetchTotalQuestions();
        }
    }, [courseId, partId, dispatch, isMegaAvailable]);

    const handleExamSelect = (examType) => {
        setSelectedExam(examType);
        if (examType === "standard") setLimit("");
    };

    const handleUpdate = () => {
        if (!selectedExam) {
            message.warning("Please select a package");
            return;
        }

        if (selectedExam === "mega") {
            const numericLimit = Number(limit);
            if (!numericLimit || numericLimit <= 0) {
                message.warning("Please enter a valid number of questions for Mega Review");
                return;
            }

            if (numericLimit > totalQuestions) {
                message.warning(`You can select a maximum of ${totalQuestions} questions for this part`);
                return;
            }
        }

        navigate("/quiz", {
            state: {
                source: "package-exam",
                courseId,
                partId,
                examType: selectedExam,
                ...(selectedExam === "mega" && { limit: Number(limit) })
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
                    <label className="label">Number of Questions (Max {totalQuestions})</label>
                    <input
                        type="number"
                        min="1"
                        max={totalQuestions}
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
                        (selectedExam === "mega" && (!isMegaAvailable || totalQuestions === 0))
                    }
                >
                    Start Exam
                </button>
            </div>
        </div>
    );
};

export default PackageExamContent;
