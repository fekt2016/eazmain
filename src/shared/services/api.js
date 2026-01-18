import axios from "axios";
import logger from "../utils/logger";

// API configuration
// SECURITY: Use environment variables for API URLs
// Priority: VITE_API_BASE_URL > VITE_API_URL (backward compat) > production default
const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "60000", 10), // 60 seconds (reduced from 500s for better UX)
};

// Public routes configuration
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/product",
  "/product/category-counts",
  "/product/eazshop", // Public EazShop products endpoint
  "/seller/public-profile",
  "/seller/profile/:sellerId",
  "/public/docs",
  "/health-check",
  "follow/:sellerId/followers",
  "/users/register",
  "/users/signup",
  "/users/login",
  "/wishlist/sync",
  "/discount",
  "/newsletter",
  "/search/results",
  "/search/suggestions", // Public search suggestions endpoint
  "/search/query", // Public search query endpoint
  "/recommendations/products", // Public recommendation endpoints
  "/neighborhoods", // Public neighborhood routes
  "/neighborhoods/search", // Neighborhood search
  "/shipping/pickup-centers", // Public pickup centers endpoint
];

const PUBLIC_GET_ENDPOINTS = [
  /^\/product\/[a-fA-F\d]{24}$/,
  /^\/product\/\d+$/,
  /^\/product\/eazshop$/, // EazShop products
  /^\/seller\/[^/]+\/public-profile$/,
  /^\/seller\/public\/[^/]+$/,
  /^\/seller\/(?!me\/)[^/]+\/products$/,
  /^\/category\/[^/]+$/,
  /^\/categories$/, // Public categories endpoint
  /^\/categories\/parents$/, // Public parent categories endpoint
  /^\/public\/.+$/,
  /^\/neighborhoods\/search/, // Neighborhood search
  /^\/neighborhoods\/city\/.+/, // Neighborhoods by city
  /^\/neighborhoods\/[a-fA-F\d]{24}$/, // Single neighborhood by ID
  /^\/neighborhoods\/[a-fA-F\d]{24}\/map-url$/, // Neighborhood map URL
  /^\/order\/track\/.+$/, // Public order tracking by tracking number (FIX: Already included)
  /^\/shipping\/pickup-centers/, // Pickup centers endpoint (with optional query params)
  /^\/search\/suggestions\/.+/, // Search suggestions endpoint
  /^\/search\/query\/.+/, // Search query endpoint
  /^\/recommendations\/products\/[a-fA-F\d]{24}\/related/, // Related products
  /^\/recommendations\/products\/[a-fA-F\d]{24}\/also-bought/, // Also bought
  /^\/recommendations\/products\/[a-fA-F\d]{24}\/ai-similar/, // AI similar
  /^\/recommendations\/products\/trending/, // Trending products
];

// Helper functions
// Determine base URL based on environment variable or defaults
// Priority: Localhost detection > VITE_API_BASE_URL > VITE_API_URL > production default
const getBaseURL = () => {
  // STRICT LOCAL DEV: Always use localhost in development mode
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Local development detection (highest priority)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      console.log('[getBaseURL] 🔒 Detected localhost - forcing http://localhost:4000/api/v1');
      return "http://localhost:4000/api/v1";
    }
  }
  
  // If in development mode, default to localhost (even if env var is set to production)
  if (isDevelopment) {
    console.warn('[getBaseURL] ⚠️ Development mode detected - using localhost (ignoring env vars if set to production)');
    return "http://localhost:4000/api/v1";
  }
  
  // Check for API_BASE_URL environment variable
  // Supports both VITE_API_BASE_URL and VITE_API_URL for backward compatibility
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  if (apiBaseUrl) {
    // Remove trailing slashes and ensure /api/v1 is appended if not present
    let url = apiBaseUrl.trim().replace(/\/+$/, '');
    
    // Force HTTP for localhost URLs (even if env var has https)
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':4000')) {
      url = url.replace(/^https:\/\//i, 'http://');
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url.replace(/^\/\//, '');
      }
      console.log('[getBaseURL] 🔒 Forced HTTP for localhost:', url);
    }
    
    // If URL doesn't already include /api/v1, append it
    if (!url.includes('/api/v1')) {
      url = `${url}/api/v1`;
    }
    
    return url;
  }
  
  // Production: Default to https://api.saiisai.com/api/v1
  return "https://api.saiisai.com/api/v1";
};

const getRelativePath = (url) => {
  if (url.startsWith("http")) {
    try {
      const parsedUrl = new URL(url);
      const baseUrlObj = new URL(baseURL);
      let path = parsedUrl.pathname;

      if (path.startsWith(baseUrlObj.pathname)) {
        path = path.substring(baseUrlObj.pathname.length);
      }

      return path;
    } catch (e) {
      logger.error("URL parsing error:", e);
      return url;
    }
  }

  return url.split("?")[0];
};

const normalizePath = (path) => {
  if (!path) return "/";

  let normalized = path.split("?")[0].split("#")[0];
  normalized = normalized.replace(/\/+$/, "");

  return normalized === "" ? "/" : `/${normalized}`.replace("//", "/");
};

const isPublicRoute = (normalizedPath, method) => {
  // Check exact path matches
  if (PUBLIC_ROUTES.includes(normalizedPath)) {
    return true;
  }

  // Check regex patterns for GET requests
  if (method === "get") {
    return PUBLIC_GET_ENDPOINTS.some((pattern) => pattern.test(normalizedPath));
  }

  return false;
};

// Cookie-based authentication: No need for getAuthToken function
// Browser automatically sends cookies via withCredentials: true
// Backend reads from req.cookies.jwt

// Create axios instance with a baseURL that might be updated later
let baseURL = getBaseURL();

// SECURITY: CSRF token management
// CSRF token is stored in memory (not in localStorage/cookie for security)
let csrfToken = null;
let csrfTokenPromise = null;

// Fetch CSRF token from backend
const fetchCsrfToken = async () => {
  // If we already have a token, return it
  if (csrfToken) {
    return csrfToken;
  }
  
  // If a fetch is already in progress, wait for it
  if (csrfTokenPromise) {
    try {
      return await csrfTokenPromise;
    } catch (error) {
      // If the in-progress fetch fails, return null and let the request proceed
      return null;
    }
  }
  
  // Fetch new CSRF token with a short timeout to avoid blocking
  csrfTokenPromise = axios.get(`${baseURL}/csrf-token`, {
    withCredentials: true,
    timeout: 3000, // 3 second timeout - short to avoid blocking main request
  }).then((response) => {
    const token = response?.data?.csrfToken || response?.data?.data?.csrfToken;
    if (token) {
      csrfToken = token;
      logger.debug('[API] CSRF token fetched and stored');
    } else {
      logger.warn('[API] CSRF token not found in response');
    }
    csrfTokenPromise = null;
    return token;
  }).catch((error) => {
    csrfTokenPromise = null;
    // Don't throw - just return null so the main request can proceed
    // The backend will handle CSRF validation
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      logger.debug('[API] Network error fetching CSRF token - will proceed without token');
    } else if (error.code === 'ECONNABORTED') {
      logger.debug('[API] CSRF token fetch timeout - will proceed without token');
    } else {
      logger.debug('[API] Failed to fetch CSRF token:', error.message);
    }
    return null;
  });
  
  try {
    return await csrfTokenPromise;
  } catch (error) {
    // If fetch fails, return null - don't block the main request
    return null;
  }
};

// Clear CSRF token (e.g., on logout)
const clearCsrfToken = () => {
  csrfToken = null;
  csrfTokenPromise = null;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: API_CONFIG.TIMEOUT,
});

// Log API configuration on initialization (development only)
if (import.meta.env.DEV) {
  logger.debug('[API] Initialized with configuration:', {
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
    env: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'not set',
      VITE_API_URL: import.meta.env.VITE_API_URL || 'not set',
      MODE: import.meta.env.MODE,
    },
  });
}

// Request interceptor
api.interceptors.request.use(async (config) => {
  // CRITICAL: Always use fresh baseURL from getBaseURL() to ensure localhost in dev
  const freshBaseURL = getBaseURL();
  config.baseURL = freshBaseURL;
  
  // Force HTTP for localhost URLs
  if (config.baseURL && (config.baseURL.includes('localhost') || config.baseURL.includes('127.0.0.1') || config.baseURL.includes(':4000'))) {
    config.baseURL = config.baseURL.replace(/^https:\/\//i, 'http://');
    if (!config.baseURL.startsWith('http://') && !config.baseURL.startsWith('https://')) {
      config.baseURL = 'http://' + config.baseURL.replace(/^\/\//, '');
    }
    console.log('[API Request Interceptor] 🔒 Forced HTTP baseURL:', config.baseURL);
  }
  
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method ? config.method.toLowerCase() : "get";

  logger.debug(`[API] ${method.toUpperCase()} ${normalizedPath}`);

  // Skip authentication and CSRF for public routes
  if (isPublicRoute(normalizedPath, method)) {
    return config;
  }

  // Cookie-based authentication: JWT is automatically sent via withCredentials: true
  // Backend will read from req.cookies.jwt
  // No need to manually attach Authorization header - cookie is sent automatically
  logger.debug(`[API] Cookie will be sent automatically for ${method.toUpperCase()} ${normalizedPath}`);

  // SECURITY: CSRF protection - add CSRF token to state-changing operations
  // NOTE: CSRF is only required for authenticated routes (public routes skip this)
  if (['post', 'patch', 'put', 'delete'].includes(method)) {
    // Fetch CSRF token if we don't have it
    // For authenticated routes, we need the CSRF token
    if (!isPublicRoute(normalizedPath, method)) {
      try {
        // If we already have a token, use it immediately
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
      logger.debug(`[API] CSRF token added to ${method.toUpperCase()} ${normalizedPath}`);
    } else {
          // Try to fetch token with a short timeout
          // Use Promise.race to ensure we don't wait too long
          const token = await Promise.race([
            fetchCsrfToken(),
            new Promise((resolve) => setTimeout(() => resolve(null), 1500)), // 1.5 second max wait
          ]);
          
          if (token) {
            config.headers['X-CSRF-Token'] = token;
            logger.debug(`[API] CSRF token added to ${method.toUpperCase()} ${normalizedPath}`);
          } else {
            // If CSRF token fetch failed or timed out, still proceed with the request
            // The backend will return a 403 if CSRF is required, which we'll handle
            logger.debug(`[API] No CSRF token available for ${method.toUpperCase()} ${normalizedPath} - proceeding without token`);
          }
        }
      } catch (error) {
        // If CSRF token fetch fails, log but don't block the request
        // The backend will handle CSRF validation
        logger.debug(`[API] Error fetching CSRF token for ${method.toUpperCase()} ${normalizedPath}:`, error.message);
        // Proceed without token
      }
    }
  }

  return config;
});

// Helper to check if URL is a notification endpoint
// STEP 3: Do NOT auto-logout on 401 for notification endpoints
const isNotificationEndpoint = (url) => {
  if (!url) return false;
  const normalizedUrl = url.toLowerCase();
  return (
    normalizedUrl.includes('/notifications') ||
    normalizedUrl.includes('/notification/') ||
    normalizedUrl.includes('/notifications/read/') ||
    normalizedUrl.includes('/notifications/unread')
  );
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // If response includes a new CSRF token, update it
    const newToken = response?.headers?.['x-csrf-token'] || response?.data?.csrfToken;
    if (newToken) {
      csrfToken = newToken;
      logger.debug('[API] CSRF token updated from response');
    }
    return response;
  },
  async (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    const isNotification = isNotificationEndpoint(url);
    
    // Handle CSRF token errors (403 with specific message)
    if (status === 403 && error.response?.data?.message?.includes('security token')) {
      logger.warn('[API] CSRF token invalid, clearing and will retry on next request');
      clearCsrfToken();
    }

    // Enhanced error logging with notification-specific logging
    if (isNotification) {
      console.log('[API] 🔔 Notification endpoint error:', {
        url,
        status,
        method: error.config?.method,
        message: error.response?.data?.message || error.message,
        hasCookie: document.cookie.includes('jwt'),
      });
    }

    if (error.code === 'ECONNABORTED') {
      logger.error("[API] Request timeout:", error.config?.url);
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const fullURL = error.config?.url 
        ? `${error.config.baseURL || baseURL}${error.config.url}` 
        : 'unknown';
      
      logger.error("[API] Network error - check if backend is running:", {
        url: error.config?.url,
        baseURL: error.config?.baseURL || baseURL,
        fullURL,
        method: error.config?.method,
        errorCode: error.code,
        errorMessage: error.message,
      });
      
      // In development, provide helpful debugging info
      if (import.meta.env.DEV) {
        console.error('[API] 💡 Debugging Network Error:');
        console.error(`  1. Backend URL: ${baseURL}`);
        console.error(`  2. Full request URL: ${fullURL}`);
        console.error(`  3. Check if backend is running: curl ${baseURL.replace('/api/v1', '')}/health`);
        console.error(`  4. Check browser console for CORS errors`);
        console.error(`  5. Verify VITE_API_URL in .env file (if set)`);
      }
    } else {
      logger.error("[API] Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    // STEP 3: Do NOT auto-logout on 401 for notification endpoints
    // Only logout if /auth/me or refresh token fails
    // Notification endpoints might fail due to cookie issues, but user might still be authenticated
    if (status === 401) {
      const url = error.config?.url || '';
      const normalizedUrl = url.toLowerCase();
      
      // Check if this is a critical auth endpoint that should trigger logout
      const isCriticalAuthEndpoint = 
        normalizedUrl.includes('/auth/me') ||
        normalizedUrl.includes('/auth/current-user') ||
        normalizedUrl.includes('/auth/refresh');
      
      // Check if this is a notification endpoint (should NOT trigger logout)
      if (isNotification) {
        // 401 on notification endpoint = might be cookie issue, not auth failure
        if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
          console.debug('[API] 401 on notification endpoint - NOT triggering logout');
          console.debug('[API] Endpoints: /notifications, /notifications/:id/read');
          console.debug('[API] This might be a cookie issue. User session may still be valid.');
        }
        // Add a flag to the error so useAuth can handle it differently
        error.isNotificationError = true;
      } else if (isCriticalAuthEndpoint) {
        // 401 on auth endpoint = user is not authenticated (normal state)
        if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
          console.debug('[API] User unauthenticated (401) on critical auth endpoint - will trigger logout');
        }
        // Don't set isNotificationError - let useAuth handle logout
      } else {
        // 401 on other endpoint = might be temporary or session issue
        if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
          console.debug('[API] 401 on non-critical endpoint - NOT auto-logging out');
        }
      }
    }

    return Promise.reject(error);
  }
);

// Export clearCsrfToken for use in logout
export { clearCsrfToken };

export default api;
