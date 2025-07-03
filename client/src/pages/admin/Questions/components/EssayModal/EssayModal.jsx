import './EssayModal.css'
import { useEffect, useState } from 'react';
import SubQuestions from '../SubQuestionsTable/SubQuestions';
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../../../redux/loaderSlice';
import { message } from 'antd';
import questionServices from '../../../../../services/questionServices';

const EssayModal = ({ subUnitId, publisherId, question, onRequestClose }) => {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        content: '',
        subquestions: [],
    });

    const [currentSubQuestion, setCurrentSubQuestion] = useState(null);
    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);

    const [showMainFields, setShowMainFields] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [showSubmitBtn, setShowSubmitBtn] = useState(false);

    useEffect(() => {
        if (question) {
            setFormData({
                content: question.content || '',
                subquestions: question.subquestions || [],
            });
            setShowMainFields(true);
        } else {
            setFormData({ content: '', subquestions: [] });
            setShowMainFields(false);
        }
    }, [question]);

    const handleClickAddQuestion = () => {
        setShowContent(true);
        setShowMainFields(true);
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
        if (!formData.content.trim() || formData.subquestions.length === 0) {
            setErrors({
                content: !formData.content.trim() ? 'Content is required' : '',
                subquestions: formData.subquestions.length === 0 ? 'At least one subquestion is required' : ''
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

            setFormData({ content: '', subquestions: [] });
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

            <div className='add-subquestion-btn'>
                {showContent && <button className='btn' onClick={handleClickCancel}>Cancel</button>}
                <button className='btn' onClick={handleClickAddQuestion}>Add Question</button>
            </div>

            {showMainFields && (
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

                    <SubQuestions
                        subquestions={formData.subquestions}
                        onEdit={handleEditSubQuestion}
                        onDelete={handleDeleteSubQuestion}
                    />
                    {errors.subquestions && <span className='error-text'>{errors.subquestions}</span>}
                </>
            )}

            {showContent && currentSubQuestion && (
                <div className='essay-subquestions'>
                    <label className='heading-md'>Question</label>
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
                        <button className='btn' onClick={handleSaveSubQuestion}>Save</button>
                    </div>
                </div>
            )}

            {showSubmitBtn && (
                <div className='submit-btn'>
                    <button className='btn' onClick={handleFinalSubmit}>
                        {question?._id ? "Update" : "Submit"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EssayModal;
