import './SubQuestions.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm, Tooltip } from 'antd';
import CrossIcon from '../../../../../assets/icons/cross_icon.svg?react';

const SubQuestions = ({ subquestions = [], onEdit = () => { }, onDelete = () => { }, toggelEditBtn, setToggelEditBtn, handleClickCancel }) => {


    const handleToggleEdit = (index) => {
        if (toggelEditBtn === index) {
            setToggelEditBtn(null);
            handleClickCancel();
        } else {
            setToggelEditBtn(index);
            onEdit(index);
        }
    };

    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>
                            <div className="heading-md table-h1">Sub-Question</div>
                        </th>
                        <th>
                            <div className="heading-md table-h2">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {subquestions.map((sub, index) => (
                        <tr key={index}>
                            <td>
                                <Tooltip
                                    title={sub.statement}
                                    rootClassName="custom-tooltip"
                                >
                                    <span
                                        className="heading-sm table-h1 question-text"
                                        onClick={() => alert("Full sub-question clicked")}
                                    >
                                        {sub.statement.length > 60
                                            ? `${sub.statement.slice(0, 60)}...`
                                            : sub.statement}
                                    </span>
                                </Tooltip>
                            </td>
                            <td>
                                <div className="action-btn-wrapper">
                                    <button
                                        className="action-btn"
                                        onClick={() => handleToggleEdit(index)}
                                    >
                                        {toggelEditBtn === index ? (
                                            <span style={{ fontSize: "18px" }}>❌</span>
                                        ) : (
                                            <img src={edit} alt="Edit" />
                                        )}
                                    </button>
                                    <Popconfirm
                                        title="Are you sure you want to delete this sub-question?"
                                        onConfirm={() => onDelete(index)}
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

export default SubQuestions;
