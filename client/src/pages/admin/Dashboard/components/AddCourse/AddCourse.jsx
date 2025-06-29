import './AddCourse.css'
import PublisherTable from '../PublisherTable/PublisherTable'
import { useState, useEffect } from 'react'
import PartsTable from '../PartsTable/PartsTable'
import UnitsTable from '../UnitsTable/UnitsTable'
import SubunitTable from '../SubUnitTable/SubunitTable';
import { useRef } from 'react';
import { message } from 'antd';
import courseService from '../../../../../services/courseService';


const AddCourse = ({ onRequestClose, fetchAllCourses, initialCourseData }) => {

    const [tempPublisher, setTempPublisher] = useState([]);
    const [showAddPublisher, setShowAddpublisher] = useState(false);
    const [editingPublisherIndex, setEditingPublisherIndex] = useState(null);
    const [editingPublisherValue, setEditingPublisherValue] = useState("");


    const [tempPart, setTempPart] = useState({ name: "" });
    const [editingPartIndex, setEditingPartIndex] = useState(null);
    const [editingPartValue, setEditingPartValue] = useState("");
    const [showAddPart, setShowAddPart] = useState(false);
    const [managedPartIndex, setManagedPartIndex] = useState(null);

    const [tempUnit, setTempUnit] = useState({ name: "", type: "" });
    const [selectedPartIndex, setSelectedPartIndex] = useState(null);
    const [editingUnitIndex, setEditingUnitIndex] = useState(null);


    const [tempSubUnit, setTempSubUnit] = useState({ name: "" });
    const [selectedUnitIndexes, setSelectedUnitIndexes] = useState({ partIndex: null, unitIndex: null });
    const [editingSubunitIndex, setEditingSubunitIndex] = useState(null);
    const [showSubunitInput, setShowSubunitInput] = useState(false);


    const [courseData, setCourseData] = useState({
        name: "",
        publishers: [],
        parts: []
    });


    const [errors, setErrors] = useState({});

    const setFieldError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };


    const partInputRef = useRef(null);
    const publisherInputRef = useRef(null);
    const unitInputRef = useRef(null);
    const subUnitInputRef = useRef(null);
    const unitSectionRef = useRef(null);
    const subUnitSectionRef = useRef(null);

    useEffect(() => {
        if (initialCourseData) {
            setCourseData(initialCourseData);
        }
    }, [initialCourseData]);

    const clearFieldError = (field) => {
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };


    const validateField = ({
        value,
        fieldKey,
        label,
        existingItems = [],
        duplicateCheck = true,
        duplicateCompare = (item) => item?.toLowerCase(),
        excludeIndex = null,
    }) => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            setFieldError(fieldKey, `Please enter ${label}`);
            return { isValid: false, value: trimmedValue };
        }

        if (duplicateCheck) {
            const isDuplicate = existingItems.some((item, idx) => {
                if (excludeIndex !== null && idx === excludeIndex) return false;
                return duplicateCompare(item) === trimmedValue.toLowerCase();
            });

            if (isDuplicate) {
                setFieldError(fieldKey, `${label} already exists`);
                return { isValid: false, value: trimmedValue };
            }
        }

        clearFieldError(fieldKey);
        return { isValid: true, value: trimmedValue };
    };

    const handleCourseInputchange = (e) => {
        setCourseData(prev => ({ ...prev, name: e.target.value }));
    };


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

    const handleCloseEditPublisher = () => {
        setEditingPublisherIndex(null);
        setEditingPublisherValue("");
        setTempPublisher({ name: "" });
        setShowAddpublisher(false);
    }

    const handleClickAddPublisher = () => {
        setTempPublisher({ name: "" });
        clearFieldError("publisher");
        setShowAddpublisher(true);

        setTimeout(() => {
            publisherInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            publisherInputRef.current?.focus();
        }, 100);
    };

    const handleClickSavePublisher = () => {
        const { isValid, value: trimmedName } = validateField({
            value: tempPublisher.name,
            fieldKey: "publisher",
            label: "Publisher",
            existingItems: courseData.publishers.map(p => p.name),
        });

        if (!isValid) return;

        setCourseData((prev) => ({
            ...prev,
            publishers: [...prev.publishers, { name: trimmedName }]
        }));

        setTempPublisher({ name: "" });
        setShowAddpublisher(false);
    };

    const handleSaveEditPublisher = () => {
        const { isValid, value: trimmedName } = validateField({
            value: editingPublisherValue,
            fieldKey: "publisher",
            label: "Publisher",
            existingItems: courseData.publishers.map(p => p.name),
            excludeIndex: editingPublisherIndex
        });

        if (!isValid) return;

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










    const handleClickAddPart = () => {
        setTempPart({ name: "" });
        clearFieldError("part");
        setShowAddPart(true);

        setTimeout(() => {
            partInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            partInputRef.current?.focus();
        }, 100);
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

        const { isValid, value: trimmedName } = validateField({
            value: tempPart.name,
            fieldKey: "part",
            label: "Part",
            existingItems: courseData.parts.map(part => part.name)
        });

        if (!isValid) return;

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

    const handleCloseEditPart = () => {
        setEditingPartIndex(null);
        setEditingPartValue("");
        setTempPart({ name: "" });
        setShowAddPart(false);
    };


    const handleSaveEditPart = () => {
        const { isValid, value: trimmedName } = validateField({
            value: editingPartValue,
            fieldKey: "part",
            label: "Part",
            existingItems: courseData.parts.map(part => part.name),
            excludeIndex: editingPartIndex
        });

        if (!isValid) return;

        const updatedParts = [...courseData.parts];
        updatedParts[editingPartIndex] = {
            name: trimmedName,
            units: courseData.parts[editingPartIndex].units
        };
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


    const handleManageUnits = (partIndex) => {
        setManagedPartIndex(prev => prev === partIndex ? null : partIndex);

        setTimeout(() => {
            unitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };


    const handleClickAddUnit = (partIndex) => {
        setSelectedPartIndex(partIndex);
        setEditingUnitIndex(null);
        clearFieldError("unitName");
        clearFieldError("unitType");
        setTempUnit({ name: "", type: "" });

        setTimeout(() => {
            unitInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            unitInputRef.current?.focus();
        }, 100);
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
        const nameCheck = validateField({
            value: tempUnit.name,
            fieldKey: "unitName",
            label: "Unit name",
            existingItems: courseData.parts[selectedPartIndex]?.units.map(u => u.name),
            duplicateCheck: false
        });

        const typeCheck = validateField({
            value: tempUnit.type,
            fieldKey: "unitType",
            label: "Unit type",
            existingItems: courseData.parts[selectedPartIndex]?.units.map(u => u.type),
            duplicateCheck: false
        });

        if (!nameCheck.isValid || !typeCheck.isValid) return;

        const existingUnits = courseData.parts[selectedPartIndex]?.units || [];
        const alreadyExists = existingUnits.some(
            (u) =>
                u.name.trim().toLowerCase() === nameCheck.value.toLowerCase() &&
                u.type.trim().toLowerCase() === typeCheck.value.toLowerCase()
        );

        if (alreadyExists) {
            setFieldError("unitName", "This unit already exists");
            setFieldError("unitType", "This unit already exists");
            return;
        }

        const newUnit = {
            name: nameCheck.value,
            type: typeCheck.value,
            subunits: []
        };

        setCourseData((prev) => {
            const updatedParts = [...prev.parts];
            updatedParts[selectedPartIndex] = {
                ...updatedParts[selectedPartIndex],
                units: [...updatedParts[selectedPartIndex].units, newUnit]
            };
            return { ...prev, parts: updatedParts };
        });

        resetUnitForm();
        clearFieldError("unitName");
        clearFieldError("unitType");
    };


    const handleSaveUnit = () => {
        const { isValid: isNameValid, value: unitName } = validateField({
            value: tempUnit.name,
            fieldKey: "unitName",
            label: "Unit name",
            existingItems: (courseData.parts[selectedPartIndex]?.units || []).map((u, idx) =>
                idx !== editingUnitIndex ? u.name + u.type : ""
            ),
            duplicateCompare: item => item.toLowerCase()
        });

        const { isValid: isTypeValid, value: unitType } = validateField({
            value: tempUnit.type,
            fieldKey: "unitType",
            label: "Unit type",
            duplicateCheck: false
        });

        if (!isNameValid || !isTypeValid) return;

        const updatedParts = [...courseData.parts];
        updatedParts[selectedPartIndex].units[editingUnitIndex] = {
            name: unitName,
            type: unitType
        };

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





    const handleChangeSubUnit = (e) => {
        const { value } = e.target;
        setTempSubUnit({ name: value });
    };


    const handleClickAddSubUnit = (partIndex, unitIndex) => {
        setSelectedUnitIndexes({ partIndex, unitIndex });
        setTempSubUnit({ name: "" });
        setEditingSubunitIndex(null);
        clearFieldError("subunit");
        setShowSubunitInput(true);

        setTimeout(() => {
            subUnitInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            subUnitInputRef.current?.focus();
        }, 100);

    };


    const handleClickSaveSubUnit = () => {
        const { partIndex, unitIndex } = selectedUnitIndexes;

        const part = courseData.parts?.[partIndex];
        const unit = part?.units?.[unitIndex];
        const subunits = unit?.subunits || [];

        const { isValid, value: trimmedName } = validateField({
            value: tempSubUnit.name,
            fieldKey: "subunit",
            label: "Subunit",
            existingItems: subunits.map(s => s.name)
        });

        if (!isValid) return;

        const updatedParts = [...courseData.parts];
        const updatedUnits = [...updatedParts[partIndex].units];
        const targetUnit = { ...updatedUnits[unitIndex] };

        targetUnit.subunits = [...(targetUnit.subunits || []), { name: trimmedName }];
        updatedUnits[unitIndex] = targetUnit;
        updatedParts[partIndex].units = updatedUnits;

        setCourseData({ ...courseData, parts: updatedParts });
        setTempSubUnit({ name: "" });
        setShowSubunitInput(false);
        clearFieldError("subunit");
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


        setTimeout(() => {
            subUnitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    };


    const handleEditSubunit = (index) => {
        const { partIndex, unitIndex } = selectedUnitIndexes;
        const current = courseData.parts[partIndex].units[unitIndex].subunits[index];

        setEditingSubunitIndex(index);
        setTempSubUnit({ name: current.name });
        setShowSubunitInput(true);
    };

    const handleCloseEditSubunit = () => {
        setTempSubUnit({ name: "" });
        setEditingSubunitIndex(null);
        setShowSubunitInput(false);
    };


    const handleSaveSubunit = () => {
        const { partIndex, unitIndex } = selectedUnitIndexes;

        const { isValid, value: trimmedName } = validateField({
            value: tempSubUnit.name,
            fieldKey: "subunit",
            label: "Subunit",
            existingItems: courseData.parts[partIndex]?.units[unitIndex]?.subunits.map(s => s.name) || [],
            excludeIndex: editingSubunitIndex
        });

        if (!isValid) return;

        const updatedCourse = { ...courseData };
        const subunits = updatedCourse.parts[partIndex].units[unitIndex].subunits;

        subunits[editingSubunitIndex] = { name: trimmedName };

        setCourseData(updatedCourse);
        setTempSubUnit({ name: "" });
        setEditingSubunitIndex(null);
        setShowSubunitInput(false);
        clearFieldError("subunit");
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


    const validateCourseData = (courseData) => {
        if (!courseData.name || !courseData.name.trim()) {
            message.error("Course name is required");
            return false;
        }

        if (!Array.isArray(courseData.publishers) || courseData.publishers.length === 0) {
            message.error("At least one publisher is required");
            return false;
        }

        for (const publisher of courseData.publishers) {
            if (!publisher.name || !publisher.name.trim()) {
                message.error("Publisher name is required");
                return false;
            }
        }

        if (!Array.isArray(courseData.parts) || courseData.parts.length === 0) {
            message.error("At least one part is required");
            return false;
        }

        for (const part of courseData.parts) {
            if (!part.name || !part.name.trim()) {
                message.error("Part name is required");
                return false;
            }

            if (!Array.isArray(part.units) || part.units.length === 0) {
                message.error(`At least one unit is required in part "${part.name}"`);
                return false;
            }

            for (const unit of part.units) {
                if (!unit.name || !unit.name.trim()) {
                    message.error(`Unit name is required in part "${part.name}"`);
                    return false;
                }

                if (!unit.type || !unit.type.trim()) {
                    message.error(`Unit type is required in unit "${unit.name}" under part "${part.name}"`);
                    return false;
                }

                if (!Array.isArray(unit.subunits) || unit.subunits.length === 0) {
                    message.error(`At least one subunit is required in unit "${unit.name}"`);
                    return false;
                }

                for (const subunit of unit.subunits) {
                    if (!subunit.name || !subunit.name.trim()) {
                        message.error(`Subunit name is required in unit "${unit.name}"`);
                        return false;
                    }
                }
            }
        }

        return true;
    };

    const cleanCourseData = (data) => {
        return {
            name: data.name,
            publishers: data.publishers?.map(p => ({ name: p.name })) || [],
            parts: data.parts?.map(part => ({
                name: part.name,
                units: part.units?.map(unit => ({
                    name: unit.name,
                    type: unit.type,
                    subunits: unit.subunits?.map(sub => ({ name: sub.name })) || []
                })) || []
            })) || []
        };
    };



    const handleSubmitCourse = async () => {
        if (!validateCourseData(courseData)) {
            return;
        }

        try {
            if (initialCourseData?._id) {
                const cleaned = cleanCourseData(courseData);
                console.log(cleaned);
                await courseService.updateCourse(initialCourseData._id, cleaned);
                message.success("Course updated successfully!");
            } else {
                await courseService.addCourse(courseData);
                message.success("Course submitted successfully!");
            }

            onRequestClose();
            fetchAllCourses();
        } catch (error) {
            message.error(
                error?.response?.data?.error || "Failed to save course"
            );
        }
    };


    return (
        <div className='add-course'>

            <div className='heading-lg title' >Course Info</div>

            <div className='course-form'>
                <label htmlFor="name" className='heading-md name'>Course Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Course Name"
                    value={courseData.name}
                    onChange={handleCourseInputchange}
                />

            </div>

            <div className='add-publisher-btn'>
                <div className='heading-md publisher-h1'>Publishers</div>
                <button className='btn' onClick={handleClickAddPublisher}>Add Publisher</button>
            </div>


            {showAddPublisher && (
                <div className='add-publisher'>
                    <div className='add-publisher-form'>
                        <label htmlFor="publishers" className='heading-sm publisher-name'>Publisher Name</label>
                        <input
                            ref={publisherInputRef}
                            type="text"
                            placeholder="Publisher Name"
                            name='publishers'
                            value={editingPublisherIndex !== null ? editingPublisherValue : tempPublisher.name}
                            onChange={handlePublisherInputChange}
                        />
                        {errors.publisher && <span className='error-text'>{errors.publisher}</span>}
                    </div>
                    <div className='add-publisher-btns'>
                        <button
                            className="btn"
                            onClick={editingPublisherIndex !== null ? handleSaveEditPublisher : handleClickSavePublisher}
                        >
                            {editingPublisherIndex !== null ? "Save" : "Add"}
                        </button>
                        <button className='btn' onClick={handleCloseEditPublisher}>Cancel</button>
                    </div>
                </div>
            )}

            < PublisherTable
                courseData={courseData}
                onEdit={handleEditPublisher}
                onDelete={handleDeletePublisher}
            />

            <div className='add-part-btn'>
                <div className='heading-md'>Parts</div>
                <button className='btn' onClick={handleClickAddPart}>Add Part</button>
            </div>

            {showAddPart && (
                <div className='add-part' >
                    <div className='add-part-form'>
                        <label htmlFor="parts" className='heading-sm part-name'>Part Name</label>
                        <input
                            ref={partInputRef}
                            type="text"
                            name='parts'
                            placeholder="Part"
                            value={editingPartIndex !== null ? editingPartValue : tempPart.name}
                            onChange={handlePartInputChange}
                        />
                        {errors.part && <span className='error-text'>{errors.part}</span>}
                    </div>

                    <div className='add-part-btns'>
                        <button
                            className="btn"
                            onClick={editingPartIndex !== null ? handleSaveEditPart : handleClickSavePart}
                        >
                            {editingPartIndex !== null ? "Save" : "Add"}
                        </button>
                        <button className='btn' onClick={handleCloseEditPart}>Cancel</button>
                    </div>
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
                            <div className='add-unit-btn' ref={unitSectionRef}>
                                <div className='heading-md'>{`${part.name}/Units`}</div>
                                <button
                                    type='button'
                                    className='btn'
                                    onClick={() => handleClickAddUnit(index)}
                                >
                                    Add Unit
                                </button>
                            </div>

                            {selectedPartIndex === index && (
                                <div className='add-unit'>
                                    <div className='unit-form'>
                                        <label htmlFor="name" className='heading-sm unit-name'>
                                            Unit Name
                                        </label>
                                        <input
                                            ref={unitInputRef}
                                            type="text"
                                            name="name"
                                            placeholder="Unit Name"
                                            value={tempUnit.name}
                                            onChange={handleInputChangeUnit}
                                        />

                                        {errors.unitName && <span className='error-text'>{errors.unitName}</span>}
                                        <div className='unit-form-2'>
                                            <label htmlFor="type" className='heading-sm question-type'>
                                                Question Type
                                            </label>
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
                                            {errors.unitType && <span className='error-text'>{errors.unitType}</span>}
                                        </div>
                                    </div>
                                    <div className='btns'>
                                        <button className='btn' onClick={editingUnitIndex !== null ? handleSaveUnit : handleClickSaveUnit}>
                                            {editingUnitIndex !== null ? "Save" : "Add"}
                                        </button>
                                        <button className='btn' onClick={resetUnitForm}>Cancel</button>
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

                        <div className="add-subunit-btn" ref={subUnitSectionRef}>
                            <div className='heading-md'>{`${courseData.parts[managedPartIndex].name}/${courseData.parts[managedPartIndex].units[selectedUnitIndexes.unitIndex].name}/Subunits`}</div>
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
                            <div className="add-subunit">
                                <div className='subunit-form'>
                                    <label htmlFor="subunit" className='heading-sm subunit-name'>Subunit</label>
                                    <input
                                        ref={subUnitInputRef}
                                        type="text"
                                        name="subunit"
                                        placeholder="Subunit Name"
                                        value={tempSubUnit.name}
                                        onChange={handleChangeSubUnit}
                                    />
                                    {errors.subunit && <span className='error-text'>{errors.subunit}</span>}
                                </div>
                                <div className='subunit-btns'>
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
                                    <button className='btn' onClick={handleCloseEditSubunit}>Cancel</button>
                                </div>
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

            <div className='submit'>
                <button className='btn' onClick={handleSubmitCourse}>Submit</button>
            </div>

        </div>
    )
}

export default AddCourse
