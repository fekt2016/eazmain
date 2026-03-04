import { useModal as useNewModal } from '../../components/modal';

export function useModal() {
    const modal = useNewModal();

    const showWarning = ({ title, message, onConfirm, confirmText = 'Continue', cancelText = 'Cancel' }) =>
        modal.warning({ title, message, onConfirm, confirmText, cancelText });

    const showDanger = ({ title, message, onConfirm, confirmText = 'Delete', cancelText = 'Cancel' }) =>
        modal.error({ title, message, onConfirm, confirmText, cancelText });

    const showSuccess = ({ title, message, onConfirm, confirmText = 'Continue' }) =>
        modal.success({ title, message, onConfirm, confirmText });

    const showInfo = ({ title, message, onConfirm, confirmText = 'Got it' }) =>
        modal.alert({ title, message, onConfirm, confirmText });

    return { showWarning, showDanger, showSuccess, showInfo, hideModal: modal.close };
}
