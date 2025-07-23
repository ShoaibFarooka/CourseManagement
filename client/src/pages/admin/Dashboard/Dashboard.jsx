import './Dashboard.css'
import CourseInfo from './components/CourseInfo/CourseInfo';
import { useEffect, useState, useRef } from 'react';
import CustomModal from '../../../components/CustomModal/CustomModal';
import CourseForm from './components/CourseForm/CourseForm';
import courseService from '../../../services/courseService';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import { Modal } from 'antd';

const DashBoard = () => {

    const [isOpenAddCourseModal, setIsOpenCourseModal] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [courses, setCourses] = useState([]);

    const dispatch = useDispatch();

    const courseFormRef = useRef();

    const handleClickAddCourse = () => {
        setEditCourse(null);
        setIsOpenCourseModal(true);
    }

    const handleClickCloseAddCourseModal = () => {
        setIsOpenCourseModal(false);
    }

    const handleClickCloseBtn = () => {
        const hasUnsaved = courseFormRef.current?.hasUnsavedChanges?.();

        if (hasUnsaved) {
            Modal.confirm({
                title: 'Unsaved Changes',
                content: "You have unsaved changes. If you close without saving, your changes will be lost. Are you sure?",
                okText: `Don't Save`,
                cancelText: 'Cancel',
                onOk: () => {
                    handleClickCloseAddCourseModal();
                }
            });
        } else {
            handleClickCloseAddCourseModal();
        }
    }

    const handleClickEditCourse = (course) => {
        setEditCourse(course);
        setIsOpenCourseModal(true);
    };

    const fetchAllCourses = async () => {
        try {
            dispatch(ShowLoading());
            const response = await courseService.getAllCourses();
            setCourses(response?.courses || []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
        finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, []);

    return (
        <div className='dashboard'>
            <div className='add-course-btn'>
                <button className='btn' onClick={handleClickAddCourse}>Add Course</button>
            </div>

            {courses.map((course, index) => (
                <CourseInfo
                    key={course._id}
                    index={index}
                    name={course.name}
                    id={course._id}
                    fetchAllCourses={fetchAllCourses}
                    onEdit={() => handleClickEditCourse(course)} />
            ))}

            <CustomModal isOpen={isOpenAddCourseModal} onRequestClose={handleClickCloseBtn} contentLabel='Course Form'>
                <CourseForm
                    onRequestClose={handleClickCloseAddCourseModal}
                    fetchAllCourses={fetchAllCourses}
                    initialCourseData={editCourse}
                    ref={courseFormRef}
                />
            </CustomModal>
        </div>
    )
}

export default DashBoard
