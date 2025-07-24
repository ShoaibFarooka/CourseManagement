import './Questions.css';
import { useEffect, useState, useRef } from 'react';
import SelectDropDown from '../../../components/Select/SelectDropDown';
import courseService from '../../../services/courseService';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import QuestionsTable from '../Questions/Components/QuestionsTable/QuestionsTable';
import CustomModal from '../../../components/CustomModal/CustomModal';
import questionServices from '../../../services/questionServices';
import { message, Modal } from 'antd';
import QuestionForm from './components/QuestionForm/QuestionForm';


const Questions = () => {
    const [course, setCourse] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedPublisher, setSelectedPublisher] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [questionType, setQuestionType] = useState(null);
    const [selectedSubunit, setSelectedSubunit] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [mcqFile, setMcqFile] = useState(null);
    const [rapidFile, setRapidFile] = useState(null);
    const [essayFile, setEssayFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);



    const mcqFileRef = useRef(null);
    const essayFileRef = useRef(null);
    const rapidFileRef = useRef(null);
    const essayModalRef = useRef(null);
    const rapidModalRef = useRef(null);
    const mcqsModalRef = useRef(null);




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
        if (selectedSubunit?._id && selectedPublisher?._id && questionType) {
            fetchQuestions(selectedSubunit._id, selectedPublisher._id, currentPage);
        }
    }, [selectedSubunit, selectedPublisher, questionType, currentPage, selectedTypes]);


    const fetchQuestions = async (subunitId, publisherId, page = 1, limit = 5) => {
        try {
            dispatch(ShowLoading());
            const response = await questionServices.getAllQuestions(subunitId, publisherId, page, limit);
            const allQuestions = Array.isArray(response.questions) ? response.questions : [];

            const filteredQuestions = selectedTypes.length > 0
                ? allQuestions.filter(q => selectedTypes.includes(q.type))
                : allQuestions;

            setQuestions(filteredQuestions);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
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
            fetchQuestions(selectedSubunit._id, currentPage);
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

    const handleCheckboxChange = (type) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    const getSubunitOptions = () =>
        selectedUnit?.subunits?.map(sub => ({
            label: sub.name,
            value: sub._id
        })) || [];

    const getTypeOptions = () =>
        questionType?.map((type) => ({
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value: type,
        })) || [];



    const handleOpenModal = () => {
        setEditingQuestion(null);
        setIsOpenModal(true);
    };

    const handleCloseModal = () => {
        setIsOpenModal(false);
        setEditingQuestion(null);
        if (selectedSubunit?._id && selectedPublisher?._id) {
            fetchQuestions(selectedSubunit._id, selectedPublisher._id);
        }
    };



    const handleModalClose = () => {
        const hasUnsaved =
            (questionType?.includes('essay') && essayModalRef.current?.hasUnsavedChanges?.()) ||
            (questionType?.includes('rapid') && rapidModalRef.current?.hasUnsavedChanges?.()) ||
            (questionType?.includes('mcq') && mcqsModalRef.current?.hasUnsavedChanges?.());


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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const inputName = e.target.name;

        if (file && file.name.endsWith('.xlsx')) {
            if (inputName === "essay-file") {
                setEssayFile(file);
            } else if (inputName === "rapid-file") {
                setRapidFile(file);
            } else if (inputName === "mcq-file") {
                setMcqFile(file);
            }
        } else {
            alert("Please upload a valid .xlsx file");
            e.target.value = null;
        }
    };


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
                        accept='.xlsx'
                        onChange={handleFileChange}
                        ref={mcqFileRef} />
                </div>

                <div className='rapid-file'>
                    <div className='heading-md label'>Upload Rapid</div>
                    <input
                        type="file"
                        name='rapid-file'
                        accept='.xlsx'
                        onChange={handleFileChange}
                        ref={rapidFileRef} />
                </div>

                <div className='essay-file'>
                    <div className='heading-md label'>Upload Essay</div>
                    <input
                        type="file"
                        name='essay-file'
                        accept='.xlsx'
                        onChange={handleFileChange}
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
                            setQuestionType(Array.isArray(unit?.type) ? unit.type : []);
                            setQuestions([]);
                        }}
                    />

                </div>
            )}

            {selectedUnit && questionType?.length > 0 && (
                <div className="select-question-type">
                    <div className="heading-md label">Select Question Types</div>
                    <div className="checkbox-group">
                        {questionType.map((type) => (
                            <label key={type} className="checkbox-label">
                                <span className='label-text heading-sm'>{type.toUpperCase()}</span>
                                <input
                                    type="checkbox"
                                    value={type}
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => handleCheckboxChange(type)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            )}


            {selectedUnit && selectedTypes.length > 0 && (
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

                        {totalPages > 1 && (
                            <div className="pagination-controls">

                                <button
                                    className="btn"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        return (
                                            page === 1 ||
                                            page === totalPages ||
                                            Math.abs(currentPage - page) <= 2
                                        );
                                    })
                                    .reduce((acc, page, idx, arr) => {
                                        if (idx > 0 && page - arr[idx - 1] > 1) {
                                            acc.push("ellipsis");
                                        }
                                        acc.push(page);
                                        return acc;
                                    }, [])
                                    .map((item, idx) => {
                                        if (item === "ellipsis") {
                                            return <span key={`ellipsis-${idx}`} className="ellipsis">...</span>;
                                        }

                                        return (
                                            <button
                                                key={item}
                                                className={`manage-btn page-btn ${currentPage === item ? "active" : ""}`}
                                                onClick={() => setCurrentPage(item)}
                                            >
                                                {item}
                                            </button>
                                        );
                                    })}

                                <button
                                    className="btn"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )
            }



            <CustomModal
                isOpen={isOpenModal} onRequestClose={handleModalClose} contentLabel='Question form'
            >
                <QuestionForm
                    selectedTypes={selectedTypes}
                    getTypeOptions={getTypeOptions}
                    setSelectedTypes={setSelectedTypes}
                    mcqsModalRef={mcqsModalRef}
                    rapidModalRef={rapidModalRef}
                    essayModalRef={essayModalRef}
                    selectedSubunit={selectedSubunit}
                    selectedPublisher={selectedPublisher}
                    editingQuestion={editingQuestion}
                    handleCloseModal={handleCloseModal}
                />

            </CustomModal>
        </div>
    );
};

export default Questions;
