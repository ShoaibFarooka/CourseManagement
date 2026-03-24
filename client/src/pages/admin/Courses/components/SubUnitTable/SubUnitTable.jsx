import React from 'react';
import './SubUnitTable.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm } from 'antd';
import { Droppable, Draggable } from '@hello-pangea/dnd';

const SubunitTable = ({ subunitData, onEdit, onDelete, partIndex, publisherIndex, unitIndex }) => {
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
                            <div className="heading-md table-h1">Subunit Name</div>
                        </th>
                        <th>
                            <div className="heading-md table-h2">Actions</div>
                        </th>
                    </tr>
                </thead>
                <Droppable
                    droppableId={`subunits-${partIndex}-${publisherIndex}-${unitIndex}`}
                    type="SUBUNIT"
                >
                    {(provided) => (
                        <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {subunitData.map((subunit, index) => (
                                <Draggable
                                    key={subunit._id || `subunit-${partIndex}-${publisherIndex}-${unitIndex}-${index}`}
                                    draggableId={subunit._id || `subunit-${partIndex}-${publisherIndex}-${unitIndex}-${index}`}
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
                                            {/* Drag handle */}
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
                                                <div className="heading-sm table-h1">{subunit.name}</div>
                                            </td>
                                            <td>
                                                <div className="action-btn-wrapper">
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

export default SubunitTable;
