import './SubQuestions.css';
import React, { useState } from 'react';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm, Tooltip, Pagination } from 'antd';

const SubQuestions = ({
    subquestions = [],
    onEdit = () => { },
    onDelete = () => { },
    toggelEditBtn,
    setToggelEditBtn,
    handleClickCancel,
}) => {


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(subquestions.length / itemsPerPage);


    const handleToggleEdit = (index) => {
        if (toggelEditBtn === index) {
            setToggelEditBtn(null);
            handleClickCancel();
        } else {
            setToggelEditBtn(index);
            onEdit(index);
        }
    };

    const paginatedSubQuestions = subquestions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className='heading-md'>#</th>
                        <th>
                            <div className="heading-md">Sub-Question</div>
                        </th>
                        <th>
                            <div className="heading-md">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedSubQuestions.map((sub, index) => {
                        const actualIndex = (currentPage - 1) * itemsPerPage + index;
                        return (
                            <tr key={actualIndex}>
                                <td>{index + 1}</td>
                                <td>
                                    <Tooltip
                                        title={sub.statement}
                                        rootClassName="custom-tooltip"
                                    >
                                        <span
                                            className="heading-sm table-h1 question-text"
                                            onClick={() => alert('Full sub-question clicked')}
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
                                            onClick={() => handleToggleEdit(actualIndex)}
                                        >
                                            {toggelEditBtn === actualIndex ? (
                                                <span style={{ fontSize: '18px' }}>❌</span>
                                            ) : (
                                                <img src={edit} alt="Edit" />
                                            )}
                                        </button>
                                        <Popconfirm
                                            title="Are you sure you want to delete this sub-question?"
                                            onConfirm={() => onDelete(actualIndex)}
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
                        );
                    })}
                </tbody>
            </table>

            {subquestions.length > itemsPerPage && (
                <div className="pagination-controls">
                    <button
                        className={`manage-btn ${currentPage === 1 ? "disabled" : ""}`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                className={`manage-btn page-btn ${currentPage === page ? "active-page" : ""}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        className={`manage-btn ${currentPage === totalPages ? "disabled" : ""}`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

        </div>
    );
};

export default SubQuestions;
