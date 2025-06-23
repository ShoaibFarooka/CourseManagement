import React from 'react'
import './CourseInfo.css'
import edit from '../../../../../assets/icons/edit.png'
import del from '../../../../../assets/icons/del.png'
const CourseInfo = () => {
    return (
        <div className='course-info'>
            <div className='heading-sm name'>Course name</div>
            <div className='actions'>
                <button className='action-btn'><img src={edit} alt="edit" /></button>
                <button className='action-btn'><img src={del} alt="delete" /></button>
            </div>
        </div>
    )
}

export default CourseInfo
