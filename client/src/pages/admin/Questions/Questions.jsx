import './Questions.css';
import { useEffect, useState, useRef } from 'react';
import SelectDropDown from '../../../components/Select/SelectDropDown';
import courseService from '../../../services/courseService';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import QuestionsTable from './components/QuestionsTable/QuestionsTable';
import CustomModal from '../../../components/CustomModal/CustomModal';
import questionServices from '../../../services/questionServices';
import { message, Modal } from 'antd';
import QuestionForm from './components/QuestionForm/QuestionForm';
import SummaryModal from './components/SummaryModal/SummaryModal';
import { FaFileUpload } from "react-icons/fa";
import { GrValidate } from "react-icons/gr";


const Questions = () => {
    const [course, setCourse] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedPublisher, setSelectedPublisher] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [questionType, setQuestionType] = useState([]);
    const [selectedSubunit, setSelectedSubunit] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [mcqFile, setMcqFile] = useState(null);
    const [rapidFile, setRapidFile] = useState(null);
    const [essayFile, setEssayFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLanguage, setSelectedLanguage] = useState([]);
    const [isOpenSummary, setIsOpenSummary] = useState(false);
    const [uploadWarnings, setUploadWarnings] = useState([]);
    const [uploadSuccess, setUploadSuccess] = useState([]);


    const languageOptions = [
        { label: 'English', value: 'eng' },
        { label: 'Arabic', value: 'ar' },
        { label: 'French', value: 'fr' },
    ];
    const ALL_QUESTION_TYPES = ['mcq', 'rapid', 'essay'];

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

    // When the selected unit changes, update available types and selected types
    useEffect(() => {
        if (selectedUnit) {
            const types = selectedUnit?.type ? selectedUnit.type : [];
            setSelectedTypes(types);
            setQuestionType(types);
        }

        if (languageOptions.length) {
            const langs = languageOptions.map(lang => lang.value);
            setSelectedLanguage(langs);
        }
    }, [selectedUnit]);


    useEffect(() => {
        if (selectedCourse?._id && selectedPart?._id && selectedPublisher?._id && selectedUnit?._id && selectedSubunit?._id && questionType) {
            fetchQuestions(selectedCourse._id, selectedPart._id, selectedPublisher._id, selectedUnit._id, selectedSubunit._id, currentPage);
        }
    }, [selectedCourse, selectedPart, selectedPublisher, selectedUnit, selectedSubunit, questionType, currentPage, selectedTypes, selectedLanguage]);

    const fetchQuestions = async (courseId, partId, publisherId, unitId, subunitId, page = 1, limit = 5) => {
        try {
            dispatch(ShowLoading());
            const response = await questionServices.getAllQuestions(
                courseId,
                partId,
                publisherId,
                unitId,
                subunitId,
                page,
                limit,
                selectedTypes,
                selectedLanguage
            );
            setQuestions(response.questions);
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
            fetchQuestions(selectedCourse._id, selectedPart._id, selectedPublisher._id, selectedUnit._id, selectedSubunit._id, currentPage);
        } catch (error) {
            message.error("Failed to delete question");
        } finally {
            dispatch(HideLoading());
        }
    };

    // --- Option helpers updated for nested structure ---
    const getCourseOptions = () =>
        course.map(c => ({ value: c._id, label: c.name }));

    // Publishers belong to a selected PART (course -> parts[] -> publishers[])
    const getPublisherOptions = () =>
        selectedPart?.publishers?.map(pub => ({
            label: pub.name,
            value: pub._id
        })) || [];

    const getPartOptions = () =>
        selectedCourse?.parts?.map(part => ({
            label: part.name,
            value: part._id
        })) || [];

    // Units belong to the selected PUBLISHER (part -> publishers[] -> units[])
    const getUnitOptions = () =>
        selectedPublisher?.units?.map(unit => ({
            label: unit.name,
            value: unit._id
        })) || [];

    const handleCheckboxChange = (type) => {
        setSelectedTypes((prev) => {
            if (prev.includes(type) && prev.length === 1) {
                return prev;
            }

            return prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type];
        });
    };

    const handleLanguageChange = (e) => {
        const value = e.target.value;
        const checked = e.target.checked;

        setSelectedLanguage((prev) => {
            if (!checked && prev.length === 1) {
                return prev;
            }

            if (checked) {
                return [...prev, value];
            } else {
                return prev.filter((lang) => lang !== value);
            }
        });
    };

    // Subunits belong to selected UNIT
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
        const courseId = selectedCourse?._id;
        const partId = selectedPart?._id;
        const publisherId = selectedPublisher?._id;
        const unitId = selectedUnit?._id;
        const subunitId = selectedSubunit?._id;

        if (courseId && partId && publisherId && unitId && subunitId) {
            fetchQuestions(courseId, partId, publisherId, unitId, subunitId, currentPage);
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

            const allWarnings = [];
            const allSuccess = [];

            results.forEach(result => {
                if (result.warnings && result.warnings.length > 0) {
                    result.warnings.forEach(warning => {
                        allWarnings.push({
                            type: result.type,
                            rowNumber: warning.rowNumber,
                            reason: warning.reason,
                        })
                    });
                }

                allSuccess.push({
                    type: result.type,
                    message: result.message
                })
            });

            setUploadWarnings(allWarnings);
            setUploadSuccess(allSuccess);

        } catch (err) {
            console.error("Upload failed:", err);
            message.error("An unexpected error occurred during file upload.");
        } finally {
            dispatch(HideLoading());
            handleOpenSummaryModal();
        }
    };
    /* 
        const handleUpload = async () => {
        if (!mcqFile && !essayFile && !rapidFile) {
            message.warning("Please select at least one file before uploading");
            return;
        }
    
        dispatch(ShowLoading());
    
        try {
            if (mcqFile) {
                await questionServices.uploadMcqExcel(mcqFile);
                setMcqFile(null);
                if (mcqFileRef.current) mcqFileRef.current.value = "";
            }
    
            if (rapidFile) {
                await questionServices.uploadRapidExcel(rapidFile);
                setRapidFile(null);
                if (rapidFileRef.current) rapidFileRef.current.value = "";
            }
    
            if (essayFile) {
                await questionServices.uploadEssayExcel(essayFile);
                setEssayFile(null);
                if (essayFileRef.current) essayFileRef.current.value = "";
            }
    
            message.success("Files uploaded successfully");
    
        } catch (err) {
            console.error("Upload failed:", err);
            message.error("An unexpected error occurred during file upload.");
        } finally {
            dispatch(HideLoading());
        }
    }; */


    const handleOpenSummaryModal = () => {
        setIsOpenSummary(true);
    }

    const handleCloseSummaryModal = () => {
        setIsOpenSummary(false);
        setUploadWarnings([]);
        setUploadSuccess([]);
    }

    const handleCheckFile = async () => {
        if (!mcqFile && !essayFile && !rapidFile) {
            message.warning("Please select at least one file before checking");
            return;
        }

        const results = [];
        dispatch(ShowLoading());

        try {
            if (mcqFile) {
                const res = await questionServices.checkMcqExcel(mcqFile);
                results.push({ type: "MCQ", ...res });
                setMcqFile(null);
                if (mcqFileRef.current) mcqFileRef.current.value = "";
            }

            if (rapidFile) {
                const res = await questionServices.checkRapidExcel(rapidFile);
                results.push({ type: "Rapid", ...res });
                setRapidFile(null);
                if (rapidFileRef.current) rapidFileRef.current.value = "";
            }

            if (essayFile) {
                const res = await questionServices.checkEssayExcel(essayFile);
                results.push({ type: "Essay", ...res });
                setEssayFile(null);
                if (essayFileRef.current) essayFileRef.current.value = "";
            }

            const allWarnings = [];
            const allSuccess = [];

            results.forEach(result => {
                if (Array.isArray(result.warnings) && result.warnings.length > 0) {
                    result.warnings.forEach(warning => {
                        allWarnings.push({
                            type: result.type,
                            rowNumber: warning.rowNumber,
                            reason: warning.reason,
                        });
                    });
                }

                allSuccess.push({
                    type: result.type,
                    message: result.message
                });
            });

            setUploadWarnings(allWarnings);
            setUploadSuccess(allSuccess);

        } catch (err) {
            console.error("File validation failed:", err);
            message.error("An unexpected error occurred during file validation.");
        } finally {
            dispatch(HideLoading());
            handleOpenSummaryModal();
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
                    <GrValidate
                        size={24}
                        className='file-btn'
                        onClick={handleCheckFile}
                    />
                    <FaFileUpload
                        size={24}
                        className='file-btn'
                        onClick={handleUpload}
                    />
                </div>

            </div>

            <CustomModal
                isOpen={isOpenSummary} onRequestClose={handleCloseSummaryModal} contentLabel='Summary Form'
            >
                <SummaryModal
                    close={handleCloseSummaryModal}
                    warnings={uploadWarnings}
                    success={uploadSuccess}
                />
            </CustomModal>

            <div className="select-course">

                <div className="heading-md label">Select Course</div>
                <SelectDropDown
                    placeholder="Select Course"
                    options={getCourseOptions()}
                    value={selectedCourse?._id || null}
                    onChange={(id) => {
                        const found = course.find(c => c._id === id);
                        setSelectedCourse(found);
                        // reset downstream selections
                        setSelectedPart(null);
                        setSelectedPublisher(null);
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
                                // reset downstream selections
                                setSelectedPublisher(null);
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
                                // publisher is inside selectedPart.publishers
                                const publisher = selectedPart?.publishers?.find(p => p._id === pubId) || null;
                                setSelectedPublisher(publisher);
                                // reset downstream
                                setSelectedUnit(null);
                                setSelectedSubunit(null);
                                setQuestionType(null);
                                setQuestions([]);
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
                            // unit is inside selectedPublisher.units
                            const unit = selectedPublisher?.units?.find(u => u._id === unitId) || null;
                            setSelectedUnit(unit);
                            setSelectedSubunit(null);
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
                            const subunit = selectedUnit?.subunits?.find(s => s._id === subunitId) || null;
                            setSelectedSubunit(subunit);
                        }}

                    />


                </div>
            )}


            {selectedSubunit && (
                <div className="select-question-type">
                    <div className="heading-md label">Select Question Types</div>
                    <div className="checkbox-group">
                        {ALL_QUESTION_TYPES.map((type) => (
                            <label key={type} className="checkbox-label">
                                <span className='label-text heading-sm'>{type.toUpperCase()}</span>
                                <input
                                    type="checkbox"
                                    value={type}
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => handleCheckboxChange(type)}
                                    disabled={!selectedTypes.includes(type)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            )}


            {
                selectedSubunit && (
                    <div className="select-language">
                        <div className="heading-md label">Select Languages</div>
                        <div className="checkbox-group">
                            {languageOptions.map((lang) => (
                                <label key={lang.value} className=" checkbox-label heading-sm">
                                    <span className='label-text'>{lang.label.toUpperCase()}</span>
                                    <input
                                        type="checkbox"
                                        value={lang.value}
                                        checked={selectedLanguage.includes(lang.value)}
                                        onChange={handleLanguageChange}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                )
            }

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
                    selectedCourse={selectedCourse}
                    selectedPart={selectedPart}
                    selectedPublisher={selectedPublisher}
                    selectedUnit={selectedUnit}
                    selectedSubunit={selectedSubunit}
                    editingQuestion={editingQuestion}
                    handleCloseModal={handleCloseModal}
                />

            </CustomModal>
        </div>
    );
};

export default Questions;
