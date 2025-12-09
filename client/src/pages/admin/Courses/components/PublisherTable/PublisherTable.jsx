import React from 'react';
import './PublisherTable.css';
import edit from '../../../../../assets/icons/Edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm } from 'antd';

const PublisherTable = ({
    publishers,
    partIndex,
    onEdit,
    onManageUnits,
    onDelete,
    selectedPublisherIndexes
}) => {
    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>
                            <div className="heading-md table-h1">#</div>
                        </th>
                        <th>
                            <div className="heading-md table-h1">Publisher Name</div>
                        </th>
                        <th>
                            <div className="heading-md table-h2">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {publishers.map((publisher, index) => (
                        <tr key={index}>
                            <td>
                                <div className="heading-sm table-h1">{index + 1}</div>
                            </td>
                            <td>
                                <div className="heading-sm table-h1">{publisher.name}</div>
                            </td>
                            <td>
                                <div className="action-btn-wrapper">
                                    <button
                                        className='manage-btn'
                                        onClick={() => onManageUnits(index)}
                                    >
                                        {selectedPublisherIndexes?.partIndex === partIndex &&
                                            selectedPublisherIndexes?.publisherIndex === index
                                            ? "Close"
                                            : "Manage Units"}
                                    </button>
                                    <button className="action-btn" onClick={() => onEdit(index)}>
                                        <img src={edit} alt="Edit" />
                                    </button>
                                    <Popconfirm
                                        title="Are you sure you want to Delete?"
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

export default PublisherTable;