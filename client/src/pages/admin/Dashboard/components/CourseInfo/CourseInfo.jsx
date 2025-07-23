import React from 'react'
import './CourseInfo.css'
import edit from '../../../../../assets/icons/edit.png'
import del from '../../../../../assets/icons/del.png'
import { message, Popconfirm } from 'antd'
import courseService from '../../../../../services/courseService'

const CourseInfo = ({ id, name, fetchAllCourses, onEdit, index }) => {

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
                        <th>
                            <div className="heading-md table-h1">#</div>
                        </th>
                        <th>
                            <div className="heading-md table-h1">Course Name</div>
                        </th>
                        <th>
                            <div className="heading-md table-h2">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div className="heading-sm table-h1">{index + 1}</div>
                        </td>
                        <td>
                            <div className="heading-sm table-h1">{name}</div>
                        </td>
                        <td>
                            <div className="action-btn-wrapper">
                                <button className="action-btn" onClick={onEdit}>
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
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default CourseInfo
