import './Questions.css';
import { useEffect, useState, useRef } from 'react';
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
import { message, Modal } from 'antd';


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
    const [mcqFile, setMcqFile] = useState(null);
    const [rapidFile, setRapidFile] = useState(null);
    const [essayFile, setEssayFile] = useState(null);


    const essayModalRef = useRef(null);
    const rapidModalRef = useRef(null);
    const mcqsModalRef = useRef(null);
    const mcqFileRef = useRef(null);
    const essayFileRef = useRef(null);
    const rapidFileRef = useRef(null);



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
        if (selectedSubunit?._id) {
            fetchQuestions(selectedSubunit._id);
        }
    };


    const handleModalClose = () => {
        const hasUnsaved =
            (questionType === 'essay' && essayModalRef.current?.hasUnsavedChanges?.()) ||
            (questionType === 'rapid' && rapidModalRef.current?.hasUnsavedChanges?.()) ||
            (questionType === 'mcq' && mcqsModalRef.current?.hasUnsavedChanges?.());

        if (hasUnsaved) {
            Modal.confirm({
                title: 'Unsaved Changes',
                content: "You have unsaved changes. If you close without saving, your changes will be lost. Are you sure?",
                okText: "Don't Save",
                cancelText: 'Cancel',
                onOk: () => {
                    handleCloseModal();
                },
            });
        } else {
            handleCloseModal();
        }
    };


    const onEdit = (questions) => {
        setEditingQuestion(questions);
        setIsOpenModal(true);
    }

    const handleUpload = async () => {
        if (!mcqFile && !essayFile && !rapidFile) {
            message.warning("Please select at least one file before uploading");
            return;
        }

        const results = [];
        dispatch(ShowLoading());

        try {
            if (mcqFile) {
                try {
                    const res = await questionServices.uploadMcqExcel(mcqFile);
                    results.push({ type: "MCQ", ...res });
                    setMcqFile(null);
                    if (mcqFileRef.current) mcqFileRef.current.value = "";
                } catch (err) {
                    console.error("MCQ upload failed:", err);
                    message.error("MCQ upload failed");
                }
            }

            if (rapidFile) {
                try {
                    const res = await questionServices.uploadRapidExcel(rapidFile);
                    results.push({ type: "Rapid", ...res });
                    setRapidFile(null);
                    if (rapidFileRef.current) rapidFileRef.current.value = "";
                } catch (err) {
                    console.error("Rapid upload failed:", err);
                    message.error("Rapid upload failed");
                }
            }

            if (essayFile) {
                try {
                    const res = await questionServices.uploadEssayExcel(essayFile);
                    results.push({ type: "Essay", ...res });
                    setEssayFile(null);
                    if (essayFileRef.current) essayFileRef.current.value = "";
                } catch (err) {
                    console.error("Essay upload failed:", err);
                    message.error("Essay upload failed");
                }
            }

            results.forEach(result => {
                if (result.warnings && result.warnings.length > 0) {
                    result.warnings.forEach(warning => {
                        window.confirm(`${result.type} Row ${warning.rowNumber}: ${warning.reason}`);
                    });
                } else {
                    message.success(`${result.type} upload complete, ${result.message}`);
                }
            });

        } catch (err) {
            console.error("Upload failed:", err);
            message.error("An unexpected error occurred during file upload.");
        } finally {
            dispatch(HideLoading());
        }
    };


    return (
        <div className="questions">

            <div className='container'>

                <div className='mcq-file'>
                    <div className='heading-md label'>Upload Mcq's</div>
                    <input
                        type="file"
                        name='mcq-file'
                        onChange={(e) => setMcqFile(e.target.files[0])}
                        ref={mcqFileRef} />
                </div>

                <div className='rapid-file'>
                    <div className='heading-md label'>Upload Rapid</div>
                    <input
                        type="file"
                        name='rapid-file'
                        onChange={(e) => setRapidFile(e.target.files[0])}
                        ref={rapidFileRef} />
                </div>

                <div className='essay-file'>
                    <div className='heading-md label'>Upload Essay</div>
                    <input
                        type="file"
                        name='essay-file'
                        onChange={(e) => setEssayFile(e.target.files[0])}
                        ref={essayFileRef} />
                </div>

                <div className='upload-btn'>
                    <button className='btn' onClick={handleUpload}>Upload</button>
                </div>

            </div>

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
                isOpen={isOpenModal} onRequestClose={handleModalClose} contentLabel='Question form'
            >
                {questionType === 'essay' && <EssayModal
                    ref={essayModalRef}
                    subUnitId={selectedSubunit?._id}
                    publisherId={selectedPublisher?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                />}

                {questionType === 'rapid' && <RapidModal
                    ref={rapidModalRef}
                    subUnitId={selectedSubunit?._id}
                    publisherId={selectedPublisher?._id}
                    question={editingQuestion}
                    onRequestClose={handleCloseModal}
                />}

                {questionType === 'mcq' && <McqsModal
                    ref={mcqsModalRef}
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
