import React from 'react'
import './AddCourse.css'
import { message } from 'antd';
import PublisherTable from '../PublisherTable/PublisherTable'
import { useState } from 'react'
import PartsTable from '../PartsTable/PartsTable'
import UnitsTable from '../UnitsTable/UnitsTable'
import SubunitTable from '../SubUnitTable/SubunitTable';
const AddCourse = () => {

    const [courseData, setCourseData] = useState({
        name: "",
        publishers: [],
        parts: []
    });

    const [tempPublisher, setTempPublisher] = useState([]);
    const [showAddPublisher, setShowAddpublisher] = useState(false);
    const [editingPublisherIndex, setEditingPublisherIndex] = useState(null);
    const [editingPublisherValue, setEditingPublisherValue] = useState("");

    const handlePublisherInputChange = (e) => {
        const val = e.target.value;

        if (editingPublisherIndex !== null) {
            setEditingPublisherValue(val);
        } else {
            setTempPublisher({ name: val });
        }
    };


    const handleEditPublisher = (index) => {
        setEditingPublisherIndex(index);
        setEditingPublisherValue(courseData.publishers[index].name);
        setShowAddpublisher(true);
    };

    const handleClickAddPublisher = () => {
        setTempPublisher({ name: "" });
        setShowAddpublisher(true);
    };

    const handleClickSavePublisher = () => {
        const trimmedName = tempPublisher.name?.trim() || "";

        if (trimmedName === "") {
            message.error("Please Enter Publisher Name");
            return;
        }

        const alreadyExists = courseData.publishers.some(
            (pub) => pub.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (alreadyExists) {
            message.warning("This publisher already exists.");
            return;
        }

        setCourseData((prev) => ({
            ...prev,
            publishers: [...prev.publishers, { name: trimmedName }]
        }));

        setTempPublisher({ name: "" });
        setShowAddpublisher(false);
    };

    const handleSaveEditPublisher = () => {
        const trimmedName = editingPublisherValue.trim();
        if (!trimmedName) {
            message.error("Publisher name cannot be empty.");
            return;
        }

        const alreadyExists = courseData.publishers.some((pub, idx) =>
            idx !== editingPublisherIndex &&
            pub.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (alreadyExists) {
            message.warning("Another publisher with this name already exists.");
            setShowAddpublisher(false);
            return;
        }

        const updated = [...courseData.publishers];
        updated[editingPublisherIndex] = { name: trimmedName };

        setCourseData(prev => ({
            ...prev,
            publishers: updated
        }));

        setEditingPublisherIndex(null);
        setEditingPublisherValue("");
        setShowAddpublisher(false);
    };

    const handleDeletePublisher = (index) => {
        const updated = [...courseData.publishers];
        updated.splice(index, 1);
        setCourseData(prev => ({
            ...prev,
            publishers: updated
        }));
    };





    const [tempPart, setTempPart] = useState({ name: "" });
    const [editingPartIndex, setEditingPartIndex] = useState(null);
    const [editingPartValue, setEditingPartValue] = useState("");
    const [showAddPart, setShowAddPart] = useState(false);
    const [managedPartIndex, setManagedPartIndex] = useState(null);



    const handleManageUnits = (partIndex) => {
        setManagedPartIndex(prev => prev === partIndex ? null : partIndex);
    };


    const handleClickAddPart = () => {
        setTempPart({ name: "" });
        setShowAddPart(true);
    };

    const handlePartInputChange = (e) => {
        const val = e.target.value;
        if (editingPartIndex !== null) {
            setEditingPartValue(val);
        } else {
            setTempPart({ name: val });
        }
    };

    const handleClickSavePart = () => {
        const trimmedName = tempPart.name.trim();
        if (trimmedName === "") {
            message.error("Please enter part name");
            return;
        }

        const alreadyExists = courseData.parts.some(
            (part) => part.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (alreadyExists) {
            message.warning("This part already exists.");
            return;
        }

        const newPart = {
            name: trimmedName,
            units: []
        };

        setCourseData(prev => ({
            ...prev,
            parts: [...prev.parts, newPart]
        }));

        setTempPart({ name: "" });
        setShowAddPart(false);
    };



    const handleEditPart = (index) => {
        setEditingPartIndex(index);
        setEditingPartValue(courseData.parts[index].name);
        setShowAddPart(true);
    };

    const handleSaveEditPart = () => {
        const trimmedName = editingPartValue.trim();
        if (!trimmedName) return;

        const alreadyExists = courseData.parts.some((part, idx) =>
            idx !== editingPartIndex &&
            part.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (alreadyExists) {
            message.warning("Another part with this name already exists.");
            setShowAddPart(false);
            return;
        }

        const updatedParts = [...courseData.parts];
        updatedParts[editingPartIndex] = { name: trimmedName, units: courseData.parts[editingPartIndex].units };

        setCourseData(prev => ({
            ...prev,
            parts: updatedParts
        }));

        setEditingPartIndex(null);
        setEditingPartValue("");
        setShowAddPart(false);
    };

    const handleDeletePart = (index) => {
        const updated = [...courseData.parts];
        updated.splice(index, 1);

        setCourseData(prev => ({
            ...prev,
            parts: updated
        }));
        if (managedPartIndex === index || managedPartIndex >= updated.length) {
            setManagedPartIndex(null);
        } else if (managedPartIndex > index) {
            setManagedPartIndex(prev => prev - 1);
        }

        if (
            selectedUnitIndexes.partIndex === index ||
            selectedUnitIndexes.partIndex >= updated.length
        ) {
            setSelectedUnitIndexes({ partIndex: null, unitIndex: null });
            setShowSubunitInput(false);
        }
    };


    const [tempUnit, setTempUnit] = useState({ name: "", type: "" });
    const [selectedPartIndex, setSelectedPartIndex] = useState(null);
    const [editingUnitIndex, setEditingUnitIndex] = useState(null);

    const handleClickAddUnit = (partIndex) => {
        setSelectedPartIndex(partIndex);
        setEditingUnitIndex(null);
        setTempUnit({ name: "", type: "" });
    };

    const handleEditUnit = (partIndex, unitIndex) => {
        const unit = courseData.parts[partIndex].units[unitIndex];
        setSelectedPartIndex(partIndex);
        setEditingUnitIndex(unitIndex);
        setTempUnit({ name: unit.name, type: unit.type });
    };

    const handleInputChangeUnit = (e) => {
        const { name, value } = e.target;
        setTempUnit((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetUnitForm = () => {
        setTempUnit({ name: "", type: "" });
        setSelectedPartIndex(null);
        setEditingUnitIndex(null);
    };


    const handleClickSaveUnit = () => {
        const unitName = tempUnit.name?.trim() || "";
        const unitType = tempUnit.type?.trim() || "";

        if (!unitName || !unitType) {
            message.error("Please fill both Unit name and type");
            return;
        }

        const existingUnits = courseData.parts[selectedPartIndex]?.units || [];

        const alreadyExists = existingUnits.some((u) =>
            u.name.trim().toLowerCase() === unitName.toLowerCase() &&
            u.type.trim().toLowerCase() === unitType.toLowerCase()
        );

        if (alreadyExists) {
            message.warning("This unit already exists.");
            return;
        }

        const newUnit = { name: unitName, type: unitType, subunits: [] };

        setCourseData((prev) => {
            const updatedParts = [...prev.parts];
            const units = [...updatedParts[selectedPartIndex].units, newUnit];
            updatedParts[selectedPartIndex] = {
                ...updatedParts[selectedPartIndex],
                units
            };
            return { ...prev, parts: updatedParts };
        });

        resetUnitForm();
    };


    const handleSaveUnit = () => {
        const unitName = tempUnit.name?.trim() || "";
        const unitType = tempUnit.type?.trim() || "";

        if (!unitName || !unitType) {
            message.error("Please fill both Unit name and type");
            return;
        }

        const existingUnits = courseData.parts[selectedPartIndex]?.units || [];

        const alreadyExists = existingUnits.some((u, idx) =>
            idx !== editingUnitIndex &&
            u.name.trim().toLowerCase() === unitName.toLowerCase() &&
            u.type.trim().toLowerCase() === unitType.toLowerCase()
        );

        if (alreadyExists) {
            message.warning("Another unit with this name and type already exists.");
            return;
        }

        const updatedParts = [...courseData.parts];
        const updatedUnits = [...updatedParts[selectedPartIndex].units];
        updatedUnits[editingUnitIndex] = {
            ...updatedUnits[editingUnitIndex],
            name: unitName,
            type: unitType
        };
        updatedParts[selectedPartIndex].units = updatedUnits;

        setCourseData({ ...courseData, parts: updatedParts });
        resetUnitForm();
    };

    const handleDeleteUnit = (partIndex, unitIndex) => {
        const updatedParts = [...courseData.parts];
        const updatedUnits = [...updatedParts[partIndex].units];
        updatedUnits.splice(unitIndex, 1);
        updatedParts[partIndex].units = updatedUnits;

        setCourseData(prev => ({
            ...prev,
            parts: updatedParts
        }));
    };




    const [tempSubUnit, setTempSubUnit] = useState({ name: "" });
    const [selectedUnitIndexes, setSelectedUnitIndexes] = useState({ partIndex: null, unitIndex: null });
    const [editingSubunitIndex, setEditingSubunitIndex] = useState(null);
    const [showSubunitInput, setShowSubunitInput] = useState(false);


    const handleChangeSubUnit = (e) => {
        const { value } = e.target;
        setTempSubUnit({ name: value });
    };


    const handleClickAddSubUnit = (partIndex, unitIndex) => {
        setSelectedUnitIndexes({ partIndex, unitIndex });
        setTempSubUnit({ name: "" });
        setEditingSubunitIndex(null);
        setShowSubunitInput(true);

    };


    const handleClickSaveSubUnit = () => {
        const name = tempSubUnit.name.trim();
        const { partIndex, unitIndex } = selectedUnitIndexes;

        if (!name) {
            message.error("Please enter subunit name");
            return;
        }

        const existingSubunits = courseData.parts[partIndex].units[unitIndex].subunits || [];

        const alreadyExists = existingSubunits.some(
            (s) => s.name.toLowerCase() === name.toLowerCase()
        );

        if (alreadyExists) {
            message.warning("This subunit already exists");
            return;
        }

        const updatedParts = [...courseData.parts];
        const updatedUnits = [...updatedParts[partIndex].units];
        const targetUnit = { ...updatedUnits[unitIndex] };

        targetUnit.subunits = [...(targetUnit.subunits || []), { name }];
        updatedUnits[unitIndex] = targetUnit;
        updatedParts[partIndex].units = updatedUnits;

        setCourseData({ ...courseData, parts: updatedParts });
        setTempSubUnit({ name: "" });
        setShowSubunitInput(false);

    };

    const handleManageSubunits = (partIndex, unitIndex) => {
        if (
            managedPartIndex === partIndex &&
            selectedUnitIndexes.partIndex === partIndex &&
            selectedUnitIndexes.unitIndex === unitIndex
        ) {
            setSelectedUnitIndexes({ partIndex: null, unitIndex: null });
            setManagedPartIndex(null);
            setEditingSubunitIndex(null);
            setTempSubUnit({ name: "" });
            setShowSubunitInput(false);
        } else {
            setManagedPartIndex(partIndex);
            setSelectedUnitIndexes({ partIndex, unitIndex });
            setEditingSubunitIndex(null);
            setTempSubUnit({ name: "" });
            setShowSubunitInput(false);
        }
    };


    const handleEditSubunit = (index) => {
        const { partIndex, unitIndex } = selectedUnitIndexes;
        const current = courseData.parts[partIndex].units[unitIndex].subunits[index];

        setEditingSubunitIndex(index);
        setTempSubUnit({ name: current.name });
        setShowSubunitInput(true);
    };

    const handleSaveSubunit = () => {
        if (!tempSubUnit.name.trim()) {
            message.error("Subunit name required");
            return;
        }

        const { partIndex, unitIndex } = selectedUnitIndexes;
        const updatedCourse = { ...courseData };

        const subunits = updatedCourse.parts[partIndex].units[unitIndex].subunits;

        const alreadyExists = subunits.some(
            (s, idx) =>
                s.name.toLowerCase() === tempSubUnit.name.trim().toLowerCase() &&
                idx !== editingSubunitIndex
        );

        if (alreadyExists) {
            message.warning("This subunit already exists");
            return;
        }

        if (editingSubunitIndex !== null) {
            subunits[editingSubunitIndex] = { name: tempSubUnit.name };
        } else {
            subunits.push({ name: tempSubUnit.name });
        }

        setCourseData(updatedCourse);
        setTempSubUnit({ name: "" });
        setEditingSubunitIndex(null);
        setShowSubunitInput(false);
    };

    const handleDeleteSubunit = (index) => {
        const { partIndex, unitIndex } = selectedUnitIndexes;
        const updatedParts = [...courseData.parts];
        const subunits = [...updatedParts[partIndex].units[unitIndex].subunits];
        subunits.splice(index, 1);
        updatedParts[partIndex].units[unitIndex].subunits = subunits;

        setCourseData(prev => ({
            ...prev,
            parts: updatedParts
        }));
    };



    return (
        <div className='add-course'>
            <div className='heading-lg title' >Course Info</div>
            <label htmlFor="course name" className='heading-md name'>Course Name</label>
            <input type="text" name='name' placeholder='Course Name' />

            <div className='add-course-btn'>
                <button className='btn' onClick={handleClickAddPublisher}>Add Publisher</button>
            </div>


            {showAddPublisher && (
                <div className='add-publisher'>
                    <input
                        type="text"
                        placeholder="Publisher Name"
                        value={editingPublisherIndex !== null ? editingPublisherValue : tempPublisher.name}
                        onChange={handlePublisherInputChange}
                    />
                    <button
                        className="btn"
                        onClick={editingPublisherIndex !== null ? handleSaveEditPublisher : handleClickSavePublisher}
                    >
                        {editingPublisherIndex !== null ? "Save" : "Add"}
                    </button>
                </div>
            )}

            < PublisherTable
                courseData={courseData}
                onEdit={handleEditPublisher}
                onDelete={handleDeletePublisher}
            />

            <div className='add-part-btn'>
                <button className='btn' onClick={handleClickAddPart}>Add Part</button>
            </div>

            {showAddPart && (
                <div className='add-part' >
                    <input
                        type="text"
                        placeholder="Part"
                        value={editingPartIndex !== null ? editingPartValue : tempPart.name}
                        onChange={handlePartInputChange}
                    />
                    <button
                        className="btn"
                        onClick={editingPartIndex !== null ? handleSaveEditPart : handleClickSavePart}
                    >
                        Save
                    </button>
                </div>
            )}


            <PartsTable
                courseData={courseData}
                onEdit={handleEditPart}
                onManageUnits={handleManageUnits}
                onDelete={handleDeletePart}
            />


            {courseData.parts.map((part, index) => (
                <div className='unit' key={index}>
                    {managedPartIndex === index && courseData.parts[managedPartIndex] && (
                        <>
                            <div className='add-unit-btn'>
                                <button
                                    type='button'
                                    className='btn'
                                    onClick={() => handleClickAddUnit(index)}
                                >
                                    Add Unit to {part.name}
                                </button>
                            </div>

                            {selectedPartIndex === index && (
                                <div className='add-unit'>
                                    <div className='unit-content'>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Unit Name"
                                            value={tempUnit.name}
                                            onChange={handleInputChangeUnit}
                                        />
                                        <select
                                            name="type"
                                            value={tempUnit.type}
                                            onChange={handleInputChangeUnit}
                                            className="global-select"
                                        >
                                            <option value="">Select Unit Type</option>
                                            <option value="rapid">Rapid</option>
                                            <option value="mcq">MCQ</option>
                                            <option value="essay">Essay</option>
                                        </select>
                                    </div>
                                    <div className='btns'>
                                        <button className='btn' onClick={editingUnitIndex !== null ? handleSaveUnit : handleClickSaveUnit}>
                                            {editingUnitIndex !== null ? "Save" : "Add"}
                                        </button>

                                    </div>
                                </div>
                            )}

                            <UnitsTable
                                unitData={courseData.parts[index].units}
                                onEdit={(unitIndex) => handleEditUnit(index, unitIndex)}
                                onManageSubunits={(unitIndex) => handleManageSubunits(index, unitIndex)}
                                onDelete={(unitIndex) => handleDeleteUnit(index, unitIndex)}
                            />
                        </>
                    )}
                </div>
            ))}

            {managedPartIndex !== null &&
                courseData.parts[managedPartIndex] &&
                selectedUnitIndexes.partIndex === managedPartIndex &&
                courseData.parts[managedPartIndex].units[selectedUnitIndexes.unitIndex] && (
                    <div className="subunit-container">

                        <div className="add-subunit-btn">
                            <button
                                className="btn"
                                onClick={() =>
                                    handleClickAddSubUnit(
                                        selectedUnitIndexes.partIndex,
                                        selectedUnitIndexes.unitIndex
                                    )
                                }
                            >
                                Add Subunit
                            </button>
                        </div>


                        {showSubunitInput && (
                            <div className="add-subunit-form">
                                <input
                                    type="text"
                                    name="subunit"
                                    placeholder="Subunit Name"
                                    value={tempSubUnit.name}
                                    onChange={handleChangeSubUnit}
                                />
                                <button
                                    className="btn"
                                    onClick={
                                        editingSubunitIndex !== null
                                            ? handleSaveSubunit
                                            : handleClickSaveSubUnit
                                    }
                                >
                                    {editingSubunitIndex !== null ? "Save" : "Add"}
                                </button>
                            </div>
                        )}


                        <SubunitTable
                            subunitData={
                                courseData.parts[managedPartIndex].units[selectedUnitIndexes.unitIndex]
                                    .subunits || []
                            }
                            onEdit={handleEditSubunit}
                            onDelete={handleDeleteSubunit}
                        />
                    </div>
                )}

        </div>
    )
}

export default AddCourse
