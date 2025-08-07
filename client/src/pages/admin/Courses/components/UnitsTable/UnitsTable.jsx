import React from 'react';
import './UnitsTable.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm } from 'antd';
const UnitsTable = ({ unitData, onEdit, onManageSubunits, onDelete, partIndex, selectedUnitIndexes }) => {

    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>
                            <div className="heading-md table-h1">#</div>
                        </th>
                        <th>
                            <div className="heading-md table-h1">Unit Name</div>
                        </th>
                        <th>
                            <div className="heading-md table-h1">Type</div>
                        </th>
                        <th>
                            <div className="heading-md table-h2">Actions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {unitData.map((unit, index) => (
                        <tr key={index}>
                            <td>
                                <div className="heading-sm table-h1">{index + 1}</div>
                            </td>
                            <td>{unit.name}</td>
                            <td>{Array.isArray(unit.type) ? unit.type.join(', ') : unit.type}</td>

                            <td>
                                <div className="action-btn-wrapper">

                                    <button className='manage-btn' onClick={() => onManageSubunits(index)}>
                                        {
                                            selectedUnitIndexes.unitIndex === index &&
                                                selectedUnitIndexes.partIndex === partIndex
                                                ? "Close"
                                                : "SubUnit's"
                                        }

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

export default UnitsTable;
