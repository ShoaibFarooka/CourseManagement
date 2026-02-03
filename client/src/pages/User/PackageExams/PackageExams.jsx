import React, { useState, useEffect } from "react";
import CoursePartSelector from "../CoursesLayout/components/CoursePartSelector/CoursePartSelector";
import PackageExamContent from './components/PackageExamContent/PackageExamContent';
import courseService from '../../../services/courseService';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch, useSelector } from 'react-redux';

const PackageExamsPage = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [step, setStep] = useState("select");

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedPartId, setSelectedPartId] = useState("");

    const dispatch = useDispatch();
    const { purchasedCourses } = useSelector(state => state.user);

    const today = new Date();

    const activePurchasedCourses = purchasedCourses?.filter(p => {
        if (!p.expiryDate) return true;
        return new Date(p.expiryDate) >= today;
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

                const existingPart = groupedCourses[item.courseId].parts.find(
                    part => part.id === item.partId
                );

                if (!existingPart) {
                    groupedCourses[item.courseId].parts.push({
                        id: item.partId,
                        name: item.partName,
                        standard: item.standard || null,
                        mega: item.mega || []
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
    const selectedPart = selectedCourse?.parts?.find(p => p.id === selectedPartId);

    const handleNext = () => {
        if (!selectedCourse || !selectedPart) {
            message.warning("Please select course and part to proceed.");
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
            timeRatio={selectedCourse?.timeRatio}
        />
    );
};

export default PackageExamsPage;
