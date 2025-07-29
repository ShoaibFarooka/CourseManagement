import './EssayModal.css'
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import SubQuestions from '../SubQuestionsTable/SubQuestions';
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../../../redux/loaderSlice';
import { message } from 'antd';
import questionServices from '../../../../../services/questionServices';
import SelectDropDown from '../../../../../components/Select/SelectDropDown';

const EssayModal = forwardRef(({ subUnitId, publisherId, question, onRequestClose }, ref) => {

    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        content: '',
        subquestions: [],
        language: '',
    });


    const [initialFormData, setInitialFormData] = useState(null);


    const [currentSubQuestion, setCurrentSubQuestion] = useState(null);
    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);

    const [showContent, setShowContent] = useState(false);
    const [showSubmitBtn, setShowSubmitBtn] = useState(false);
    const [toggelEditBtn, setToggelEditBtn] = useState(null);

    const deepCompare = (a, b) => {
        const normalizeContent = (str) => str?.trim().replace(/\s+/g, ' ') || '';

        if (a.language !== b.language) return true;

        if (normalizeContent(a.content) !== normalizeContent(b.content)) return true;

        if (a.subquestions?.length !== b.subquestions?.length) return true;

        for (let i = 0; i < a.subquestions.length; i++) {
            const sa = a.subquestions[i];
            const sb = b.subquestions[i];

            if (
                normalizeContent(sa.statement) !== normalizeContent(sb.statement) ||
                normalizeContent(sa.optionA) !== normalizeContent(sb.optionA) ||
                normalizeContent(sa.optionB) !== normalizeContent(sb.optionB) ||
                normalizeContent(sa.explanationA) !== normalizeContent(sb.explanationA) ||
                normalizeContent(sa.explanationB) !== normalizeContent(sb.explanationB) ||
                sa.correctOption !== sb.correctOption
            ) {
                return true;
            }
        }

        return false;
    };


    useImperativeHandle(ref, () => ({
        hasUnsavedChanges: () => {
            const normalize = (str) => str?.trim().replace(/\s+/g, ' ') || '';

            const formChanged = deepCompare(formData, initialFormData);

            let subChanged = false;
            if (currentSubQuestion) {
                const emptySub = { statement: '', explanation: '' };
                const originalSub =
                    editingIndex !== null
                        ? formData.subquestions[editingIndex]
                        : emptySub;

                subChanged =
                    normalize(currentSubQuestion.statement) !== normalize(originalSub.statement) ||
                    normalize(currentSubQuestion.explanation) !== normalize(originalSub.explanation);
            }

            return formChanged || subChanged;
        },
    }));




    useEffect(() => {
        if (question) {
            const initial = {
                content: question.content || '',
                subquestions: question.subquestions || [],
                language: question.language || null,
            };

            setFormData(initial);
            setInitialFormData(initial);
        } else {
            const empty = { language: null, content: '', subquestions: [] };
            setFormData(empty);
            setInitialFormData(empty);
        }
    }, [question]);


    const handleClickAddQuestion = () => {
        setShowContent(true);
        setEditingIndex(null);
        setCurrentSubQuestion({
            statement: '',
            explanation: '',
        });
        setErrors({});
    };

    const handleClickCancel = () => {
        setShowContent(false);
        setEditingIndex(null);
        setCurrentSubQuestion(null);
        setErrors({});
    };


    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));

        if (question?._id || value.trim()) {
            setShowSubmitBtn(true);
        }
    };

    const getLanguageOptions = () => [
        { label: "English", value: "eng" },
        { label: "Arabic", value: "ar" },
        { label: "French", value: "fr" }
    ];


    const handleLanguageChange = (value) => {
        setFormData(prev => ({ ...prev, language: value }));
        setErrors(prev => ({ ...prev, language: '' }));
    };


    const handleSubChange = (e) => {
        const { name, value } = e.target;
        setCurrentSubQuestion(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateSubquestion = () => {
        const newErrors = {};

        if (!formData.content.trim()) newErrors.content = 'Content is required';
        if (!currentSubQuestion?.statement?.trim()) newErrors.statement = 'Question is required';
        if (!currentSubQuestion?.explanation?.trim()) newErrors.explanation = 'Explanation is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveSubQuestion = () => {
        if (!validateSubquestion()) return;

        setFormData(prev => {
            const updated = [...prev.subquestions];
            if (editingIndex !== null) {
                updated[editingIndex] = currentSubQuestion;
            } else {
                updated.push(currentSubQuestion);
            }
            return { ...prev, subquestions: updated };
        });

        setCurrentSubQuestion(null);
        setEditingIndex(null);
        setShowContent(false);
        setShowSubmitBtn(true);
        setToggelEditBtn(null);
    };

    const handleEditSubQuestion = (index) => {
        const sub = formData.subquestions[index];
        setCurrentSubQuestion({ ...sub });
        setEditingIndex(index);
        setShowContent(true);
        setErrors({});
    };

    const handleDeleteSubQuestion = (index) => {
        const updated = [...formData.subquestions];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, subquestions: updated }));
        setShowSubmitBtn(true);
    };

    const handleFinalSubmit = async () => {
        if (!formData.language.trim() || !formData.content.trim() || formData.subquestions.length === 0) {
            setErrors({
                language: !formData.language.trim() ? 'Language is required' : '',
                content: !formData.content.trim() ? 'Content is required' : '',
                subquestions: formData.subquestions.length === 0 ? 'At least one subquestion is required' : '',
            });
            return;
        }


        try {
            dispatch(ShowLoading());

            if (question?._id) {
                await questionServices.updateQuestion(question._id, formData);
                message.success("Essay updated successfully");
            } else {
                await questionServices.addEssayQuestion(subUnitId, publisherId, formData);
                message.success("Essay submitted successfully");
            }

            setFormData({ content: '', subquestions: [], language: '' });
            setShowSubmitBtn(false);
            onRequestClose();
        } catch (err) {
            console.error("Essay submit error:", err);
            message.error("Failed to submit essay");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className='essay'>
            <div className='heading-xl title'>Essay</div>

            <div className='language-dropdown'>
                <label className='heading-md'>Select Language</label>
                <SelectDropDown
                    options={getLanguageOptions()}
                    value={formData.language}
                    onChange={handleLanguageChange}
                    placeholder='Choose a language'
                />
                {errors.language && <span className='error-text'>{errors.language}</span>}
            </div>



            <>
                <div className='content'>
                    <label className='heading-md'>Content</label>
                    <textarea
                        name="content"
                        placeholder='Write content here'
                        value={formData.content}
                        onChange={handleMainChange}
                    />
                    {errors.content && <span className='error-text'>{errors.content}</span>}
                </div>

                <div className='add-subquestion-btn'>
                    {showContent && <button className='btn' onClick={handleClickCancel}>Cancel</button>}
                    <button className='btn' onClick={handleClickAddQuestion}>Add SubQuestion</button>
                </div>

                <SubQuestions
                    subquestions={formData.subquestions}
                    onEdit={handleEditSubQuestion}
                    onDelete={handleDeleteSubQuestion}
                    toggelEditBtn={toggelEditBtn}
                    setToggelEditBtn={setToggelEditBtn}
                    handleClickCancel={handleClickCancel}
                />
                {errors.subquestions && <span className='error-text'>{errors.subquestions}</span>}
            </>


            {showContent && currentSubQuestion && (
                <div className='essay-subquestions'>
                    <label className='heading-md'>Question Statement</label>
                    <textarea
                        name="statement"
                        placeholder='Write Question'
                        value={currentSubQuestion.statement}
                        onChange={handleSubChange}
                    />
                    {errors.statement && <span className='error-text'>{errors.statement}</span>}

                    <label className='heading-md'>Explanation</label>
                    <textarea
                        name="explanation"
                        placeholder='Write Explanation'
                        value={currentSubQuestion.explanation}
                        onChange={handleSubChange}
                    />
                    {errors.explanation && <span className='error-text'>{errors.explanation}</span>}

                    <div className='submit-btn'>
                        <button className='btn' onClick={handleSaveSubQuestion}>Save SubQuestion</button>
                    </div>
                </div>
            )}

            {showSubmitBtn && (
                <div className='submit-btn'>
                    <button className='btn' onClick={handleFinalSubmit}>
                        {question?._id ? "Update" : "Add Essay"}
                    </button>
                </div>
            )}
        </div>
    );
});

export default EssayModal;