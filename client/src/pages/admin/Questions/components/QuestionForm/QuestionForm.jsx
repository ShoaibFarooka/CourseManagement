import './QuestionForm.css';
import SelectDropDown from '../../../../../components/Select/SelectDropDown';
import EssayModal from '../EssayModal/EssayModal';
import RapidModal from '../RapidModal/RapidModal';
import McqsModal from '../McqsModal/McqsModal';
import { useState, useEffect } from 'react';
const QuestionForm = ({ getTypeOptions, handleCloseModal, mcqsModalRef, rapidModalRef, essayModalRef, selectedCourse, selectedPart, selectedUnit, selectedSubunit, selectedPublisher, editingQuestion, }) => {

    const [selectedType, setSelectedType] = useState(editingQuestion?.type || null);

    useEffect(() => {
        if (editingQuestion?.type) {
            setSelectedType(editingQuestion.type);
        }
    }, [editingQuestion]);

    return (
        <div className='question-form'>

            <div className='select-type'>
                <label className='heading-md'>Select Question Type</label>
                <SelectDropDown
                    placeholder='Select Type'
                    options={getTypeOptions()}
                    value={selectedType || null}
                    onChange={(type) => setSelectedType(type)}
                />

            </div>


            {selectedType === 'essay' && (
                <EssayModal
                    ref={essayModalRef}
                    courseId={selectedCourse?._id}
                    partId={selectedPart?._id}
                    publisherId={selectedPublisher?._id}
                    unitId={selectedUnit?._id}
                    subUnitId={selectedSubunit?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                />
            )}

            {selectedType === 'rapid' && (
                <RapidModal
                    ref={rapidModalRef}
                    courseId={selectedCourse._id}
                    partId={selectedPart._id}
                    publisherId={selectedPublisher?._id}
                    unitId={selectedUnit._id}
                    subUnitId={selectedSubunit?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                />
            )}

            {selectedType === 'mcq' && (
                <McqsModal
                    ref={mcqsModalRef}
                    courseId={selectedCourse._id}
                    partId={selectedPart._id}
                    publisherId={selectedPublisher?._id}
                    unitId={selectedUnit._id}
                    subUnitId={selectedSubunit?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                />
            )}

        </div>
    )
}

export default QuestionForm
