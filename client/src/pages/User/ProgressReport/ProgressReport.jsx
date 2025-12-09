import React from 'react'
import './ProgressReport.css';
import ProgressCircle from './components/ProgressCircle/ProgressCircle';
import progress1 from '../../../assets/icons/progress1.png';
import progress2 from '../../../assets/icons/progress2.png';

const ProgressReport = () => {
    return (
        <>
            <div className='progress-report'></div>

            <div className='main-title'>Progress Report</div>

            <div className='progress-report-container'>

                <div className='row-1'>

                    <div className='overall-score'>
                        <div className='heading'>Overall Score</div>
                        <ProgressCircle strokeColor="#3cd89e" />
                        <div className='sub-heading'>Your percentage is 80%</div>
                    </div>

                    <div className='answers-status'>

                        <div className='correct'>
                            <div className='correct-circle'></div>
                            <div className='numbers'><span className='highlight-correct'>14</span> Correct Answers</div>
                        </div>

                        <div className='incorrect'>
                            <div className='incorrect-circle'></div>
                            <div className='numbers'><span className='highlight-incorrect'>2</span> Incorrect Answers</div>
                        </div>
                    </div>

                    <div className='retake-assessment'>
                        <div className='logo'>
                            <img src={progress1} alt="Logo" className='img-1' />
                            <img src={progress2} alt="Logo" className='img-2' />
                        </div>
                        <div className='retake-btn-container'>
                            <button className='retake-btn'>Retake Assessment</button>
                        </div>
                    </div>
                </div>

                <div className='row-2'>
                    <div className='status-per-question'>
                        <div className='report'>
                            <div className='heading'>MCQS</div>
                            <ProgressCircle strokeColor="#A12668" />
                            <div className='sub-heading'>Your percentage is
                                <span className='highlight-mcq'> 80%</span>
                            </div>
                        </div>
                        <div className='report'>
                            <div className='heading'>Rapid</div>
                            <ProgressCircle strokeColor="#26A149" />
                            <div className='sub-heading'>Your percentage is
                                <span className='highlight-rapid'> 80%</span>
                            </div>
                        </div>
                        <div className='report'>
                            <div className='heading'>Essay</div>
                            <ProgressCircle strokeColor="#2636A1" />
                            <div className='sub-heading'>Your percentage is
                                <span className='highlight-essay'> 80%</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ProgressReport
