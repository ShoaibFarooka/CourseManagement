import './McqsModal.css';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../../../redux/loaderSlice';
import questionServices from '../../../../../services/questionServices';

const McqsModal = forwardRef(({ subUnitId, publisherId, question, onRequestClose }, ref) => {
    const [formData, setFormData] = useState({
        statement: '',
        options: {
            a: { option: '', explanation: '' },
            b: { option: '', explanation: '' },
            c: { option: '', explanation: '' },
            d: { option: '', explanation: '' },
        },
        correctOption: '',
    });

    const [initialFormData, setInitialFormData] = useState({
        statement: '',
        options: {
            a: { option: '', explanation: '' },
            b: { option: '', explanation: '' },
            c: { option: '', explanation: '' },
            d: { option: '', explanation: '' },
        },
        correctOption: '',
    });


    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();

    useEffect(() => {
        const loadedData = question
            ? {
                statement: question.statement || '',
                options: question.options || {
                    a: { option: '', explanation: '' },
                    b: { option: '', explanation: '' },
                    c: { option: '', explanation: '' },
                    d: { option: '', explanation: '' },
                },
                correctOption: question.correctOption || '',
            }
            : {
                statement: '',
                options: {
                    a: { option: '', explanation: '' },
                    b: { option: '', explanation: '' },
                    c: { option: '', explanation: '' },
                    d: { option: '', explanation: '' },
                },
                correctOption: '',
            };

        setFormData(loadedData);
        setInitialFormData(loadedData);
    }, [question]);

    const deepCompare = (a, b) => {
        const normalize = (str) => str?.trim().replace(/\s+/g, ' ') || '';

        if (normalize(a.statement) !== normalize(b.statement)) return true;
        if (a.correctOption !== b.correctOption) return true;

        for (const key of ['a', 'b', 'c', 'd']) {
            if (
                normalize(a.options[key].option) !== normalize(b.options[key].option) ||
                normalize(a.options[key].explanation) !== normalize(b.options[key].explanation)
            ) {
                return true;
            }
        }

        return false;
    };

    useImperativeHandle(ref, () => ({
        hasUnsavedChanges: () => deepCompare(formData, initialFormData)
    }));



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleOptionChange = (key, field, value) => {
        setFormData(prev => ({
            ...prev,
            options: {
                ...prev.options,
                [key]: {
                    ...prev.options[key],
                    [field]: value
                }
            }
        }));
        setErrors(prev => ({ ...prev, [`${field}${key.toUpperCase()}`]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.statement.trim()) newErrors.statement = 'Question is required';

        ['a', 'b', 'c', 'd'].forEach(opt => {
            if (!formData.options[opt].option.trim()) {
                newErrors[`option${opt.toUpperCase()}`] = `Option ${opt.toUpperCase()} is required`;
            }
            if (!formData.options[opt].explanation.trim()) {
                newErrors[`explanation${opt.toUpperCase()}`] = `Explanation ${opt.toUpperCase()} is required`;
            }
        });

        if (!formData.correctOption) newErrors.correctOption = 'Correct option is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            dispatch(ShowLoading());

            if (question?._id) {
                await questionServices.updateQuestion(question._id, formData);
            } else {
                await questionServices.addMcqQuestion(subUnitId, publisherId, formData);
            }

            message.success("Question submitted successfully");
            setFormData({
                statement: '',
                options: {
                    a: { option: '', explanation: '' },
                    b: { option: '', explanation: '' },
                    c: { option: '', explanation: '' },
                    d: { option: '', explanation: '' },
                },
                correctOption: '',
            });
            onRequestClose();
        } catch (err) {
            console.error("Submission error:", err);
            message.error("Failed to submit question");
        } finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className='mcqs'>
            <div className='heading-xl title'>MCQ</div>

            <div className='mcqs-sub-form'>
                <label className='heading-md'>Question</label>
                <textarea
                    name="statement"
                    placeholder='Write question here'
                    value={formData.statement}
                    onChange={handleChange}
                ></textarea>
                {errors.statement && <span className="error-text">{errors.statement}</span>}

                {['a', 'b', 'c', 'd'].map(opt => (
                    <div key={opt} className='option'>
                        <label htmlFor="" className='heading-md'>{`Option ${opt.toUpperCase()}`}</label>
                        <input
                            type="text"
                            placeholder={`Option ${opt.toUpperCase()}`}
                            value={formData.options[opt].option}
                            onChange={(e) => handleOptionChange(opt, 'option', e.target.value)}
                        />
                        {errors[`option${opt.toUpperCase()}`] && (
                            <span className="error-text">{errors[`option${opt.toUpperCase()}`]}</span>
                        )}

                        <label htmlFor="" className='heading-md'>{`Explanation ${opt.toUpperCase()}`}</label>
                        <textarea
                            placeholder={`Explanation ${opt.toUpperCase()}`}
                            value={formData.options[opt].explanation}
                            onChange={(e) => handleOptionChange(opt, 'explanation', e.target.value)}
                        />
                        {errors[`explanation${opt.toUpperCase()}`] && (
                            <span className="error-text">{errors[`explanation${opt.toUpperCase()}`]}</span>
                        )}
                    </div>
                ))}

                <div className='correct-option'>
                    <label className='heading-md'>Correct Option</label>
                    <select
                        name="correctOption"
                        value={formData.correctOption}
                        onChange={handleChange}
                        className='global-select'
                    >
                        <option value="">Select</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                    </select>
                    {errors.correctOption && <span className="error-text">{errors.correctOption}</span>}
                </div>

                <div className='submit-btn'>
                    <button className='btn' onClick={handleSubmit}>
                        {question?._id ? 'Update' : 'Add Mcq'}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default McqsModal;
