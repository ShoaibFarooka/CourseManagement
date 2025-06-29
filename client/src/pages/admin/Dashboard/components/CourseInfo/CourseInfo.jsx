import React from 'react'
import './CourseInfo.css'
import edit from '../../../../../assets/icons/edit.png'
import del from '../../../../../assets/icons/del.png'
import { message, Popconfirm } from 'antd'
import courseService from '../../../../../services/courseService'
const CourseInfo = ({ id, name, fetchAllCourses, onEdit }) => {

    const handleDeleteCourse = async (courseId) => {
        try {
            await courseService.deleteCourse(courseId);
            message.success("Course deleted successfully!");
            fetchAllCourses();
        } catch (error) {
            console.error("Failed to delete course:", error);
            message.error(
                error?.response?.data?.error || "Failed to delete course"
            );
        }
    };

    return (
        <div className='course-info'>
            <div className='heading-sm name'>{name}</div>
            <div className='actions'>
                <button className='action-btn' onClick={onEdit}>
                    <img src={edit} alt="edit" />
                </button>
                <Popconfirm
                    title="Are you sure you want to Delete?"
                    onConfirm={() => handleDeleteCourse(id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <button className="action-btn">
                        <img src={del} alt="Delete" />
                    </button>
                </Popconfirm>
            </div>
        </div>
    )
}

export default CourseInfo
