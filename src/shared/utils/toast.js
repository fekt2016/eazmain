/**
 * Single-toast helpers for cart and other success messages.
 * Uses a fixed toast ID so only one toast shows at a time; repeated triggers reset the timer.
 * Style: bottom position, rounded pill, soft green background, white text, subtle shadow.
 */
import { toast } from 'react-toastify';

export const CART_SUCCESS_TOAST_ID = 'saiisai-cart-success';

const TOAST_AUTOCLOSE = 2000;

export function showCartSuccessToast(message = 'Item added to cart successfully!') {
  const opts = {
    toastId: CART_SUCCESS_TOAST_ID,
    position: 'bottom-center',
    autoClose: TOAST_AUTOCLOSE,
    hideProgressBar: true,
    closeButton: true,
    style: {
      background: '#22c55e',
      color: '#ffffff',
      borderRadius: '9999px',
      padding: '8px 16px',
      fontSize: '13px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      maxWidth: '320px',
    },
  };

  if (toast.isActive(CART_SUCCESS_TOAST_ID)) {
    toast.update(CART_SUCCESS_TOAST_ID, { render: message, ...opts, autoClose: TOAST_AUTOCLOSE });
  } else {
    toast.success(message, opts);
  }
}
