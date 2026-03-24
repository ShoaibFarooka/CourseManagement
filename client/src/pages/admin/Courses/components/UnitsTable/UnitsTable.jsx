import React from 'react';
import './UnitsTable.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm } from 'antd';
import { Droppable, Draggable } from '@hello-pangea/dnd';

const UnitsTable = ({
    unitData,
    onEdit,
    onManageSubunits,
    onDelete,
    partIndex,
    publisherIndex,
    selectedUnitIndexes
}) => {
    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th></th> {/* drag handle column */}
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
                <Droppable
                    droppableId={`units-${partIndex}-${publisherIndex}`}
                    type="UNIT"
                >
                    {(provided) => (
                        <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {unitData.map((unit, index) => (
                                <Draggable
                                    key={unit._id || `unit-${partIndex}-${publisherIndex}-${index}`}
                                    draggableId={unit._id || `unit-${partIndex}-${publisherIndex}-${index}`}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <tr
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                background: snapshot.isDragging ? '#f5f5f5' : '',
                                            }}
                                        >
                                            {/* Drag handle — only this cell triggers drag */}
                                            <td
                                                {...provided.dragHandleProps}
                                                style={{ cursor: 'grab', width: 24, textAlign: 'center', userSelect: 'none' }}
                                            >
                                                ⠿
                                            </td>
                                            <td>
                                                <div className="heading-sm table-h1">{index + 1}</div>
                                            </td>
                                            <td>
                                                <div className="heading-sm table-h1">{unit.name}</div>
                                            </td>
                                            <td>
                                                <div className="heading-sm table-h1">
                                                    {Array.isArray(unit.type) ? unit.type.join(', ') : ''}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-btn-wrapper">
                                                    <button
                                                        className='manage-btn'
                                                        onClick={() => onManageSubunits(index)}
                                                    >
                                                        {selectedUnitIndexes?.partIndex === partIndex &&
                                                            selectedUnitIndexes?.publisherIndex === publisherIndex &&
                                                            selectedUnitIndexes?.unitIndex === index
                                                            ? "Close"
                                                            : "Manage Subunits"}
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
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </tbody>
                    )}
                </Droppable>
            </table>
        </div>
    );
};

export default UnitsTable;