import './Questions.css';
import { useEffect, useState } from 'react';
import SelectDropDown from '../../../components/Select/SelectDropDown';
import courseService from '../../../services/courseService';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import QuestionsTable from '../Questions/Components/QuestionsTable/QuestionsTable';
import CustomModal from '../../../components/CustomModal/CustomModal';
import EssayModal from './Components/EssayModal/EssayModal';
import RapidModal from './Components/RapidModal/RapidModal';
import McqsModal from './components/McqsModal/McqsModal';
import questionServices from '../../../services/questionServices';
import { message } from 'antd';

const Questions = () => {
    const [course, setCourse] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedPublisher, setSelectedPublisher] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [questionType, setQuestionType] = useState(null);
    const [selectedSubunit, setSelectedSubunit] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);




    const dispatch = useDispatch();


    const fetchAllCourses = async () => {
        try {
            dispatch(ShowLoading());
            const response = await courseService.getAllCourses();
            setCourse(response?.courses || []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
        finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (selectedSubunit?._id && questionType) {
            fetchQuestions(selectedSubunit._id, questionType);
        }
    }, [selectedSubunit, questionType]);


    const fetchQuestions = async (subunitId) => {
        try {
            dispatch(ShowLoading());
            const response = await questionServices.getAllQuestions(subunitId);
            const allQuestions = Array.isArray(response.questions) ? response.questions : [];
            setQuestions(allQuestions);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            setQuestions([]);
        } finally {
            dispatch(HideLoading());
        }
    };


    const handleDeleteQuestion = async (questionId) => {
        try {
            dispatch(ShowLoading());
            await questionServices.deleteQuestion(questionId);
            message.success("Question deleted successfully");
            fetchQuestions(selectedSubunit?._id);
        } catch (error) {
            console.error("Failed to delete question:", error);
            message.error("Failed to delete question");
        } finally {
            dispatch(HideLoading());
        }
    };




    const getCourseOptions = () =>
        course.map(course => ({ value: course._id, label: course.name }));

    const getPublisherOptions = () =>
        selectedCourse?.publishers?.map(pub => ({
            label: pub.name,
            value: pub._id
        })) || [];

    const getPartOptions = () =>
        selectedCourse?.parts?.map(part => ({
            label: part.name,
            value: part._id
        })) || [];

    const getUnitOptions = () =>
        selectedPart?.units?.map(unit => ({
            label: unit.name,
            value: unit._id
        })) || [];

    const getSubunitOptions = () =>
        selectedUnit?.subunits?.map(sub => ({
            label: sub.name,
            value: sub._id
        })) || [];


    const handleOpenModal = () => {
        setEditingQuestion(null);
        setIsOpenModal(true);
    };


    const handleCloseModal = () => {
        setIsOpenModal(false);
        setEditingQuestion(null);
        fetchQuestions(selectedSubunit?._id);
    }

    const onEdit = (questions) => {
        setEditingQuestion(questions);
        setIsOpenModal(true);
    }


    return (
        <div className="questions">

            <div className="select-course">

                <div className="heading-md label">Select Course</div>
                <SelectDropDown
                    placeholder="Select Course"
                    options={getCourseOptions()}
                    value={selectedCourse?._id || null}
                    onChange={(id) => {
                        const found = course.find(course => course._id === id);
                        setSelectedCourse(found);
                        setSelectedPublisher(null);
                        setSelectedPart(null);
                        setSelectedUnit(null);
                        setSelectedSubunit(null);
                        setQuestionType(null);
                        setQuestions([]);
                    }}

                />

            </div>

            {selectedCourse && (
                <>
                    <div className="select-part">

                        <div className='heading-md label'>Select Part</div>
                        <SelectDropDown
                            placeholder="Select Part"
                            options={getPartOptions()}
                            value={selectedPart?._id || null}
                            onChange={(partId) => {
                                const part = selectedCourse.parts.find(p => p._id === partId);
                                setSelectedPart(part);
                                setSelectedUnit(null);
                                setSelectedSubunit(null);
                                setQuestionType(null);
                                setQuestions([]);
                            }}

                        />

                    </div>

                    <div className="select-publisher">

                        <div className='heading-md label'>Select Publisher</div>
                        <SelectDropDown
                            placeholder="Select Publisher"
                            options={getPublisherOptions()}
                            value={selectedPublisher?._id || null}
                            onChange={(pubId) => {
                                const publisher = selectedCourse.publishers.find(p => p._id === pubId);
                                setSelectedPublisher(publisher);
                            }}

                        />

                    </div>
                </>
            )}

            {selectedPart && selectedPublisher && (
                <div className="select-unit">

                    <div className='heading-md label'>Select Unit</div>
                    <SelectDropDown
                        placeholder="Select Unit"
                        options={getUnitOptions()}
                        value={selectedUnit?._id || null}
                        onChange={(unitId) => {
                            const unit = selectedPart.units.find(u => u._id === unitId);
                            setSelectedUnit(unit);
                            setSelectedSubunit(null);
                            setQuestionType(unit?.type || null);
                            setQuestions([]);
                        }}
                    />

                </div>
            )}


            {selectedUnit && (
                <div className="select-subunit">

                    <div className='heading-md label'>Select Subunit</div>
                    <SelectDropDown
                        placeholder="Select Subunit"
                        options={getSubunitOptions()}
                        value={selectedSubunit?._id || null}
                        onChange={(subunitId) => {
                            const subunit = selectedUnit.subunits.find(s => s._id === subunitId);
                            setSelectedSubunit(subunit);
                        }}

                    />


                </div>
            )}

            {
                selectedSubunit && (
                    <>
                        <div className='add-question-btn'>
                            <button className='btn' onClick={handleOpenModal}>
                                Add Question
                            </button>
                        </div>
                        <QuestionsTable
                            questions={questions}
                            onEdit={onEdit}
                            onDelete={handleDeleteQuestion} />
                    </>
                )
            }

            <CustomModal
                isOpen={isOpenModal} onRequestClose={handleCloseModal} contentLabel='Question form'
            >
                {questionType === 'essay' && <EssayModal
                    subUnitId={selectedSubunit?._id}
                    publisherId={selectedPublisher?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                    draftSubquestions={draftSubquestions}
                    setDraftSubquestions={setDraftSubquestions}
                />}

                {questionType === 'rapid' && <RapidModal
                    subUnitId={selectedSubunit?._id}
                    publisherId={selectedPublisher?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                />}

                {questionType === 'mcq' && <McqsModal
                    subUnitId={selectedSubunit?._id}
                    publisherId={selectedPublisher?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                />}
            </CustomModal>
        </div>
    );
};

export default Questions;
