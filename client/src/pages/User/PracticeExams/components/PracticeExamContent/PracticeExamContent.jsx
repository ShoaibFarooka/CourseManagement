import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PracticeExamContent.css';

const PracticeExamContent = ({ courseId, partId }) => {

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
                limit: examType === 'full' ? 125 : 50
            }
        });
    };

    return (
        <div className='practice-exam'>

            <div className='description'>
                Norem ipsum dolor sit amet, consectetur adipiscing elit...
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
                    Norem: ipsum dolor sit amet, consectetur
                </span>
            </div>

            <div className='description-2'>
                Norem ipsum dolor sit amet, consectetur adipiscing elit...
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
