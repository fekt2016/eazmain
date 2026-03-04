import React, { createContext, useState } from 'react';
import { WarningModal, DangerModal, SuccessModal, InfoModal } from '../components/Modal';

export const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modal, setModal] = useState(null);

    const showModal = (config) => setModal(config);
    const hideModal = () => setModal(null);

    const renderModal = () => {
        if (!modal) return null;

        const props = { ...modal, onClose: hideModal };

        switch (modal.type) {
            case 'warning':
                return <WarningModal {...props} />;
            case 'danger':
                return <DangerModal {...props} />;
            case 'success':
                return <SuccessModal {...props} />;
            case 'info':
                return <InfoModal {...props} />;
            default:
                return null;
        }
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            {renderModal()}
        </ModalContext.Provider>
    );
}
