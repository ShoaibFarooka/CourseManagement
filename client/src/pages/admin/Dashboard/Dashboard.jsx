import './Dashboard.css'
import CourseInfo from './components/CourseInfo/CourseInfo';
import { useEffect, useState } from 'react';
import CustomModal from '../../../components/CustomModal/CustomModal';
import CourseForm from './components/CourseForm/CourseForm';
import courseService from '../../../services/courseService';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';

const DashBoard = () => {

    const [isOpenAddCourseModal, setIsOpenCourseModal] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [courses, setCourses] = useState([]);

    const dispatch = useDispatch();

    const handleClickAddCourse = () => {
        setEditCourse(null);
        setIsOpenCourseModal(true);
    }

    const handleClickCloseAddCourseModal = () => {
        setIsOpenCourseModal(false);
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
            <div className='content'>
                <div className='heading-md h1'>Course name</div>
                <div className='heading-md h2'>Actions</div>
            </div>

            {courses.map((course) => (
                <CourseInfo
                    key={course._id}
                    name={course.name}
                    id={course._id}
                    fetchAllCourses={fetchAllCourses}
                    onEdit={() => handleClickEditCourse(course)} />
            ))}

            <CustomModal isOpen={isOpenAddCourseModal} onRequestClose={handleClickCloseAddCourseModal} contentLabel='Course Form'>
                <CourseForm
                    onRequestClose={handleClickCloseAddCourseModal}
                    fetchAllCourses={fetchAllCourses}
                    initialCourseData={editCourse}
                />
            </CustomModal>
        </div>
    )
}

export default DashBoard
