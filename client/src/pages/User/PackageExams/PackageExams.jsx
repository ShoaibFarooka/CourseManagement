import React, { useState, useEffect } from "react";
import CoursePartSelector from "../CoursesLayout/components/CoursePartSelector/CoursePartSelector";
import PackageExamContent from './components/PackageExamContent/PackageExamContent';
import courseService from '../../../services/courseService';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';

const PackageExamsPage = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [step, setStep] = useState("select");

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedPartId, setSelectedPartId] = useState("");

    const dispatch = useDispatch();

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

                const existingPart = groupedCourses[item.courseId].parts.find(
                    part => part.id === item.partId
                );

                if (!existingPart) {
                    groupedCourses[item.courseId].parts.push({
                        id: item.partId,
                        name: item.partName,
                        publishers: item.publishers || []
                    });
                }
            });

            setAllCourses(Object.values(groupedCourses));
        } catch (error) {
            message.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, []);

    const selectedCourse = allCourses.find(c => c.id === selectedCourseId);
    const selectedPart = selectedCourse?.parts?.find(p => p.id === selectedPartId);

    const handleNext = () => {
        if (!selectedCourse || !selectedPart) {
            message.warning("Please select all fields to proceed.");
            return;
        }
        setStep("exam");
    };

    if (step === "select") {
        return (
            <CoursePartSelector
                examType="package"
                courses={allCourses}
                parts={selectedCourse?.parts || []}

                selectedCourse={selectedCourseId}
                selectedPart={selectedPartId}

                onCourseChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedPartId("");
                }}
                onPartChange={(e) => {
                    setSelectedPartId(e.target.value);
                }}
                onNext={handleNext}
            />
        );
    }

    return (
        <PackageExamContent
            courseId={selectedCourseId}
            partId={selectedPartId}
            part={selectedPart}
        />
    );
};

export default PackageExamsPage;
