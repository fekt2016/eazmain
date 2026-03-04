import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Overlay,
    ModalContainer,
    ModalHeader,
    IconWrapper,
    Title,
    Message,
    Actions,
    CancelButton,
    ConfirmButton,
    Spinner,
} from './styles';

const getIcon = (type) => {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '!';
        case 'alert':
        case 'confirm':
        default: return '?';
    }
};

export const ModalRoot = ({ modals, close, theme }) => {
    const overlayRef = useRef(null);

    // Prevent scrolling when modals are open
    useEffect(() => {
        if (modals.length > 0) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [modals.length]);

    // Handle ESC key to close the topmost modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && modals.length > 0) {
                const topModal = modals[modals.length - 1];
                if (!topModal.isLoading) {
                    if (topModal.onCancel) topModal.onCancel();
                    close(topModal.id);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modals, close]);

    if (modals.length === 0) return null;

    return createPortal(
        <>
            {modals.map((modal, index) => {
                // Base z-index offset so stacked modals appear on top
                const zIndex = 1000 + index * 10;
                return (
                    <Overlay
                        key={modal.id}
                        $zIndex={zIndex}
                        ref={overlayRef}
                        onClick={() => {
                            // Only close on backdrop config options or optionally skip
                            if (modal.closeOnBackdropClick !== false && !modal.isLoading) {
                                if (modal.onCancel) modal.onCancel();
                                close(modal.id);
                            }
                        }}
                    >
                        <ModalContainer
                            $theme={theme}
                            role="dialog"
                            aria-modal="true"
                            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing
                        >
                            <ModalHeader>
                                <IconWrapper $type={modal.type} $theme={theme}>
                                    {getIcon(modal.type)}
                                </IconWrapper>
                                <Title>{modal.title}</Title>
                            </ModalHeader>
                            <Message>{modal.message}</Message>
                            <Actions>
                                {(modal.type === 'confirm' || modal.type === 'warning') && (
                                    <CancelButton
                                        $theme={theme}
                                        onClick={() => {
                                            if (!modal.isLoading) {
                                                modal.onCancel?.();
                                                close(modal.id);
                                            }
                                        }}
                                        disabled={modal.isLoading}
                                    >
                                        {modal.cancelText || 'Cancel'}
                                    </CancelButton>
                                )}
                                <ConfirmButton
                                    $type={modal.type}
                                    $theme={theme}
                                    onClick={async () => {
                                        if (modal.onConfirm) {
                                            await modal.onConfirm();
                                        } else {
                                            close(modal.id);
                                        }
                                    }}
                                    disabled={modal.isLoading}
                                >
                                    {modal.isLoading ? <Spinner /> : (modal.confirmText || 'OK')}
                                </ConfirmButton>
                            </Actions>
                        </ModalContainer>
                    </Overlay>
                );
            })}
        </>,
        document.body
    );
};
