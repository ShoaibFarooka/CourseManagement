import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PracticeExamContent.css';

const PracticeExamContent = ({ courseId, partId, timeRatio }) => {

    const [examType, setExamType] = useState(null);
    const navigate = useNavigate();

    const handleCheckboxChange = (type) => {
        setExamType(type);
    };

    const handleStartExam = () => {
        if (!examType) return;

        navigate('/quiz', {
            state: {
                source: "practice-exam",
                courseId,
                partId,
                examType,
                limit: examType === 'full' ? 125 : 50,
                timeRatio,
            }
        });
    };

    return (
        <div className='practice-exam'>

            <div className='description'>
                Choose your exam format below. Full Length Exam simulates the complete test experience, while Quick Diagnostic provides a faster assessment of your knowledge.
            </div>

            <div className='select-exam'>

                <div className='exam-type'>
                    <span className='exam-checkbox'>
                        <input
                            type="radio"
                            className='checkbox'
                            checked={examType === 'full'}
                            onChange={() => handleCheckboxChange('full')}
                        />
                    </span>
                    <span>Full Length Exam</span>
                    <span className='exam-details'>125 MCQS</span>
                </div>

                <div className='exam-type'>
                    <span className='exam-checkbox'>
                        <input
                            type="radio"
                            className='checkbox'
                            checked={examType === 'quick'}
                            onChange={() => handleCheckboxChange('quick')}
                        />
                    </span>
                    <span>Quick Diagnostic</span>
                    <span className='exam-details'>50 MCQS</span>
                </div>

                <span className='note'>
                    Note: Both exams are timed based on the course settings and cover all topics
                </span>
            </div>

            <div className='description-2'>
                Your progress will be tracked and you can review your answers after submission. Make sure you have sufficient time before starting the exam.
            </div>

            <div className='buttons-container'>
                <button
                    className='button start'
                    disabled={!examType}
                    onClick={handleStartExam}
                >
                    Start Exam
                </button>
            </div>

        </div>
    );
};

export default PracticeExamContent;
