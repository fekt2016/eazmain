/**
 * Storage utility for managing checkout state and other temporary data
 * Supports both localStorage (web) and can be extended for AsyncStorage (mobile)
 */

const CHECKOUT_STATE_KEY = 'checkout_state';
const REDIRECT_KEY = 'pending_redirect';

export const storage = {
  // Save checkout state before redirecting to login
  saveCheckoutState: (checkoutData) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(checkoutData));
        console.log('[Storage] Checkout state saved');
      }
    } catch (error) {
      console.error('[Storage] Error saving checkout state:', error);
    }
  },

  // Restore checkout state after login
  restoreCheckoutState: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(CHECKOUT_STATE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          localStorage.removeItem(CHECKOUT_STATE_KEY);
          console.log('[Storage] Checkout state restored');
          return data;
        }
      }
    } catch (error) {
      console.error('[Storage] Error restoring checkout state:', error);
    }
    return null;
  },

  // Clear checkout state
  clearCheckoutState: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(CHECKOUT_STATE_KEY);
        console.log('[Storage] Checkout state cleared');
      }
    } catch (error) {
      console.error('[Storage] Error clearing checkout state:', error);
    }
  },

  // Save redirect path
  saveRedirect: (path) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(REDIRECT_KEY, path);
      }
    } catch (error) {
      console.error('[Storage] Error saving redirect:', error);
    }
  },

  // Get and clear redirect path
  getRedirect: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const path = localStorage.getItem(REDIRECT_KEY);
        if (path) {
          localStorage.removeItem(REDIRECT_KEY);
          return path;
        }
      }
    } catch (error) {
      console.error('[Storage] Error getting redirect:', error);
    }
    return null;
  },
};

export default storage;

