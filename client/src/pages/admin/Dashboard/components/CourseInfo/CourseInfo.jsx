import React from 'react'
import './CourseInfo.css'
import edit from '../../../../../assets/icons/edit.png'
import del from '../../../../../assets/icons/del.png'
import { message, Popconfirm } from 'antd'
import courseService from '../../../../../services/courseService'

const CourseInfo = ({ courses = [], fetchAllCourses, onEdit }) => {


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
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th><div className="heading-md">#</div></th>
                        <th><div className="heading-md">Course Name</div></th>
                        <th><div className="heading-md">Actions</div></th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <tr key={course._id}>
                            <td><div className="heading-sm">{index + 1}</div></td>
                            <td><div className="heading-sm">{course.name}</div></td>
                            <td>
                                <div className="action-btn-wrapper">
                                    <button
                                        className="action-btn"
                                        onClick={() => onEdit(course)}
                                    >
                                        <img src={edit} alt="edit" />
                                    </button>
                                    <Popconfirm
                                        title="Are you sure you want to Delete?"
                                        onConfirm={() => handleDeleteCourse(course._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <button className="action-btn">
                                            <img src={del} alt="Delete" />
                                        </button>
                                    </Popconfirm>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CourseInfo;
