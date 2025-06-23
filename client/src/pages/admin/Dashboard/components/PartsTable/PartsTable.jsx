import React from 'react'
import './PartsTable.css';;
import edit from '../../../../../assets/icons/Edit.png';
import del from '../../../../../assets/icons/del.png';
const PartsTable = ({ courseData, onEdit, onManageUnits, onDelete }) => {


    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>
                            <div className="heading-md table-h1">Name</div>
                        </th>
                        <th>
                            <div className="heading-md table-h2">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {courseData.parts.map((part, index) => (
                        <tr key={index}>
                            <td>
                                <div className="heading-sm table-h1">{part.name}</div>
                            </td>
                            <td>
                                <div className="action-btn-wrapper">
                                    <button className='manage-btn'
                                        onClick={() => onManageUnits(index)}
                                    >
                                        manage unit</button>
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
    )
}

export default PartsTable
