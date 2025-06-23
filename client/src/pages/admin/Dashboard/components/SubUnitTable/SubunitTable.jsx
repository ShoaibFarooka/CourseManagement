import React from 'react';
import './SubunitTable.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';

const SubunitTable = ({ subunitData, onEdit, onDelete }) => {
    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>
                            <div className="heading-md table-h1">Subunit Name</div>
                        </th>
                        <th>
                            <div className="heading-md table-h2">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {subunitData.map((subunit, index) => (
                        <tr key={index}>
                            <td>{subunit.name}</td>
                            <td>
                                <div className="action-btn-wrapper">
                                    <button className="action-btn" onClick={() => onEdit(index)}>
                                        <img src={edit} alt="Edit" />
                                    </button>
                                    <button className="action-btn" onClick={() => onDelete()}>
                                        <img src={del} alt="Delete" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubunitTable;
