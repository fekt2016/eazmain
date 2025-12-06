/**
 * Token Diagnostics Utility
 * 
 * SECURITY WARNING: This utility is deprecated and no longer functional.
 * 
 * With cookie-based authentication, tokens are stored in httpOnly cookies
 * which are NOT accessible from JavaScript. This utility cannot check
 * for tokens anymore.
 * 
 * @deprecated This utility no longer works with cookie-based authentication.
 * Use browser DevTools > Application > Cookies to inspect httpOnly cookies.
 * 
 * For debugging authentication, use the useAuth hook:
 * ```jsx
 * import useAuth from './hooks/useAuth';
 * const { userData, isLoading, error } = useAuth();
 * ```
 */
import logger from './logger';

export const tokenDiagnostics = {
  // Check if token exists in localStorage
  // SECURITY: This function no longer works with cookie-based authentication.
  // Tokens are in httpOnly cookies which are not accessible from JavaScript.
  checkToken: () => {
    if (import.meta.env.DEV) {
      logger.warn(
        '[TokenDiagnostics] This utility is deprecated. ' +
        'With cookie-based auth, tokens are in httpOnly cookies and not accessible from JavaScript. ' +
        'Use useAuth hook or browser DevTools to check authentication status.'
      );
    }
    
    // Return null - we cannot check for tokens in httpOnly cookies
    return null;
    
    // Cannot check tokens in httpOnly cookies from JavaScript
    return { token: null, expired: false, payload: null };
  },

  // Check all localStorage keys related to auth
  // SECURITY: This function is deprecated. With cookie-based auth, tokens are not in localStorage.
  checkAllAuthStorage: () => {
    if (import.meta.env.DEV) {
      logger.warn(
        '[TokenDiagnostics] checkAllAuthStorage is deprecated. ' +
        'With cookie-based auth, tokens are in httpOnly cookies, not localStorage.'
      );
    }
    
    // Return empty object - tokens are not in localStorage anymore
    return {
      token: 'Not in localStorage (using httpOnly cookies)',
      seller_token: 'Not in localStorage (using httpOnly cookies)',
      admin_token: 'Not in localStorage (using httpOnly cookies)',
      current_role: 'Not in localStorage (use useAuth hook)',
    };
  },

  // Clear all auth tokens
  // SECURITY: This function is deprecated. With cookie-based auth, tokens are in httpOnly cookies.
  // To logout, use the logout function from useAuth hook which calls the backend logout endpoint.
  clearAllTokens: () => {
    if (import.meta.env.DEV) {
      logger.warn(
        '[TokenDiagnostics] clearAllTokens is deprecated. ' +
        'With cookie-based auth, tokens are in httpOnly cookies. ' +
        'Use logout() from useAuth hook to properly clear authentication.'
      );
    }
    
    // Clear any legacy localStorage tokens (shouldn't exist, but clean up just in case)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('seller_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('current_role');
    }
    
    // Note: httpOnly cookies can only be cleared by the server via logout endpoint
  },
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.tokenDiagnostics = tokenDiagnostics;
}

export default tokenDiagnostics;

