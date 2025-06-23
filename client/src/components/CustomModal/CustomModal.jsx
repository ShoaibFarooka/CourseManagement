import React from 'react';
import Modal from 'react-modal';
import './CustomModal.css';
import CrossIcon from '../../assets/icons/cross_icon.svg?react';

Modal.setAppElement('#root');

const CustomModal = ({ isOpen, onRequestClose, contentLabel, children, width = '90%' }) => {
    const modalStyle = {
        content: {
            width: width,
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal"
            style={modalStyle}
            contentLabel={contentLabel}
            overlayClassName="overlay"
        >
            <div className='cross-icon-container' onClick={onRequestClose}>
                <CrossIcon className='cross-icon' />
            </div>
            {children}
        </Modal>
    );
};

export default CustomModal;