import './QuestionsTable.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm, Tooltip } from 'antd';


const QuestionsTable = ({ questions, onEdit, onDelete }) => {
    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className='heading-md'>#</th>
                        <th>
                            <div className="heading-md">Question Statement</div>
                        </th>
                        <th>
                            <div className="heading-md">Type</div>
                        </th>
                        <th>
                            <div className="heading-md">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map((question, index) => (
                        <tr key={question._id || index}>
                            <td>{index + 1}</td>
                            <td>
                                <Tooltip
                                    title={question.statement || question.content || question.concept}
                                    rootClassName="custom-tooltip"
                                >
                                    <div className="heading-sm table-h1 question-text">
                                        {question.statement || question.content || question.concept}
                                    </div>
                                </Tooltip>
                            </td>
                            <td>
                                {question.type}
                            </td>
                            <td>
                                <div className="action-btn-wrapper cont">
                                    <button className="action-btn" onClick={() => onEdit(question)}>
                                        <img src={edit} alt="Edit" />
                                    </button>
                                    <Popconfirm
                                        title="Are you sure you want to delete this question?"
                                        onConfirm={() => onDelete(question._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <button className="action-btn">
                                            <img src={del} alt="Delete" />
                                        </button>
                                    </Popconfirm>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default QuestionsTable;
