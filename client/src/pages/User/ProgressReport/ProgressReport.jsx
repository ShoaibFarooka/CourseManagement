import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProgressReport.css';
import ProgressCircle from './components/ProgressCircle/ProgressCircle';
import progress1 from '../../../assets/icons/progress1.png';
import progress2 from '../../../assets/icons/progress2.png';
import { useEffect } from 'react';

const ProgressReport = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        source,
        overallScore = 0,
        correctAnswers = 0,
        incorrectAnswers = 0,
        mcqScore = 0,
        rapidScore = 0,
        essayScore = 0
    } = state || {};



    useEffect(() => {
        if (!location.state?.source) {
            navigate("/dashboard");
        }
    }, [location, navigate]);


    const handleClickRetake = () => {
        navigate(`/dashboard/${source}s`);
    }

    return (
        <>
            <div className='progress-report'></div>

            <div className='main-title'>Progress Report</div>

            <div className='progress-report-container'>

                <div className='row-1'>
                    <div className='overall-score'>
                        <div className='heading'>Overall Score</div>
                        <ProgressCircle strokeColor="#3cd89e" progress={overallScore} />
                        <div className='sub-heading'>Your percentage is {overallScore}%</div>
                    </div>

                    <div className='answers-status'>
                        <div className='correct'>
                            <div className='correct-circle'></div>
                            <div className='numbers'>
                                <span className='highlight-correct'>{correctAnswers}</span> Correct Answers
                            </div>
                        </div>

                        <div className='incorrect'>
                            <div className='incorrect-circle'></div>
                            <div className='numbers'>
                                <span className='highlight-incorrect'>{incorrectAnswers}</span> Incorrect Answers
                            </div>
                        </div>
                    </div>

                    <div className='retake-assessment'>
                        <div className='logo'>
                            <img src={progress1} alt="Logo" className='img-1' />
                            <img src={progress2} alt="Logo" className='img-2' />
                        </div>
                        <div className='retake-btn-container'>
                            <button
                                className='retake-btn'
                                onClick={handleClickRetake}
                            >Retake Assessment
                            </button>
                        </div>
                    </div>
                </div>

                <div className='row-2'>
                    <div className='status-per-question'>
                        <div className='report'>
                            <div className='heading'>MCQs</div>
                            <ProgressCircle strokeColor="#A12668" progress={mcqScore} />
                            <div className='sub-heading'>Your percentage is <span className='highlight-mcq'> {mcqScore}%</span></div>
                        </div>

                        <div className='report'>
                            <div className='heading'>Rapid</div>
                            <ProgressCircle strokeColor="#26A149" progress={rapidScore} />
                            <div className='sub-heading'>Your percentage is <span className='highlight-rapid'> {rapidScore}%</span></div>
                        </div>

                        <div className='report'>
                            <div className='heading'>Essay</div>
                            <ProgressCircle strokeColor="#2636A1" progress={essayScore} />
                            <div className='sub-heading'>Your percentage is <span className='highlight-essay'> {essayScore}%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProgressReport;
