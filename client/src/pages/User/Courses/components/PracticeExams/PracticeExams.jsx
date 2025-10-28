import React from 'react'
import './PracticeExams.css';
const PracticeExams = () => {
    return (
        <div className='practice-exam'>

            <div className='description'>
                Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu
            </div>

            <div className='select-exam'>

                <div className='exam-type'>
                    <span className='exam-checkbox'><input type="checkbox" className='checkbox' /></span>
                    <span>Full Length Exam</span>
                    <span className='exam-details'>125 MCQS - 150 Minutes</span>
                </div>

                <div className='exam-type'>
                    <span className='exam-checkbox'><input type="checkbox" className='checkbox' /></span>

                    <span>Quick Diagnostic</span>
                    <span className='exam-details'>50 MCQS - 60 Minutes</span>
                </div>

                <span className='note'>Norem: ipsum dolor sit amet, consectetur</span>
            </div>

            <div className='description-2'>Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu
            </div>

            <div className='buttons-container'>
                <button className='button back'>Back</button>
                <button className='button start'>Start Exam</button>
            </div>
        </div>
    )
}

export default PracticeExams
