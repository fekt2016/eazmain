/**
 * Token Diagnostics Utility
 * Helps debug token storage and retrieval issues
 */

export const tokenDiagnostics = {
  // Check if token exists in localStorage
  checkToken: () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('[TokenDiagnostics] Not in browser environment');
      return null;
    }

    const token = localStorage.getItem('token');
    console.log('[TokenDiagnostics] Token in localStorage:', token ? `Yes (${token.length} chars)` : 'No');
    
    if (token) {
      try {
        // Try to decode JWT (without verification)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('[TokenDiagnostics] Token payload:', {
            id: payload.id,
            role: payload.role,
            exp: new Date(payload.exp * 1000).toISOString(),
            iat: new Date(payload.iat * 1000).toISOString(),
          });
          
          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            console.warn('[TokenDiagnostics] ⚠️ Token is expired!');
            return { token, expired: true, payload };
          }
          console.log('[TokenDiagnostics] ✅ Token is valid');
          return { token, expired: false, payload };
        }
      } catch (error) {
        console.error('[TokenDiagnostics] Error parsing token:', error);
      }
    }
    
    return { token, expired: false, payload: null };
  },

  // Check all localStorage keys related to auth
  checkAllAuthStorage: () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {};
    }

    const authKeys = ['token', 'seller_token', 'admin_token', 'current_role'];
    const result = {};
    
    authKeys.forEach(key => {
      const value = localStorage.getItem(key);
      result[key] = value ? `Exists (${value.length} chars)` : 'Not found';
    });
    
    console.log('[TokenDiagnostics] All auth storage:', result);
    return result;
  },

  // Clear all auth tokens
  clearAllTokens: () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('seller_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('current_role');
    console.log('[TokenDiagnostics] All tokens cleared');
  },
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.tokenDiagnostics = tokenDiagnostics;
}

export default tokenDiagnostics;

