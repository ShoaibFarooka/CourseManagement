import './RapidModal.css';
import SubQuestions from '../SubQuestionsTable/SubQuestions';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ShowLoading, HideLoading } from '../../../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import questionServices from '../../../../../services/questionServices';

const RapidModal = forwardRef(({ subUnitId, publisherId, question, onRequestClose }, ref) => {
    const [showContent, setShowContent] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [initialFormData, setInitialFormData] = useState(null);
    const [toggelEditBtn, setToggelEditBtn] = useState(null);


    const [formData, setFormData] = useState({
        concept: '',
        definition: '',
        subquestions: []
    });

    const [currentSubQuestion, setCurrentSubQuestion] = useState(null);
    const [errors, setErrors] = useState({});
    const [showSubmitFormBtn, setShowSubmitFormBtn] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (question) {
            const initial = {
                concept: question.concept || '',
                definition: question.definition || '',
                subquestions: question.subquestions || [],
            };
            setFormData(initial);
            setInitialFormData(initial);
        } else {
            const empty = {
                concept: '',
                definition: '',
                subquestions: [],
            };
            setFormData(empty);
            setInitialFormData(empty);
        }
    }, [question]);

    const normalize = (str) => (str || '').trim().replace(/\s+/g, ' ');

    const deepCompareRapid = (a, b) => {
        if (normalize(a.concept) !== normalize(b.concept)) return true;
        if (normalize(a.definition) !== normalize(b.definition)) return true;

        if (a.subquestions.length !== b.subquestions.length) return true;

        for (let i = 0; i < a.subquestions.length; i++) {
            const subA = a.subquestions[i];
            const subB = b.subquestions[i];

            if (normalize(subA.statement) !== normalize(subB.statement)) return true;
            if (normalize(subA.options.a.option) !== normalize(subB.options.a.option)) return true;
            if (normalize(subA.options.a.explanation) !== normalize(subB.options.a.explanation)) return true;
            if (normalize(subA.options.b.option) !== normalize(subB.options.b.option)) return true;
            if (normalize(subA.options.b.explanation) !== normalize(subB.options.b.explanation)) return true;

            if (subA.correctOption !== subB.correctOption) return true;
        }

        return false;
    };



    useImperativeHandle(ref, () => ({
        hasUnsavedChanges: () => {
            const formChanged = deepCompareRapid(formData, initialFormData);

            let subQuestionChanged = false;

            if (currentSubQuestion) {
                const normalize = (str) => (str || '').trim().replace(/\s+/g, ' ');

                const emptySub = {
                    statement: '',
                    options: {
                        a: { option: '', explanation: '' },
                        b: { option: '', explanation: '' }
                    },
                    correctOption: ''
                };

                const originalSub = editingIndex !== null
                    ? formData.subquestions[editingIndex]
                    : emptySub;

                const current = currentSubQuestion;

                subQuestionChanged =
                    normalize(current.statement) !== normalize(originalSub.statement) ||
                    normalize(current.options.a.option) !== normalize(originalSub.options.a.option) ||
                    normalize(current.options.a.explanation) !== normalize(originalSub.options.a.explanation) ||
                    normalize(current.options.b.option) !== normalize(originalSub.options.b.option) ||
                    normalize(current.options.b.explanation) !== normalize(originalSub.options.b.explanation) ||
                    current.correctOption !== originalSub.correctOption;
            }

            return formChanged || subQuestionChanged;
        }
    }));



    const handleClickAddQuestion = () => {
        setShowContent(true);
        setCurrentSubQuestion({
            statement: '',
            options: {
                a: { option: '', explanation: '' },
                b: { option: '', explanation: '' }
            },
            correctOption: ''
        });
        setEditingIndex(null);
        setErrors({});
    };

    const handleClickCancel = () => {
        setShowContent(false);
        setCurrentSubQuestion(null);
        setEditingIndex(null);
        setErrors({});
    };

    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
        if (question?._id || value.trim()) {
            setShowSubmitFormBtn(true);
        }
    };

    const handleCurrentSubChange = (e) => {
        const { name, value } = e.target;
        setCurrentSubQuestion(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };
    const handleCurrentOptionChange = (optionKey, field, value) => {
        setCurrentSubQuestion(prev => ({
            ...prev,
            options: {
                ...prev.options,
                [optionKey]: {
                    ...prev.options[optionKey],
                    [field]: value
                }
            }
        }));
        setErrors(prev => ({ ...prev, [`${field}${optionKey.toUpperCase()}`]: '' }));
    };


    const validateCurrentSub = () => {
        const newErrors = {};

        if (!formData.concept.trim()) newErrors.concept = 'Concept is required';
        if (!formData.definition.trim()) newErrors.definition = 'Definition is required';

        if (!currentSubQuestion) {
            newErrors.statement = 'Question is required';
            setErrors(newErrors);
            return false;
        }

        const sq = currentSubQuestion;
        if (!sq.statement.trim()) newErrors.statement = 'Question is required';
        if (!sq.options.a.option.trim()) newErrors.optionA = 'Option A is required';
        if (!sq.options.a.explanation.trim()) newErrors.explanationA = 'Explanation A is required';
        if (!sq.options.b.option.trim()) newErrors.optionB = 'Option B is required';
        if (!sq.options.b.explanation.trim()) newErrors.explanationB = 'Explanation B is required';
        if (!sq.correctOption.trim()) newErrors.correctOption = 'Correct option is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveSubQuestion = () => {
        if (!validateCurrentSub()) return;

        setFormData(prev => {
            const updatedSubquestions = [...prev.subquestions];
            if (editingIndex !== null) {
                updatedSubquestions[editingIndex] = currentSubQuestion;
            } else {
                updatedSubquestions.push(currentSubQuestion);
            }
            return { ...prev, subquestions: updatedSubquestions };
        });

        setCurrentSubQuestion(null);
        setEditingIndex(null);
        setShowContent(false);
        setErrors({});
        setShowSubmitFormBtn(true);
    };

    const handleEditSubQuestion = (index) => {
        const questionToEdit = formData.subquestions[index];
        setCurrentSubQuestion({ ...questionToEdit });
        setEditingIndex(index);
        setShowContent(true);
        setErrors({});
    };

    const handleSubmitForm = async () => {
        const newErrors = {};

        if (!formData.concept.trim()) newErrors.concept = 'Concept is required';
        if (!formData.definition.trim()) newErrors.definition = 'Definition is required';
        if (formData.subquestions.length === 0) newErrors.subquestions = 'At least one subquestion is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return;
        }

        try {
            dispatch(ShowLoading());
            const payload = {
                concept: formData.concept,
                definition: formData.definition,
                subquestions: formData.subquestions
            };

            if (question?._id) {
                await questionServices.updateQuestion(question._id, payload);
                message.success("Question updated successfully");
            } else {
                await questionServices.addRapidQuestion(subUnitId, publisherId, payload);
                message.success("Question submitted successfully");
            }

            setFormData({ concept: '', definition: '', subquestions: [] });
            setShowSubmitFormBtn(false);
            onRequestClose();
        } catch (err) {
            console.error("Submit error:", err);
            message.error("Failed to submit question");
        } finally {
            dispatch(HideLoading());
        }
    };


    const handleDelete = (index) => {
        const updated = [...formData.subquestions];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, subquestions: updated }));
        setShowSubmitFormBtn(true);
    };



    return (
        <div className='rapid'>
            <div className='heading-xl title'>Rapid</div>

            <>
                <div className='concept'>
                    <label htmlFor="concept" className='heading-md'>Concept</label>
                    <textarea
                        name="concept"
                        id="concept"
                        placeholder='Write Concept Here'
                        value={formData.concept}
                        onChange={handleMainChange}
                    ></textarea>
                    {errors.concept && <span className='error-text'>{errors.concept}</span>}
                </div>

                <div className='definition'>
                    <label htmlFor="definition" className='heading-md'>Definition</label>
                    <textarea
                        name="definition"
                        id="definition"
                        placeholder='Write Definition Here'
                        value={formData.definition}
                        onChange={handleMainChange}
                    ></textarea>
                    {errors.definition && <span className='error-text'>{errors.definition}</span>}
                </div>

                <div className='add-question-btn'>
                    {showContent && <button className='btn' onClick={handleClickCancel}>Cancel</button>}
                    <button className='btn' onClick={handleClickAddQuestion}>Add SubQuestion</button>
                </div>


                <SubQuestions
                    subquestions={formData.subquestions}
                    onEdit={handleEditSubQuestion}
                    onDelete={handleDelete}
                    toggelEditBtn={toggelEditBtn}
                    setToggelEditBtn={setToggelEditBtn}
                    handleClickCancel={handleClickCancel}
                />
                {errors.subquestions && <span className='error-text'>{errors.subquestions}</span>}
            </>



            {showContent && currentSubQuestion && (
                <div className='rapid-subquestions'>
                    <label htmlFor='subquestions' className='heading-md'>Question Statement</label>
                    <textarea
                        name="statement"
                        placeholder='Write Question Here'
                        value={currentSubQuestion.statement}
                        onChange={handleCurrentSubChange}
                    ></textarea>
                    {errors.statement && <span className='error-text'>{errors.statement}</span>}

                    <div className='options'>
                        <div className='option-container'>
                            <div className='option-A'>
                                <label className='heading-md'>Option A</label>
                                <input
                                    type='text'
                                    placeholder='A'
                                    value={currentSubQuestion.options.a.option}
                                    onChange={(e) => handleCurrentOptionChange('a', 'option', e.target.value)}
                                />
                                {errors.optionA && <span className='error-text'>{errors.optionA}</span>}

                                <div className='opt-A-exp'>
                                    <label htmlFor="" className='heading-md'>Explanation A</label>
                                    <textarea
                                        placeholder='Explanation A'
                                        value={currentSubQuestion.options.a.explanation}
                                        onChange={(e) => handleCurrentOptionChange('a', 'explanation', e.target.value)}
                                    />
                                    {errors.explanationA && <span className='error-text'>{errors.explanationA}</span>}
                                </div>
                            </div>

                            <div className='option-B'>
                                <label className='heading-md'>Option B</label>
                                <input
                                    type='text'
                                    placeholder='B'
                                    value={currentSubQuestion.options.b.option}
                                    onChange={(e) => handleCurrentOptionChange('b', 'option', e.target.value)}
                                />
                                {errors.optionB && <span className='error-text'>{errors.optionB}</span>}

                                <div className='opt-B-exp'>
                                    <label htmlFor="" className='heading-md'>Explanation B</label>
                                    <textarea
                                        placeholder='Explanation B'
                                        value={currentSubQuestion.options.b.explanation}
                                        onChange={(e) => handleCurrentOptionChange('b', 'explanation', e.target.value)}
                                    />
                                    {errors.explanationB && <span className='error-text'>{errors.explanationB}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='correct-option'>
                        <label htmlFor="correctOption" className='heading-md'>Correct Option</label>
                        <select
                            name="correctOption"
                            className="global-select"
                            value={currentSubQuestion.correctOption}
                            onChange={handleCurrentSubChange}
                        >
                            <option value="">Select</option>
                            <option value="a">A</option>
                            <option value="b">B</option>
                        </select>
                        {errors.correctOption && <span className='error-text'>{errors.correctOption}</span>}
                    </div>

                    <div className='submit-btn'>
                        <button className='btn' onClick={handleSaveSubQuestion}>Save SubQuestion</button>
                    </div>
                </div>
            )}

            {showSubmitFormBtn && (
                <div className='submit-btn'>
                    <button className='btn' onClick={handleSubmitForm}>
                        {question?._id ? "Update" : "Add Rapid"}
                    </button>
                </div>
            )}
        </div>

    );
});

export default RapidModal