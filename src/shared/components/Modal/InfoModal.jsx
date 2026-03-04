import React from 'react';
import { FaInfo } from 'react-icons/fa';
import Modal from './Modal';
import { IconWrapper, Title, Message, ButtonRow, ActionButton } from './Modal.styles';

const InfoModal = ({
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Got it'
}) => {
    return (
        <Modal onClose={onClose}>
            <IconWrapper type="info">
                <FaInfo />
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

export default InfoModal;
