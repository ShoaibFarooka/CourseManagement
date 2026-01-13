import React from 'react';
import './PackageExamContent.css';

const PackageExamContent = ({ onBack }) => {
    return (
        <div className='package-exam'>

            <div className='package'>
                <span className='pkg-checkbox'>
                    <input type="checkbox" className='checkbox' />
                </span>
                <span className='pkg-title'>Standard Review Package</span>
            </div>

            <div className='description'>
                Norem ipsum dolor sit amet, consectetur adipiscing elit...
            </div>

            <div className='package'>
                <span className='pkg-checkbox'>
                    <input type="checkbox" className='checkbox' />
                </span>
                <span className='pkg-title'>Mega Review Package</span>
            </div>

            <div className='description'>
                Norem ipsum dolor sit amet, consectetur adipiscing elit...
            </div>

            <div className='buttons-container'>
                <button className='button back' onClick={onBack}>Back</button>
                <button className='button update'>Update</button>
            </div>
        </div>
    );
};

export default PackageExamContent;
