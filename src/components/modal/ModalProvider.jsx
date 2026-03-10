import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ModalContext } from './modalContext';
import { ModalRoot } from './ModalRoot';

// Use the built-in crypto.randomUUID() — no external uuid package needed
const generateId = () => crypto.randomUUID();

export const ModalProvider = ({ children, theme }) => {
    const [modals, setModals] = useState([]);

    const close = useCallback((id) => {
        setModals((prev) => prev.filter((modal) => modal.id !== id));
    }, []);

    const timeoutRef = useRef({});

    const openModal = useCallback((type, options) => {
        const id = generateId();

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
            timeoutRef.current[id] = setTimeout(() => {
                close(id);
                delete timeoutRef.current[id];
            }, options.timeout);
        }

        return id;
    }, [close]);

    // Cleanup all timeouts on unmount
    useEffect(() => {
        const timeouts = timeoutRef.current;
        return () => {
            Object.values(timeouts).forEach(clearTimeout);
        };
    }, []);

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
