import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Modal from './Modal';
import { IconWrapper, Title, Message, ButtonRow, ActionButton } from './Modal.styles';

const WarningModal = ({
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Continue',
    cancelText = 'Cancel'
}) => {
    return (
        <Modal onClose={onClose}>
            <IconWrapper type="warning">
                <FaExclamationTriangle />
            </IconWrapper>
            <Title>{title}</Title>
            <Message>{message}</Message>
            <ButtonRow>
                <ActionButton className="secondary" variant="secondary" onClick={onClose}>
                    {cancelText}
                </ActionButton>
                <ActionButton className="primary" variant="primary" onClick={() => {
                    onConfirm();
                    onClose();
                }}>
                    {confirmText}
                </ActionButton>
            </ButtonRow>
        </Modal>
    );
};

export default WarningModal;
