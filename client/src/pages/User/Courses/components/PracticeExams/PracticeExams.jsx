import React, { useState } from "react";
import SelectExam from "../SelectExam/SelectExam";
import PracticeExamContent from '../PracticeExamContent/PracticeExamContent'

const PracticeExams = ({ allCourses }) => {
    const [step, setStep] = useState("select");

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedPartId, setSelectedPartId] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState("");

    const selectedCourse = allCourses.find(c => c.id === selectedCourseId);
    const selectedPart = selectedCourse?.parts?.find(p => p.id === selectedPartId);
    const selectedUnit = selectedPart?.units?.find(u => u.id === selectedUnitId);

    const handleNext = () => {
        if (!selectedCourse || !selectedPart || !selectedUnit) return;
        setStep("exam");
    };

    if (step === "select") {
        return (
            <SelectExam
                examType="unit"
                courses={allCourses}
                parts={selectedCourse?.parts || []}
                units={selectedPart?.units || []}

                selectedCourse={selectedCourseId}
                selectedPart={selectedPartId}
                selectedUnit={selectedUnitId}

                onCourseChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedPartId("");
                    setSelectedUnitId("");
                }}

                onPartChange={(e) => {
                    setSelectedPartId(e.target.value);
                    setSelectedUnitId("");
                }}

                onUnitChange={(e) => setSelectedUnitId(e.target.value)}
                onNext={handleNext}
            />
        );
    }

    return (
        <PracticeExamContent
            onBack={() => setStep("select")}
            course={selectedCourse}
            part={selectedPart}
            unit={selectedUnit}
        />
    );
};

export default PracticeExams;
