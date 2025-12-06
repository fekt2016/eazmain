import axios from "axios";
import logger from "../utils/logger";

// API configuration
// SECURITY: Use environment variables for API URLs
const API_CONFIG = {
  DEVELOPMENT: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1/",
  PRODUCTION: import.meta.env.VITE_API_URL || "https://eazworld.com/api/v1/",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "500000", 10),
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
  "users/login",
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
const getBaseURL = () => {
  // SECURITY: Use environment variable if available (highest priority)
  // This prevents hardcoded URLs and allows different environments
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback to hostname-based detection (less secure, but backward compatible)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
  ) {
    return API_CONFIG.DEVELOPMENT;
  }

  // Use production API for production builds
  return API_CONFIG.PRODUCTION;
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

// SECURITY: Helper to get CSRF token from cookie
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Create axios instance with a baseURL that might be updated later
let baseURL = getBaseURL();

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method ? config.method.toLowerCase() : "get";

  logger.debug(`[API] ${method.toUpperCase()} ${normalizedPath}`);

  // Skip authentication for public routes
  if (isPublicRoute(normalizedPath, method)) {
    return config;
  }

  // Cookie-based authentication: JWT is automatically sent via withCredentials: true
  // Backend will read from req.cookies.jwt
  // No need to manually attach Authorization header - cookie is sent automatically
  logger.debug(`[API] Cookie will be sent automatically for ${method.toUpperCase()} ${normalizedPath}`);

  // SECURITY: CSRF protection - add CSRF token to state-changing operations
  // Backend should provide CSRF token in response headers or initial page load
  // For now, we'll get it from cookie (backend should set it)
  if (['post', 'patch', 'put', 'delete'].includes(method)) {
    // Try to get CSRF token from cookie
    const csrfToken = getCookie('csrf-token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
      logger.debug(`[API] CSRF token added to ${method.toUpperCase()} ${normalizedPath}`);
    } else {
      // If no CSRF token, log warning (backend should provide it)
      if (import.meta.env.DEV) {
        logger.warn(`[API] No CSRF token found for ${method.toUpperCase()} ${normalizedPath} - backend should provide CSRF token`);
      }
    }
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging
    if (error.code === 'ECONNABORTED') {
      logger.error("[API] Request timeout:", error.config?.url);
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      logger.error("[API] Network error - check if backend is running:", {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
      });
    } else {
      logger.error("[API] Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
