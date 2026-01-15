import React, { useState } from "react";
import SelectExam from "../SelectExam/SelectExam";
import UnitExamContent from "../UnitExamContent/UnitExamContent";

const UnitExams = ({ allCourses }) => {
    const [step, setStep] = useState("select");

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedPartId, setSelectedPartId] = useState("");
    const [selectedPublisherId, setselectedPublisherId] = useState("");

    const selectedCourse = allCourses.find(c => c.id === selectedCourseId);
    const selectedPart = selectedCourse?.parts?.find(p => p.id === selectedPartId);
    const selectedPublisher = selectedPart?.publishers?.find(p => p._id === selectedPublisherId);

    const handleNext = () => {
        if (!selectedCourse || !selectedPart || !selectedPublisher) return;
        setStep("exam");
    };

    if (step === "select") {
        return (
            <SelectExam
                examType="unit"
                courses={allCourses}
                parts={selectedCourse?.parts || []}
                publishers={selectedPart?.publishers || []}

                selectedCourse={selectedCourseId}
                selectedPart={selectedPartId}
                selectedPublisher={selectedPublisherId}

                onCourseChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedPartId("");
                    setselectedPublisherId("");
                }}

                onPartChange={(e) => {
                    setSelectedPartId(e.target.value);
                    setselectedPublisherId("");
                }}

                onPublisherChange={(e) => setselectedPublisherId(e.target.value)}
                onNext={handleNext}
            />
        );
    }

    return (
        <UnitExamContent
            publisher={selectedPublisherId} />
    );
};

export default UnitExams;
