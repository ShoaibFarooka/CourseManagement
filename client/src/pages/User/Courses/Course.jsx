import React, { useRef, useEffect, useState } from 'react'
import './Course.css';
import Sidebar from './components/Sidebar/Sidebar'
import CourseTopics from './components/CourseTopics/CourseTopics';
const Course = () => {


    return (
        <>
            <div className='course'>
                <div className='title'>DashBoard</div>
                <div className='sub-title'>Join the millions who passed with Gleim.</div>
            </div>

            <div className='course-content'>
                <Sidebar />
                <CourseTopics />
            </div>
        </>
    )
}

export default Course
