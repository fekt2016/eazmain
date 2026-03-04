import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ModalContext } from './modalContext';
import { ModalRoot } from './ModalRoot';

export const ModalProvider = ({ children, theme }) => {
    const [modals, setModals] = useState([]);

    const close = useCallback((id) => {
        setModals((prev) => prev.filter((modal) => modal.id !== id));
    }, []);

    const openModal = useCallback((type, options) => {
        const id = uuidv4();

        // For confirm modals, handle the async onConfirm to manage loading state
        let wrappedOnConfirm = options.onConfirm;

        if (type === 'confirm' && typeof options.onConfirm === 'function') {
            wrappedOnConfirm = async () => {
                // Set loading state for this specific modal
                setModals((prev) => prev.map(m => m.id === id ? { ...m, isLoading: true } : m));
                try {
                    await options.onConfirm();
                    close(id);
                } catch (error) {
                    console.error('[ModalProvider] Error in confirm modal:', error);
                    // Revert loading state if it threw an error
                    setModals((prev) => prev.map(m => m.id === id ? { ...m, isLoading: false } : m));
                }
            };
        } else {
            wrappedOnConfirm = async () => {
                if (typeof options.onConfirm === 'function') {
                    await options.onConfirm();
                }
                close(id);
            };
        }

        const newModal = {
            ...options,
            id,
            type,
            onConfirm: wrappedOnConfirm,
        };

        setModals((prev) => [...prev, newModal]);

        // Optional auto-close functionality
        if (options.timeout && typeof options.timeout === 'number') {
            setTimeout(() => {
                close(id);
            }, options.timeout);
        }

        return id;
    }, [close]);

    const contextValue = useMemo(() => ({
        modals,
        alert: (opts) => openModal('alert', opts),
        success: (opts) => openModal('success', opts),
        warning: (opts) => openModal('warning', opts),
        error: (opts) => openModal('error', opts),
        confirm: (opts) => openModal('confirm', opts),
        close,
    }), [modals, openModal, close]);

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <ModalRoot modals={modals} close={close} theme={theme} />
        </ModalContext.Provider>
    );
};
