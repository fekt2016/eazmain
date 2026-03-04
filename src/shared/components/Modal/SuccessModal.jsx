import React from 'react';
import { FaCheck } from 'react-icons/fa';
import Modal from './Modal';
import { IconWrapper, Title, Message, ButtonRow, ActionButton } from './Modal.styles';

const SuccessModal = ({
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Continue'
}) => {
    return (
        <Modal onClose={onClose}>
            <IconWrapper type="success">
                <FaCheck />
            </IconWrapper>
            <Title>{title}</Title>
            <Message>{message}</Message>
            <ButtonRow>
                <ActionButton className="primary" variant="primary" onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                }}>
                    {confirmText}
                </ActionButton>
            </ButtonRow>
        </Modal>
    );
};

export default SuccessModal;
