import React, { useState, useEffect } from "react";
import CoursePartSelector from "../CoursesLayout/components/CoursePartSelector/CoursePartSelector";
import UnitExamContent from "./components/UnitExamContent/UnitExamContent";
import courseService from '../../../services/courseService';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';

const UnitExams = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [step, setStep] = useState("select");

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedPartId, setSelectedPartId] = useState("");
    const [selectedPublisherId, setSelectedPublisherId] = useState("");

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
    const selectedPublisher = selectedPart?.publishers?.find(p => p._id === selectedPublisherId);

    const handleNext = () => {
        if (!selectedCourse || !selectedPart || !selectedPublisher) {
            message.warning("Please select all fields to proceed.");
            return;
        }
        setStep("exam");
    };

    if (step === "select") {
        return (
            <CoursePartSelector
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
                    setSelectedPublisherId("");
                }}
                onPartChange={(e) => {
                    setSelectedPartId(e.target.value);
                    setSelectedPublisherId("");
                }}
                onPublisherChange={(e) => setSelectedPublisherId(e.target.value)}
                onNext={handleNext}
            />
        );
    }

    return (
        <UnitExamContent
            course={selectedCourse}
            part={selectedPart}
            publisher={selectedPublisher}
        />
    );
};

export default UnitExams;
