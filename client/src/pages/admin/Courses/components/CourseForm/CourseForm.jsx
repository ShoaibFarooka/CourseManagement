import './CourseForm.css';
import PublisherTable from '../PublisherTable/PublisherTable';
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import PartsTable from '../PartsTable/PartsTable';
import UnitsTable from '../UnitsTable/UnitsTable';
import SubunitTable from '../SubUnitTable/SubunitTable';
import { message } from 'antd';
import courseService from '../../../../../services/courseService';
import { ShowLoading, HideLoading } from '../../../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';


const CourseForm = forwardRef(({ onRequestClose, fetchAllCourses, initialCourseData }, ref) => {

    // publisher state
    const [tempPublisher, setTempPublisher] = useState({ name: "" });
    const [showAddPublisher, setShowAddpublisher] = useState(false);
    const [editingPublisherIndex, setEditingPublisherIndex] = useState(null);
    const [editingPublisherValue, setEditingPublisherValue] = useState("");
    const [selectedPartIndexForPublisher, setSelectedPartIndexForPublisher] = useState(null);

    //parts state
    const [tempPart, setTempPart] = useState({ name: "" });
    const [editingPartIndex, setEditingPartIndex] = useState(null);
    const [editingPartValue, setEditingPartValue] = useState("");
    const [showAddPart, setShowAddPart] = useState(false);
    const [managedPartIndex, setManagedPartIndex] = useState(null);

    // Unit state 
    const [tempUnit, setTempUnit] = useState({ name: "", type: [] });
    const [selectedPublisherIndexes, setSelectedPublisherIndexes] = useState({ partIndex: null, publisherIndex: null });
    const [editingUnitIndex, setEditingUnitIndex] = useState(null);
    const [showAddUnitSection, setShowAddUnitSection] = useState(false);


    // Subunit state
    const [tempSubUnit, setTempSubUnit] = useState({ name: "" });
    const [selectedUnitIndexes, setSelectedUnitIndexes] = useState({ partIndex: null, publisherIndex: null, unitIndex: null });
    const [editingSubunitIndex, setEditingSubunitIndex] = useState(null);
    const [showSubunitInput, setShowSubunitInput] = useState(false);

    const [originalCourseSnapshot, setOriginalCourseSnapshot] = useState(null);

    const [courseData, setCourseData] = useState({
        name: "",
        timeRatio: "",
        parts: []
    });

    const [unsavedChanges, setUnsavedChanges] = useState({
        unit: false,
        subunit: false,
        part: false,
        publisher: false,
        timeRatio: false,
        courseName: false,
    });

    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const [submitBtnToggel, setSubmitBtnToggel] = useState(false);

    const partInputRef = useRef(null);
    const publisherInputRef = useRef(null);
    const unitInputRef = useRef(null);
    const subUnitInputRef = useRef(null);
    const publisherSectionRef = useRef(null);
    const unitSectionRef = useRef(null);
    const subUnitSectionRef = useRef(null);

    const deepCopy = (data) => {
        if (!data) return null;

        return {
            _id: data._id,
            name: data.name,
            timeRatio: data.timeRatio,
            parts: Array.isArray(data.parts)
                ? data.parts.map((part) => ({
                    _id: part._id,
                    name: part.name,
                    publishers: Array.isArray(part.publishers)
                        ? part.publishers.map((publisher) => ({
                            _id: publisher._id,
                            name: publisher.name,
                            units: Array.isArray(publisher.units)
                                ? publisher.units.map((unit) => ({
                                    _id: unit._id,
                                    name: unit.name,
                                    type: Array.isArray(unit.type) ? [...unit.type] : [],
                                    subunits: Array.isArray(unit.subunits)
                                        ? unit.subunits.map((sub) => ({
                                            _id: sub._id,
                                            name: sub.name,
                                        }))
                                        : [],
                                }))
                                : [],
                        }))
                        : [],
                }))
                : [],
        };
    };

    useEffect(() => {
        if (initialCourseData) {
            const cloned = deepCopy(initialCourseData);
            setCourseData(cloned);
            setOriginalCourseSnapshot(cloned);
        } else {
            const emptyCourse = {
                name: '',
                timeRatio: '',
                parts: []
            };
            const cloned = deepCopy(emptyCourse);
            setCourseData(cloned);
            setOriginalCourseSnapshot(cloned);
            setSubmitBtnToggel(true);
        }
    }, [initialCourseData]);

    useImperativeHandle(ref, () => ({
        hasUnsavedChanges: () => {
            const hasFormChanges = Object.values(unsavedChanges).some(Boolean);
            return hasFormChanges
        }
    }));



    const setFieldError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };

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
        const value = e.target.value;
        setCourseData(prev => ({
            ...prev, name: value
        }));
        const normalize = (val) => val?.toString().trim().replace(/\s+/g, ' ') || '';
        const current = normalize(value);
        const original = normalize(originalCourseSnapshot?.name);

        if (current !== original) {
            setUnsavedChanges(prev => ({ ...prev, courseName: true }));
        } else {
            setUnsavedChanges(prev => ({ ...prev, courseName: false }));
        }
    };

    const handleTimeRatioInputChange = (e) => {
        const value = e.target.value;
        setCourseData(prev => ({
            ...prev,
            timeRatio: value
        }));

        const normalize = (val) => val?.toString().trim().replace(/\s+/g, ' ') || '';
        const current = normalize(value);
        const original = normalize(originalCourseSnapshot?.timeRatio);

        if (current !== original) {
            setUnsavedChanges(prev => ({ ...prev, timeRatio: true }));
        } else {
            setUnsavedChanges(prev => ({ ...prev, timeRatio: false }));
        }
    }

    // PART HANDLERS
    const handlePartInputChange = (e) => {
        const val = e.target.value;
        const normalize = (str) => str?.trim().replace(/\s+/g, ' ') || '';

        if (editingPartIndex !== null) {
            setEditingPartValue(val);

            const original = normalize(originalCourseSnapshot.parts?.[editingPartIndex]?.name);
            const current = normalize(val);

            setUnsavedChanges(prev => ({
                ...prev,
                part: current !== original
            }));
        } else {
            setTempPart({ name: val });
            setUnsavedChanges(prev => ({
                ...prev,
                part: normalize(val) !== ''
            }));
        }
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
            publishers: []
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
        const existingPart = updatedParts[editingPartIndex];

        updatedParts[editingPartIndex] = {
            _id: existingPart?._id,
            name: trimmedName,
            publishers: existingPart.publishers
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

        if (selectedPublisherIndexes.partIndex === index || selectedPublisherIndexes.partIndex >= updated.length) {
            setSelectedPublisherIndexes({ partIndex: null, publisherIndex: null });
        }

        if (selectedUnitIndexes.partIndex === index || selectedUnitIndexes.partIndex >= updated.length) {
            setSelectedUnitIndexes({ partIndex: null, publisherIndex: null, unitIndex: null });
            setShowSubunitInput(false);
        }

        setUnsavedChanges(prev => ({ ...prev, part: true }));
    };

    const handleManagePublishers = (partIndex) => {
        const isSamePart = managedPartIndex === partIndex;

        setManagedPartIndex(isSamePart ? null : partIndex);
        setSelectedPublisherIndexes({ partIndex: null, publisherIndex: null });
        setSelectedUnitIndexes({ partIndex: null, publisherIndex: null, unitIndex: null });
        setEditingSubunitIndex(null);
        setTempSubUnit({ name: "" });
        setShowSubunitInput(false);

        setTimeout(() => {
            publisherSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // PUBLISHER HANDLERS 
    const handlePublisherInputChange = (e) => {
        const val = e.target.value;
        const normalize = (str) => str?.trim().replace(/\s+/g, ' ') || '';

        if (editingPublisherIndex !== null && selectedPartIndexForPublisher !== null) {
            setEditingPublisherValue(val);

            const original = normalize(
                originalCourseSnapshot.parts?.[selectedPartIndexForPublisher]?.publishers?.[editingPublisherIndex]?.name
            );
            const current = normalize(val);

            setUnsavedChanges(prev => ({
                ...prev,
                publisher: current !== original
            }));
        } else {
            setTempPublisher({ name: val });
            setUnsavedChanges(prev => ({
                ...prev,
                publisher: normalize(val) !== ''
            }));
        }
    };

    const handleClickAddPublisher = (partIndex) => {
        setSelectedPartIndexForPublisher(partIndex);
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
            existingItems: courseData.parts[selectedPartIndexForPublisher]?.publishers?.map(p => p.name) || [],
        });

        if (!isValid) return;

        setCourseData((prev) => {
            const updatedParts = [...prev.parts];
            updatedParts[selectedPartIndexForPublisher] = {
                ...updatedParts[selectedPartIndexForPublisher],
                publishers: [...updatedParts[selectedPartIndexForPublisher].publishers, { name: trimmedName, units: [] }]
            };
            return { ...prev, parts: updatedParts };
        });

        setTempPublisher({ name: "" });
        setShowAddpublisher(false);
        setSelectedPartIndexForPublisher(null);
    };

    const handleEditPublisher = (partIndex, publisherIndex) => {
        setSelectedPartIndexForPublisher(partIndex);
        setEditingPublisherIndex(publisherIndex);
        setEditingPublisherValue(courseData.parts[partIndex].publishers[publisherIndex].name);
        setShowAddpublisher(true);
    };

    const handleCloseEditPublisher = () => {
        setEditingPublisherIndex(null);
        setEditingPublisherValue("");
        setTempPublisher({ name: "" });
        setShowAddpublisher(false);
        setSelectedPartIndexForPublisher(null);
    };

    const handleSaveEditPublisher = () => {
        const { isValid, value: trimmedName } = validateField({
            value: editingPublisherValue,
            fieldKey: "publisher",
            label: "Publisher",
            existingItems: courseData.parts[selectedPartIndexForPublisher]?.publishers?.map(p => p.name) || [],
            excludeIndex: editingPublisherIndex
        });

        if (!isValid) return;

        const updatedParts = [...courseData.parts];
        const publishers = [...updatedParts[selectedPartIndexForPublisher].publishers];
        const existingPublisher = publishers[editingPublisherIndex];

        publishers[editingPublisherIndex] = {
            _id: existingPublisher?._id,
            name: trimmedName,
            units: existingPublisher?.units || []
        };

        updatedParts[selectedPartIndexForPublisher].publishers = publishers;

        setCourseData(prev => ({
            ...prev,
            parts: updatedParts
        }));

        setEditingPublisherIndex(null);
        setEditingPublisherValue("");
        setShowAddpublisher(false);
        setSelectedPartIndexForPublisher(null);
    };

    const handleDeletePublisher = (partIndex, publisherIndex) => {
        const updatedParts = [...courseData.parts];
        const publishers = [...updatedParts[partIndex].publishers];
        publishers.splice(publisherIndex, 1);
        updatedParts[partIndex].publishers = publishers;

        setCourseData(prev => ({
            ...prev,
            parts: updatedParts
        }));

        setUnsavedChanges(prev => ({ ...prev, publisher: true }));
    };

    // UNIT HANDLERS 
    const handleInputChangeUnit = (e) => {
        const { name, value } = e.target;
        const normalize = (str) => str?.trim().replace(/\s+/g, ' ') || '';

        const normalizedValue = normalize(value);
        if (normalizedValue === '' && value !== '') return;

        setTempUnit((prev) => ({
            ...prev,
            [name]: value,
        }));

        let isChanged = false;

        if (editingUnitIndex !== null &&
            selectedPublisherIndexes.partIndex !== null &&
            selectedPublisherIndexes.publisherIndex !== null) {
            const originalUnit = originalCourseSnapshot.parts[selectedPublisherIndexes.partIndex]
                ?.publishers[selectedPublisherIndexes.publisherIndex]?.units?.[editingUnitIndex];
            if (originalUnit) {
                const originalValue = normalize(originalUnit[name]);
                isChanged = normalizedValue !== originalValue;
            } else {
                isChanged = normalizedValue !== '';
            }
        } else {
            isChanged = normalizedValue !== '';
        }

        setUnsavedChanges(prev => ({ ...prev, unit: isChanged }));
    };

    const handleUnitTypeChange = (e, typeOption) => {
        const isChecked = e.target.checked;
        setTempUnit((prev) => ({
            ...prev,
            type: isChecked
                ? [...prev.type, typeOption]
                : prev.type.filter((t) => t !== typeOption),
        }));
        setUnsavedChanges(prev => ({ ...prev, unit: true }));
    };

    const resetUnitForm = () => {
        setTempUnit({ name: "", type: [] });
        setSelectedPublisherIndexes({ partIndex: null, publisherIndex: null });
        setEditingUnitIndex(null);
    };

    const handleManageUnits = (partIndex, publisherIndex) => {
        const isSamePublisher =
            selectedPublisherIndexes.partIndex === partIndex &&
            selectedPublisherIndexes.publisherIndex === publisherIndex;

        if (isSamePublisher) {
            setSelectedPublisherIndexes({ partIndex: null, publisherIndex: null });
        } else {
            setSelectedPublisherIndexes({ partIndex, publisherIndex });
        }

        setShowAddUnitSection(false);


        setTempUnit({ name: "", type: [] });
        setEditingUnitIndex(null);

        setSelectedUnitIndexes({ partIndex: null, publisherIndex: null, unitIndex: null });
        setEditingSubunitIndex(null);
        setTempSubUnit({ name: "" });
        setShowSubunitInput(false);

        setTimeout(() => {
            unitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleClickAddUnit = (partIndex, publisherIndex) => {
        setSelectedPublisherIndexes({ partIndex, publisherIndex });
        setEditingUnitIndex(null);
        clearFieldError("unitName");
        clearFieldError("unitType");
        setTempUnit({ name: "", type: [] });

        setShowAddUnitSection(true);

        setTimeout(() => {
            unitInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            unitInputRef.current?.focus();
        }, 100);
    };

    const handleEditUnit = (partIndex, publisherIndex, unitIndex) => {
        const unit = courseData.parts[partIndex].publishers[publisherIndex].units[unitIndex];
        setSelectedPublisherIndexes({ partIndex, publisherIndex });
        setEditingUnitIndex(unitIndex);
        setTempUnit({ name: unit.name, type: Array.isArray(unit.type) ? unit.type : [] });
    };

    const handleClickSaveUnit = () => {

        if (!tempUnit.name.trim()) {
            setFieldError("unitName", "Unit name is required");
            return;
        }

        if (!Array.isArray(tempUnit.type) || tempUnit.type.length === 0) {
            setFieldError("unitType", "Please select at least one unit type");
            return;
        }

        setCourseData(prev => {
            const updatedParts = [...prev.parts];
            const updatedPublishers = [...updatedParts[managedPartIndex].publishers];
            const updatedUnits = [...updatedPublishers[selectedPublisherIndexes.publisherIndex].units, tempUnit];

            updatedPublishers[selectedPublisherIndexes.publisherIndex] = {
                ...updatedPublishers[selectedPublisherIndexes.publisherIndex],
                units: updatedUnits,
            };

            updatedParts[managedPartIndex] = {
                ...updatedParts[managedPartIndex],
                publishers: updatedPublishers,
            };

            return {
                ...prev,
                parts: updatedParts,
            };
        });

        setTempUnit({ name: "", type: [] });
        clearFieldError("unitName");
        clearFieldError("unitType");
        setShowAddUnitSection(false);
    };


    const handleSaveEditedUnit = () => {
        const { partIndex, publisherIndex } = selectedPublisherIndexes;

        const { isValid: isNameValid, value: unitName } = validateField({
            value: tempUnit.name,
            fieldKey: "unitName",
            label: "Unit name",
            existingItems: (courseData.parts[partIndex]?.publishers[publisherIndex]?.units || []).map((u, idx) =>
                idx !== editingUnitIndex ? u.name + JSON.stringify(u.type) : ""
            ),
            duplicateCompare: item => item.toLowerCase()
        });

        if (!Array.isArray(tempUnit.type) || tempUnit.type.length === 0) {
            setFieldError("unitType", "Please select at least one unit type");
            return;
        }

        if (!isNameValid) return;

        // Make a copy of courseData to update immutably
        const updatedParts = [...courseData.parts];
        const publishers = [...updatedParts[partIndex].publishers];
        const units = [...publishers[publisherIndex].units];

        // Update the existing unit only
        const existingUnit = units[editingUnitIndex];
        units[editingUnitIndex] = {
            _id: existingUnit?._id,
            name: unitName,
            type: [...tempUnit.type],
            subunits: existingUnit?.subunits || []
        };

        publishers[publisherIndex] = {
            ...publishers[publisherIndex],
            units
        };
        updatedParts[partIndex] = {
            ...updatedParts[partIndex],
            publishers
        };

        setCourseData({ ...courseData, parts: updatedParts });
        setTempUnit({ name: "", type: [] });
    };


    const handleDeleteUnit = (partIndex, publisherIndex, unitIndex) => {
        const updatedParts = [...courseData.parts];
        const publishers = [...updatedParts[partIndex].publishers];
        const updatedUnits = [...publishers[publisherIndex].units];
        updatedUnits.splice(unitIndex, 1);
        publishers[publisherIndex].units = updatedUnits;
        updatedParts[partIndex].publishers = publishers;

        setCourseData(prev => ({
            ...prev,
            parts: updatedParts
        }));
        setUnsavedChanges(prev => ({ ...prev, unit: true }));
    };

    // SUB-UNIT HANDLERS
    const handleChangeSubUnit = (e) => {
        const value = e.target.value;
        const normalize = (str) => str?.trim().replace(/\s+/g, ' ') || '';
        const normalizedValue = normalize(value);

        if (normalizedValue === '' && value !== '') return;

        setTempSubUnit({ name: value });

        let isChanged = false;

        if (
            selectedUnitIndexes.partIndex !== null &&
            selectedUnitIndexes.publisherIndex !== null &&
            selectedUnitIndexes.unitIndex !== null &&
            editingSubunitIndex !== null
        ) {
            const originalSubunit = originalCourseSnapshot.parts?.[selectedUnitIndexes.partIndex]
                ?.publishers?.[selectedUnitIndexes.publisherIndex]
                ?.units?.[selectedUnitIndexes.unitIndex]
                ?.subunits?.[editingSubunitIndex];

            const originalName = normalize(originalSubunit?.name);
            isChanged = normalizedValue !== originalName;
        } else {
            isChanged = normalizedValue !== '';
        }

        setUnsavedChanges(prev => ({ ...prev, subunit: isChanged }));
    };

    const handleClickAddSubUnit = (partIndex, publisherIndex, unitIndex) => {
        setSelectedUnitIndexes({ partIndex, publisherIndex, unitIndex });
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
        const { partIndex, publisherIndex, unitIndex } = selectedUnitIndexes;

        const part = courseData.parts?.[partIndex];
        const publisher = part?.publishers?.[publisherIndex];
        const unit = publisher?.units?.[unitIndex];
        const subunits = unit?.subunits || [];

        const { isValid, value: trimmedName } = validateField({
            value: tempSubUnit.name,
            fieldKey: "subunit",
            label: "Subunit",
            existingItems: subunits.map(s => s.name)
        });

        if (!isValid) return;

        const updatedParts = [...courseData.parts];
        const publishers = [...updatedParts[partIndex].publishers];
        const units = [...publishers[publisherIndex].units];
        const targetUnit = { ...units[unitIndex] };

        targetUnit.subunits = [...(targetUnit.subunits || []), { name: trimmedName }];
        units[unitIndex] = targetUnit;
        publishers[publisherIndex].units = units;
        updatedParts[partIndex].publishers = publishers;

        setCourseData({ ...courseData, parts: updatedParts });
        setTempSubUnit({ name: "" });
        setShowSubunitInput(false);
        clearFieldError("subunit");
    };

    const handleManageSubunits = (partIndex, publisherIndex, unitIndex) => {
        const isSameSubunit =
            selectedUnitIndexes.partIndex === partIndex &&
            selectedUnitIndexes.publisherIndex === publisherIndex &&
            selectedUnitIndexes.unitIndex === unitIndex;

        if (isSameSubunit) {
            setSelectedUnitIndexes({ partIndex: null, publisherIndex: null, unitIndex: null });
            setEditingSubunitIndex(null);
            setTempSubUnit({ name: "" });
            setShowSubunitInput(false);
        } else {
            setSelectedUnitIndexes({ partIndex, publisherIndex, unitIndex });
            setEditingSubunitIndex(null);
            setTempSubUnit({ name: "" });
            setShowSubunitInput(false);
        }

        setTimeout(() => {
            subUnitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleEditSubunit = (index) => {
        const { partIndex, publisherIndex, unitIndex } = selectedUnitIndexes;
        const current = originalCourseSnapshot.parts[partIndex].publishers[publisherIndex].units[unitIndex].subunits[index];

        setEditingSubunitIndex(index);
        setTempSubUnit({ name: current?.name || "" });
        setShowSubunitInput(true);
    };

    const handleCloseEditSubunit = () => {
        setTempSubUnit({ name: "" });
        setEditingSubunitIndex(null);
        setShowSubunitInput(false);
    };

    const handleSaveSubunit = () => {
        const { partIndex, publisherIndex, unitIndex } = selectedUnitIndexes;

        const { isValid, value: trimmedName } = validateField({
            value: tempSubUnit.name,
            fieldKey: "subunit",
            label: "Subunit",
            existingItems: courseData.parts[partIndex]?.publishers[publisherIndex]?.units[unitIndex]?.subunits.map(s => s.name) || [],
            excludeIndex: editingSubunitIndex
        });

        if (!isValid) return;

        const updatedCourse = { ...courseData };
        const subunits = updatedCourse.parts[partIndex].publishers[publisherIndex].units[unitIndex].subunits;
        const existingSubunit = subunits[editingSubunitIndex];

        subunits[editingSubunitIndex] = {
            _id: existingSubunit?._id,
            name: trimmedName
        };

        setCourseData(updatedCourse);
        setTempSubUnit({ name: "" });
        setEditingSubunitIndex(null);
        setShowSubunitInput(false);
        clearFieldError("subunit");
    };

    const handleDeleteSubunit = (index) => {
        const { partIndex, publisherIndex, unitIndex } = selectedUnitIndexes;
        const updatedParts = [...courseData.parts];
        const publishers = [...updatedParts[partIndex].publishers];
        const units = [...publishers[publisherIndex].units];
        const subunits = [...units[unitIndex].subunits];

        subunits.splice(index, 1);
        units[unitIndex].subunits = subunits;
        publishers[publisherIndex].units = units;
        updatedParts[partIndex].publishers = publishers;

        setCourseData(prev => ({
            ...prev,
            parts: updatedParts
        }));
        setUnsavedChanges(prev => ({ ...prev, subunit: true }));
    };

    // VALIDATION OF DATA
    const validateCourseData = (courseData) => {
        if (!courseData.name || !courseData.name.trim()) {
            message.error("Course name is required");
            return false;
        }

        const timeRatioValue = parseFloat(courseData.timeRatio);
        if (isNaN(timeRatioValue) || timeRatioValue <= 0) {
            message.error("Time ratio must be a positive number");
            return false;
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

            if (!Array.isArray(part.publishers) || part.publishers.length === 0) {
                message.error(`At least one publisher is required in part "${part.name}"`);
                return false;
            }

            for (const publisher of part.publishers) {
                if (!publisher.name || !publisher.name.trim()) {
                    message.error(`Publisher name is required in part "${part.name}"`);
                    return false;
                }

                if (!Array.isArray(publisher.units) || publisher.units.length === 0) {
                    message.error(`At least one unit is required in publisher "${publisher.name}" under part "${part.name}"`);
                    return false;
                }

                for (const unit of publisher.units) {
                    if (!unit.name || !unit.name.trim()) {
                        message.error(`Unit name is required in publisher "${publisher.name}" under part "${part.name}"`);
                        return false;
                    }

                    if (!Array.isArray(unit.type) || unit.type.length === 0) {
                        message.error(`At least one unit type is required in unit "${unit.name}" under publisher "${publisher.name}"`);
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
        }

        return true;
    };

    const cleanCourseData = (data) => {
        return {
            name: data.name,
            timeRatio: parseFloat(data.timeRatio),
            parts: data.parts?.map(part => ({
                _id: part._id,
                name: part.name,
                publishers: part.publishers?.map(publisher => ({
                    _id: publisher._id,
                    name: publisher.name,
                    units: publisher.units?.map(unit => ({
                        _id: unit._id,
                        name: unit.name,
                        type: Array.isArray(unit.type) ? [...unit.type] : [],
                        subunits: unit.subunits?.map(sub => ({
                            _id: sub._id,
                            name: sub.name
                        })) || []
                    })) || []
                })) || []
            })) || []
        };
    };

    // API CALL
    const handleSubmitCourse = async () => {
        if (!validateCourseData(courseData)) {
            return;
        }

        setUnsavedChanges({
            unit: false,
            subunit: false,
            part: false,
            publisher: false,
            timeRatio: false,
            courseName: false
        });
        try {
            dispatch(ShowLoading());
            if (initialCourseData?._id) {
                const cleaned = cleanCourseData(courseData);
                await courseService.updateCourse(initialCourseData._id, cleaned);
                message.success("Course updated successfully!");
            } else {
                await courseService.addCourse(courseData);
                message.success("Course submitted successfully!");
            }
            setSubmitBtnToggel(false);
            onRequestClose();
            fetchAllCourses();
        }
        catch (error) {
            message.error(error?.response?.data?.error || "Failed to save course");
        }
        finally {
            dispatch(HideLoading());
        }
    };

    return (
        <div className='add-course'>
            <div className='heading-lg title'>
                {initialCourseData ? `Update ${courseData.name} Course` : 'Add New Course'}
            </div>

            <div className='course-form'>
                <label htmlFor="name" className='heading-md name'>Course Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Course Name"
                    value={courseData.name}
                    onChange={handleCourseInputchange}
                />

                <label htmlFor="timeRatio" className='heading-md name'>Time Ratio</label>
                <input
                    type="number"
                    name="timeRatio"
                    placeholder="Time Ratio (e.g. 1.5)"
                    value={courseData.timeRatio}
                    onChange={handleTimeRatioInputChange}
                />
            </div>

            <div className='add-part-btn'>
                <div className='heading-md'>Parts</div>
                <button className='btn' onClick={handleClickAddPart}>Add Part</button>
            </div>

            {showAddPart && (
                <div className='add-part'>
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
                onManagePublishers={handleManagePublishers}
                onDelete={handleDeletePart}
                managedPartIndex={managedPartIndex}
            />

            {courseData.parts.map((part, partIndex) => (
                <div className='publisher' key={partIndex}>
                    {managedPartIndex === partIndex && courseData.parts[managedPartIndex] && (
                        <>
                            <div className='add-publisher-btn' ref={publisherSectionRef}>
                                <div className='heading-md publisher-h1'>{`${part.name}/Publishers`}</div>
                                <button className='btn' onClick={() => handleClickAddPublisher(partIndex)}>
                                    Add Publisher
                                </button>
                            </div>

                            {showAddPublisher && selectedPartIndexForPublisher === partIndex && (
                                <div className='add-publisher'>
                                    <div className='add-publisher-form'>
                                        <label htmlFor="publishers" className='heading-sm publisher-name'>
                                            Publisher Name
                                        </label>
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

                            <PublisherTable
                                publishers={courseData.parts[partIndex].publishers}
                                partIndex={partIndex}
                                onEdit={(publisherIndex) => handleEditPublisher(partIndex, publisherIndex)}
                                onManageUnits={(publisherIndex) => handleManageUnits(partIndex, publisherIndex)}
                                onDelete={(publisherIndex) => handleDeletePublisher(partIndex, publisherIndex)}
                                selectedPublisherIndexes={selectedPublisherIndexes}
                            />
                        </>
                    )}
                </div>
            ))}

            {managedPartIndex !== null &&
                courseData.parts[managedPartIndex] &&
                courseData.parts[managedPartIndex].publishers.map((publisher, publisherIndex) => (
                    <div className='unit' key={publisherIndex}>
                        {selectedPublisherIndexes.partIndex === managedPartIndex &&
                            selectedPublisherIndexes.publisherIndex === publisherIndex && (
                                <>
                                    <div className='add-unit-btn' ref={unitSectionRef}>
                                        <div className='heading-md'>{`${courseData.parts[managedPartIndex].name}/${publisher.name}/Units`}</div>
                                        <button
                                            type='button'
                                            className='btn'
                                            onClick={() => handleClickAddUnit(managedPartIndex, publisherIndex)}
                                        >
                                            Add Unit
                                        </button>
                                    </div>

                                    {showAddUnitSection &&
                                        (
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

                                                    <label className='heading-sm question-type'>Question Type</label>
                                                    <div className="unit-type-checkboxes">
                                                        {["rapid", "mcq", "essay"].map((typeOption) => (
                                                            <div key={typeOption} className="checkbox-label">
                                                                <span className="label-text heading-sm">
                                                                    {typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
                                                                </span>
                                                                <input
                                                                    type="checkbox"
                                                                    value={typeOption}
                                                                    checked={tempUnit.type.includes(typeOption)}
                                                                    onChange={(e) => handleUnitTypeChange(e, typeOption)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {errors.unitType && <span className='error-text'>{errors.unitType}</span>}
                                                </div>
                                                <div className='btns'>
                                                    <button className='btn' onClick={editingUnitIndex !== null ? handleSaveEditedUnit : handleClickSaveUnit}>
                                                        {editingUnitIndex !== null ? "Save" : "Add"}
                                                    </button>
                                                    <button className='btn' onClick={resetUnitForm}>Cancel</button>
                                                </div>
                                            </div>
                                        )}

                                    <UnitsTable
                                        unitData={publisher.units}
                                        onEdit={(unitIndex) => handleEditUnit(managedPartIndex, publisherIndex, unitIndex)}
                                        onManageSubunits={(unitIndex) => handleManageSubunits(managedPartIndex, publisherIndex, unitIndex)}
                                        onDelete={(unitIndex) => handleDeleteUnit(managedPartIndex, publisherIndex, unitIndex)}
                                        partIndex={managedPartIndex}
                                        publisherIndex={publisherIndex}
                                        selectedUnitIndexes={selectedUnitIndexes}
                                    />
                                </>
                            )}
                    </div>
                ))}

            {managedPartIndex !== null &&
                selectedPublisherIndexes.partIndex !== null &&
                selectedPublisherIndexes.publisherIndex !== null &&
                selectedUnitIndexes.partIndex === managedPartIndex &&
                selectedUnitIndexes.publisherIndex === selectedPublisherIndexes.publisherIndex &&
                selectedUnitIndexes.unitIndex !== null &&
                courseData.parts[managedPartIndex]?.publishers[selectedPublisherIndexes.publisherIndex]?.units[selectedUnitIndexes.unitIndex] && (
                    <div className="subunit-container">
                        <div className="add-subunit-btn" ref={subUnitSectionRef}>
                            <div className='heading-md'>
                                {`${courseData.parts[managedPartIndex].name}/${courseData.parts[managedPartIndex].publishers[selectedPublisherIndexes.publisherIndex].name}/${courseData.parts[managedPartIndex].publishers[selectedPublisherIndexes.publisherIndex].units[selectedUnitIndexes.unitIndex].name}/Subunits`}
                            </div>
                            <button
                                className="btn"
                                onClick={() =>
                                    handleClickAddSubUnit(
                                        selectedUnitIndexes.partIndex,
                                        selectedUnitIndexes.publisherIndex,
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
                                courseData.parts[managedPartIndex].publishers[selectedPublisherIndexes.publisherIndex].units[selectedUnitIndexes.unitIndex].subunits || []
                            }
                            onEdit={handleEditSubunit}
                            onDelete={handleDeleteSubunit}
                        />
                    </div>
                )}

            <div className='submit'>
                <button className='btn' onClick={handleSubmitCourse}>
                    {submitBtnToggel ? "Add New Course" : "Update Course"}
                </button>
            </div>
        </div>
    );
});

export default CourseForm;