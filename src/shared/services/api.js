import axios from "axios";
import logger from "../utils/logger";

// API configuration
const API_CONFIG = {
  DEVELOPMENT: "http://localhost:4000/api/v1/",
  PRODUCTION: "https://eazworld.com/api/v1/",
  TIMEOUT: 500000,
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
  /^\/order\/track\/.+$/, // Public order tracking by tracking number
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
  // Debug environment variables
  // console.log("Environment mode:", import.meta.env.MODE);
  // console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  // console.log("PROD:", import.meta.env.PROD);
  // console.log("DEV:", import.meta.env.DEV);
  // console.log(window.location.hostname);

  // Use environment variable if available (highest priority)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    // console.log("Using VITE_API_URL from environment");
    return API_CONFIG.DEVELOPMENT;
  }

  // Use production API for production builds
  // console.log("Using production API", API_CONFIG.PRODUCTION);
  return API_CONFIG.PRODUCTION;
};

const getRelativePath = (url) => {
  // console.log("checking url", url);
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
      console.error("URL parsing error:", e);
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

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging
    if (error.code === 'ECONNABORTED') {
      console.error("[API] Request timeout:", error.config?.url);
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error("[API] Network error - check if backend is running:", {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
      });
    } else {
      console.error("[API] Error:", {
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
