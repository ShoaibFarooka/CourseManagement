import React from 'react'
import Navbar from '../../../components/Navbar/Navbar';
import './DashBoard.css'
import CourseInfo from '../Dashboard/components/CourseInfo/CourseInfo';
import { useState } from 'react';
import CustomModal from '../../../components/CustomModal/CustomModal';
import AddCourse from './components/AddCourse/AddCourse';
const DashBoard = () => {

    const [isOpenAddCourseModal, setIsOpenCourseModal] = useState(false);

    const handleClickAddCourse = () => {
        setIsOpenCourseModal(true);
    }

    const handleClickCloseAddCourseModal = () => {
        setIsOpenCourseModal(false);
    }
    return (
        <div className='dashboard'>
            <div className='add-course-btn'>
                <button className='btn' onClick={handleClickAddCourse}>Add Course</button>
            </div>
            <div className='content'>
                <div className='heading-md h1'>Course name</div>
                <div className='heading-md h2'>Actions</div>
            </div>
            <CourseInfo />

            <CustomModal isOpen={isOpenAddCourseModal} onRequestClose={handleClickCloseAddCourseModal} contentLabel='Add Course'>
                <AddCourse />
            </CustomModal>
        </div>
    )
}

export default DashBoard
