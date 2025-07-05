import './SelectDropDown.css';
import { Select } from 'antd';

const SelectDropDown = ({ options = [], value, onChange, onSearch, placeholder = "Select", className = '' }) => {
    return (
        <Select
            showSearch
            placeholder={placeholder}
            optionFilterProp="label"
            value={value}
            onChange={onChange}
            onSearch={onSearch}
            options={options}
            className={`custom-select ${className}`}
        />
    );
};

export default SelectDropDown;
