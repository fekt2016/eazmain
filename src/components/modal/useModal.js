import { useContext } from 'react';
import { ModalContext } from './modalContext';

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }

    // We abstract away the context internals and provide clean utility exposure
    return {
        alert: context.alert,
        success: context.success,
        warning: context.warning,
        error: context.error,
        confirm: context.confirm,
        close: context.close,
    };
};
