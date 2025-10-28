import React from 'react'
import './PackageExams.css';
const PackageExams = () => {
    return (
        <div className='package-exam'>

            <div className='package'>
                <span className='pkg-checkbox'><input type="checkbox" className='checbox' /></span>
                <span className='pkg-title'>Standard Review Package</span>
            </div>

            <div className='description'>
                Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu
            </div>

            <div className='package'>
                <span className='pkg-checkbox'><input type="checkbox" className='checbox' /></span>
                <span className='pkg-title'>Mega Review Package</span>
            </div>

            <div className='description'>
                Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu
            </div>

            <div className='buttons-container'>
                <button className='button back'>Back</button>
                <button className='button update'>Update</button>
            </div>
        </div>
    )
}

export default PackageExams
