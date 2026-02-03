import React, { useState, useEffect } from "react";
import CoursePartSelector from "../CoursesLayout/components/CoursePartSelector/CoursePartSelector";
import PracticeExamContent from "./components/PracticeExamContent/PracticeExamContent";
import courseService from '../../../services/courseService';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch, useSelector } from 'react-redux';

const PraticeExams = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [step, setStep] = useState("select");

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedPartId, setSelectedPartId] = useState("");

    const dispatch = useDispatch();
    const { purchasedCourses } = useSelector(state => state.user);

    const today = new Date();

    const activePurchasedCourses = purchasedCourses?.filter(purchase => {
        if (!purchase.expiryDate) return true;
        return new Date(purchase.expiryDate) >= today;
    }) || [];


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
                        parts: [],
                        timeRatio: item.time,
                    };
                }

                if (!groupedCourses[item.courseId].parts.find(p => p.id === item.partId)) {
                    groupedCourses[item.courseId].parts.push({
                        id: item.partId,
                        name: item.partName
                    });
                }
            });

            let coursesArray = Object.values(groupedCourses);

            coursesArray = coursesArray
                .map(course => {
                    const purchasedParts = activePurchasedCourses
                        .filter(p => p.courseId === course.id)
                        .map(p => p.partId);

                    return {
                        ...course,
                        parts: course.parts.filter(part =>
                            purchasedParts.includes(part.id)
                        )
                    };
                })
                .filter(course => course.parts.length > 0);

            setAllCourses(coursesArray);
        } catch (error) {
            message.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, [activePurchasedCourses.length]);

    const selectedCourse = allCourses.find(c => c.id === selectedCourseId);

    const handleNext = () => {
        if (!selectedCourse || !selectedPartId) {
            message.warning("Please select a course and part to proceed.");
            return;
        }

        setStep("exam");
    };

    if (step === "select") {
        return (
            <CoursePartSelector
                examType="practice"
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
        <PracticeExamContent
            courseId={selectedCourseId}
            partId={selectedPartId}
            timeRatio={selectedCourse?.timeRatio}
        />
    );
};

export default PraticeExams;
