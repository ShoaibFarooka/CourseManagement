import React, { useState } from 'react';
import './SubUnitTable.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm } from 'antd';
import { Droppable, Draggable } from '@hello-pangea/dnd';

const SubunitTable = ({ subunitData, onEdit, onDelete, partIndex, publisherIndex, unitIndex }) => {
    // A lifted row is position:fixed, so the table stops laying out its cells and they
    // collapse to their content width. Capture the widths on pointer-down (before the
    // lift) and pin them onto the cells while the row is being dragged.
    const [cellWidths, setCellWidths] = useState(null);

    const captureCellWidths = (event) => {
        const row = event.currentTarget.closest('tr');
        if (!row) return;
        setCellWidths(Array.from(row.children).map((cell) => cell.getBoundingClientRect().width));
    };

    const dragHandleCellProps = (dragHandleProps) => ({
        ...dragHandleProps,
        onMouseDown: (event) => {
            captureCellWidths(event);
            dragHandleProps?.onMouseDown?.(event);
        },
        onTouchStart: (event) => {
            captureCellWidths(event);
            dragHandleProps?.onTouchStart?.(event);
        },
    });

    const cellStyle = (isDragging, columnIndex, base) => ({
        ...base,
        ...(isDragging && cellWidths ? { width: cellWidths[columnIndex] } : {}),
    });

    const rowStyle = (provided, snapshot) => ({
        ...provided.draggableProps.style,
        ...(snapshot.isDragging
            ? {
                background: 'var(--bg-sidebar)',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow)',
            }
            : {}),
    });

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
                                            style={rowStyle(provided, snapshot)}
                                        >
                                            {/* Drag handle */}
                                            <td
                                                {...dragHandleCellProps(provided.dragHandleProps)}
                                                style={cellStyle(snapshot.isDragging, 0, { cursor: 'grab', width: 24, textAlign: 'center', userSelect: 'none' })}
                                            >
                                                ⠿
                                            </td>
                                            <td style={cellStyle(snapshot.isDragging, 1)}>
                                                <div className="heading-sm table-h1">{index + 1}</div>
                                            </td>
                                            <td style={cellStyle(snapshot.isDragging, 2)}>
                                                <div className="heading-sm table-h1">{subunit.name}</div>
                                            </td>
                                            <td style={cellStyle(snapshot.isDragging, 3)}>
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
