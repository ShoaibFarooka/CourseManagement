import './UploadSummaryModal.css';


const UploadSummaryModal = ({ close, warnings = [], success = [] }) => {
    return (
        <div className='summary'>
            <div className='heading-lg title'>Upload Summary</div>

            {success.length > 0 && (
                <div className='success-section'>
                    <h3 className='heading-md success-title'>Successfully Uploaded ✅</h3>
                    <ul className='list'>
                        {success.map((item, index) => (
                            <li
                                className='heading-sm list-item'
                                key={index}
                            >
                                <strong>{item.type}:</strong> {item.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {warnings.length > 0 && (
                <div className='warning-section'>
                    <h3 className='heading-md'>Errors ⚠️</h3>
                    <ul className='list'>
                        {warnings.map((warning, index) => (
                            <li
                                className='heading-sm'
                                key={index}
                            >
                                <strong>{warning.type} Row {warning.rowNumber}:</strong> {warning.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className='close-btn'>
                <button className='btn' onClick={close}>
                    Close
                </button>
            </div>
        </div>
    );
};


export default UploadSummaryModal
