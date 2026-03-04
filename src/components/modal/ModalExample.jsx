import React from 'react';
import { useModal } from './useModal';

export default function ModalExample() {
    const modal = useModal(); // Our new pure modal hook

    const handleShowSuccess = () => {
        modal.success({
            title: 'Payment Successful',
            message: 'Your order has been placed and is being processed.',
        });
    };

    const handleShowError = () => {
        modal.error({
            title: 'Action Failed',
            message: 'There was a problem processing your request. Please try again.',
            confirmText: 'Retry',
        });
    };

    const handleAsyncConfirm = () => {
        modal.confirm({
            title: 'Delete Account?',
            message: 'Are you sure you want to permanently delete your account? This action cannot be undone.',
            confirmText: 'Yes, Delete',
            cancelText: 'Keep Account',
            onConfirm: async () => {
                // Simulating an async API call
                await new Promise((resolve) => setTimeout(resolve, 2000));
                modal.success({
                    title: 'Account Deleted',
                    message: 'Your account was successfully deleted.',
                });
            },
        });
    };

    return (
        <div style={{ padding: '2rem', display: 'flex', gap: '1rem' }}>
            <button
                onClick={handleShowSuccess}
                style={{ padding: '0.8rem 1.6rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Show Success
            </button>

            <button
                onClick={handleShowError}
                style={{ padding: '0.8rem 1.6rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Show Error
            </button>

            <button
                onClick={handleAsyncConfirm}
                style={{ padding: '0.8rem 1.6rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Async Confirm (Loading State)
            </button>
        </div>
    );
}
