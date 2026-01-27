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

    const hasPurchasedCourses = purchasedCourses && purchasedCourses.length > 0;

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

                const existingPart = groupedCourses[item.courseId].parts.find(
                    part => part.id === item.partId
                );

                if (!existingPart) {
                    groupedCourses[item.courseId].parts.push({
                        id: item.partId,
                        name: item.partName
                    });
                }
            });

            let coursesArray = Object.values(groupedCourses);

            if (hasPurchasedCourses) {
                coursesArray = coursesArray
                    .map(course => {
                        const purchasedParts = purchasedCourses
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
            }

            setAllCourses(coursesArray);
        } catch (error) {
            message.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, [hasPurchasedCourses]);

    const selectedCourse = allCourses.find(c => c.id === selectedCourseId);
    const selectedPart = selectedCourse?.parts?.find(p => p.id === selectedPartId);

    const handleNext = () => {
        if (!hasPurchasedCourses) {
            message.warning(
                "You are using demo. To unlock this section, please purchase a course."
            );
            return;
        }

        if (!selectedCourse || !selectedPart) {
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
                    if (!hasPurchasedCourses) {
                        message.warning(
                            "You are using demo. Please purchase a course to continue."
                        );
                        return;
                    }
                    setSelectedCourseId(e.target.value);
                    setSelectedPartId("");
                }}

                onPartChange={(e) => {
                    if (!hasPurchasedCourses) {
                        message.warning(
                            "You are using demo. Please purchase a course to continue."
                        );
                        return;
                    }
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
