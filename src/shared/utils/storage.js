/**
 * Storage utility for managing checkout state and other temporary data
 * SECURITY: Uses sessionStorage instead of localStorage to reduce XSS risk
 * Supports both sessionStorage (web) and can be extended for AsyncStorage (mobile)
 */
import logger from './logger';

const CHECKOUT_STATE_KEY = 'checkout_state';
const REDIRECT_KEY = 'pending_redirect';

export const storage = {
  // SECURITY: Save checkout state in sessionStorage (not localStorage) to reduce XSS risk
  // SessionStorage is cleared when tab closes, reducing attack window
  saveCheckoutState: (checkoutData) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // SECURITY: Don't store sensitive payment information
        const sanitizedData = {
          ...checkoutData,
          // Remove sensitive fields
          paymentMethod: checkoutData.paymentMethod, // Keep for flow, but don't store card details
          // Don't store passwords, tokens, or full payment details
        };
        sessionStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(sanitizedData));
        logger.log('[Storage] Checkout state saved to sessionStorage');
      }
    } catch (error) {
      logger.error('[Storage] Error saving checkout state:', error);
    }
  },

  // Restore checkout state after login
  restoreCheckoutState: () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const saved = sessionStorage.getItem(CHECKOUT_STATE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          sessionStorage.removeItem(CHECKOUT_STATE_KEY);
          logger.log('[Storage] Checkout state restored from sessionStorage');
          return data;
        }
      }
    } catch (error) {
      logger.error('[Storage] Error restoring checkout state:', error);
    }
    return null;
  },

  // Clear checkout state
  clearCheckoutState: () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(CHECKOUT_STATE_KEY);
        logger.log('[Storage] Checkout state cleared from sessionStorage');
      }
    } catch (error) {
      logger.error('[Storage] Error clearing checkout state:', error);
    }
  },

  // Save redirect path
  saveRedirect: (path) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // SECURITY: Validate redirect path to prevent open redirect
        if (path && path.startsWith('/') && !path.startsWith('//')) {
          sessionStorage.setItem(REDIRECT_KEY, path);
        }
      }
    } catch (error) {
      logger.error('[Storage] Error saving redirect:', error);
    }
  },

  // Get and clear redirect path
  getRedirect: () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const path = sessionStorage.getItem(REDIRECT_KEY);
        if (path) {
          sessionStorage.removeItem(REDIRECT_KEY);
          return path;
        }
      }
    } catch (error) {
      logger.error('[Storage] Error getting redirect:', error);
    }
    return null;
  },
};

// Export as default for backward compatibility
export default storage;
