import React from 'react';
import './SubBanner.css';

const SubBanner = ({ examName, onButtonClick }) => {
    return (
        <div className='sub-banner'>
            <div className='highlight'>We give you confidence, you pass the exam.</div>
            <div className='title'>Try Premium {examName} Review for free!</div>
            <div className='demo-btn'>
                <button className='button' onClick={onButtonClick}>Demo Now</button>
            </div>
        </div>
    );
};

export default SubBanner;
