import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { Overlay, ModalCard, CloseButton } from './Modal.styles';

const Modal = ({ children, onClose, closeOnBackdropClick = true }) => {
    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && closeOnBackdropClick) {
            onClose();
        }
    };

    return createPortal(
        <Overlay onClick={handleBackdropClick}>
            <ModalCard>
                <CloseButton onClick={onClose} aria-label="Close modal">
                    <FaTimes size={16} />
                </CloseButton>
                {children}
            </ModalCard>
        </Overlay>,
        document.body
    );
};

export default Modal;
