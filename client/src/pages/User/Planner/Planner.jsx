import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import CoursePartSelector from "../CoursesLayout/components/CoursePartSelector/CoursePartSelector";
import PlannerCalendar from "./components/PlannerCalendar/PlannerCalendar";
import plannerService from "../../../services/plannerService";
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import "./Planner.css";

const PERIODS = [
    { value: 15, label: "15 Days" },
    { value: 30, label: "1 Month" },
    { value: 45, label: "1 and a Half Month" },
    { value: 60, label: "2 Months" },
];

const Planner = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const purchasedCourses = useSelector(state => state.user.purchasedCourses);
    const deviceStatus = useSelector(state => state.user.currentDeviceStatus);
    const language = useSelector(state => state.user?.user?.language);

    const [courses, setCourses] = useState([]);
    const [step, setStep] = useState("select");
    const [plan, setPlan] = useState(null);

    // Coming back from a planner quiz (or its progress report) reopens the same plan.
    const returnSelection = location.state?.plannerSelection;
    const [selectedCourseId, setSelectedCourseId] = useState(returnSelection?.courseId || "");
    const [selectedPartId, setSelectedPartId] = useState(returnSelection?.partId || "");
    const [selectedPublisherId, setSelectedPublisherId] = useState(returnSelection?.publisherId || "");
    const [selectedPeriod, setSelectedPeriod] = useState("");

    // Same rule the sidebar uses to lock the Planner link; the server enforces it too.
    const hasAccess =
        deviceStatus === true &&
        purchasedCourses?.some(p => !p.isCancelled && new Date(p.expiryDate) > new Date());

    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    const selectedPart = selectedCourse?.parts?.find(p => p.id === selectedPartId);
    const selectedPublisher = selectedPart?.publishers?.find(p => p._id === selectedPublisherId);

    const selection = {
        courseId: selectedCourseId,
        partId: selectedPartId,
        publisherId: selectedPublisherId,
        language,
    };

    const fetchCourses = async () => {
        try {
            dispatch(ShowLoading());
            const res = await plannerService.getPlannerCourses();
            setCourses(res.courses || []);
        } catch (error) {
            message.error(error?.response?.data?.message || error?.response?.data?.error || "Something went wrong");
        } finally {
            dispatch(HideLoading());
        }
    };

    const loadPlan = async () => {
        try {
            dispatch(ShowLoading());
            const res = await plannerService.getPlan(selection);
            if (res.plan) {
                setPlan(res.plan);
                setStep("calendar");
            }
            return res.plan;
        } catch (error) {
            message.error(error?.response?.data?.message || error?.response?.data?.error || "Failed to load your plan");
            return null;
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        if (!hasAccess) return;
        fetchCourses();
    }, [hasAccess]);

    useEffect(() => {
        if (!hasAccess || !returnSelection) return;
        loadPlan();
        // Clear the state so a refresh lands on the selector, not a stale plan.
        navigate(location.pathname, { replace: true, state: null });
    }, [hasAccess]);

    const handleNext = async () => {
        if (!selectedCourse || !selectedPart || !selectedPublisher || !selectedPeriod) {
            message.warning("Please select all fields to proceed.");
            return;
        }

        const existingPlan = await loadPlan();
        if (existingPlan) {
            if (existingPlan.duration !== Number(selectedPeriod)) {
                message.info(
                    "You already have a plan for this selection, so it has been opened. Reset it to create a plan with a different period."
                );
            }
            return;
        }

        try {
            dispatch(ShowLoading());
            const res = await plannerService.createPlan({
                ...selection,
                duration: Number(selectedPeriod),
            });
            setPlan(res.plan);
            setStep("calendar");
            message.success(res.message || "Your study plan is ready!");
        } catch (error) {
            message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to create your plan");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleStartDay = async (day) => {
        if (!day.isUnlocked) {
            message.warning(`Complete Day ${day.dayNumber - 1} 100% to unlock Day ${day.dayNumber}.`);
            return;
        }

        try {
            dispatch(ShowLoading());
            const res = await plannerService.getDayQuestions({
                ...selection,
                dayNumber: day.dayNumber,
            });

            if (!res.questions?.length) {
                message.warning("No questions found for this day.");
                return;
            }

            navigate("/quiz", {
                state: {
                    source: "planner",
                    courseId: selectedCourseId,
                    partId: selectedPartId,
                    publisherId: selectedPublisherId,
                    plannerDay: day.dayNumber,
                    timeRatio: selectedCourse?.timeRatio,
                    prefetchedQuestions: res.questions,
                },
            });
        } catch (error) {
            message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to load the day's questions");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleResetPlan = async () => {
        try {
            dispatch(ShowLoading());
            await plannerService.resetPlan(selection);
            setPlan(null);
            setSelectedPeriod("");
            setStep("select");
            message.success("Your plan has been reset. Choose a period to create a new one.");
        } catch (error) {
            message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to reset your plan");
        } finally {
            dispatch(HideLoading());
        }
    };

    const handleChangeSelection = () => {
        setPlan(null);
        setStep("select");
    };

    if (!hasAccess) {
        return (
            <div className="planner-locked">
                <div className="lock">🔒</div>
                <div className="heading">Planner is locked</div>
                <div className="text">
                    The Planner is available once you have purchased a course and your device is verified.
                </div>
                <button className="button" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    if (step === "calendar" && plan) {
        return (
            <PlannerCalendar
                plan={plan}
                courseName={selectedCourse?.name}
                partName={selectedPart?.name}
                publisherName={selectedPublisher?.name}
                periodLabel={PERIODS.find(p => p.value === plan.duration)?.label}
                onStartDay={handleStartDay}
                onResetPlan={handleResetPlan}
                onChangeSelection={handleChangeSelection}
            />
        );
    }

    return (
        <CoursePartSelector
            examType="planner"
            courses={courses}
            parts={selectedCourse?.parts || []}
            publishers={selectedPart?.publishers || []}
            periods={PERIODS}

            selectedCourse={selectedCourseId}
            selectedPart={selectedPartId}
            selectedPublisher={selectedPublisherId}
            selectedPeriod={selectedPeriod}

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
            onPeriodChange={(e) => setSelectedPeriod(e.target.value)}
            onNext={handleNext}
        />
    );
};

export default Planner;
