import React from 'react';
import { FaTrash } from 'react-icons/fa';
import Modal from './Modal';
import { IconWrapper, Title, Message, ButtonRow, ActionButton } from './Modal.styles';

const DangerModal = ({
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Delete',
    cancelText = 'Cancel'
}) => {
    return (
        <Modal onClose={onClose}>
            <IconWrapper type="danger">
                <FaTrash />
            </IconWrapper>
            <Title>{title}</Title>
            <Message>{message}</Message>
            <ButtonRow>
                <ActionButton className="secondary" variant="secondary" onClick={onClose}>
                    {cancelText}
                </ActionButton>
                <ActionButton className="primary" variant="primary" $danger onClick={() => {
                    onConfirm();
                    onClose();
                }}>
                    {confirmText}
                </ActionButton>
            </ButtonRow>
        </Modal>
    );
};

export default DangerModal;
