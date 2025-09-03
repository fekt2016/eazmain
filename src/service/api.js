import axios from "axios";

// API configuration
const API_CONFIG = {
  DEVELOPMENT: "http://localhost:4000/api/v1",
  PRODUCTION: "https://eazworld.com:6000/api/v1",
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
  "/seller/public-profile",
  "/seller/profile/:sellerId",
  "/public/docs",
  "/health-check",
  "follow/:sellerId/followers",
  "/users/register",
  "/users/signup",
  "users/login",
  "/wishlist/sync",
];

const PUBLIC_GET_ENDPOINTS = [
  /^\/product\/[a-fA-F\d]{24}$/,
  /^\/product\/\d+$/,
  /^\/seller\/[^/]+\/public-profile$/,
  /^\/seller\/public\/[^/]+$/,
  /^\/seller\/(?!me\/)[^/]+\/products$/,
  /^\/category\/[^/]+$/,
  /^\/public\/.+$/,
];

// Token keys by role
const TOKEN_KEYS = {
  seller: "seller_token",
  admin: "admin_token",
  user: "token",
};

// Helper functions
const getBaseURL = () => {
  // Use environment variable if available (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  console.log("getBaseURL called");
  // Try to detect environment using multiple methods
  try {
    console.log(
      "testing",
      typeof window !== "undefined" &&
        window.location &&
        window.location.hostname
    );
    // Method 1: Check if we're in a browser environment with access to window
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.hostname
    ) {
      console.log("Detected browser environment");
      const { hostname } = window.location;
      console.log("Detected hostname:", hostname);

      // Development environment (localhost or local IP)
      if (
        hostname === "localhost" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".local")
      ) {
        console.log("Development environment detected");
        return API_CONFIG.DEVELOPMENT;
      }

      // Check if we're on eazworld.com domain
      if (hostname === "eazworld.com" || hostname.endsWith(".eazworld.com")) {
        console.log("Eazworld domain detected, using production API");
        return API_CONFIG.PRODUCTION;
      }

      // For all other domains, assume production
      console.log("Other domain detected, assuming production");
      return API_CONFIG.PRODUCTION;
    }

    // Method 2: Check build mode (Vite-specific)
    if (import.meta.env.MODE === "production") {
      console.log("Production build mode detected");
      return API_CONFIG.PRODUCTION;
    }

    // Method 3: Check if we're in a Node.js environment
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "production"
    ) {
      console.log("Node.js production environment detected");
      return API_CONFIG.PRODUCTION;
    }
  } catch (error) {
    console.warn("Error detecting environment:", error);
  }

  // Default fallback - assume development
  console.log("Could not detect environment, defaulting to development");
  return API_CONFIG.DEVELOPMENT;
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

const getAuthToken = () => {
  // Check if we're in a browser environment before accessing localStorage
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { token: null, role: "user" };
  }

  try {
    const role = localStorage.getItem("current_role") || "user";
    const tokenKey = TOKEN_KEYS[role] || "token";

    return {
      token: localStorage.getItem(tokenKey),
      role,
    };
  } catch (error) {
    console.warn("Error accessing localStorage:", error);
    return { token: null, role: "user" };
  }
};

// Create axios instance with a baseURL that might be updated later
let baseURL = API_CONFIG.DEVELOPMENT; // Default value

// Function to initialize the API with the correct base URL
const initializeAPI = () => {
  baseURL = getBaseURL();
  console.log("API Base URL:", baseURL);
  console.log("API Config:", window);

  // Update the axios instance with the correct base URL
  api.defaults.baseURL = baseURL;
};

const api = axios.create({
  baseURL, // This will be updated by initializeAPI
  withCredentials: true,
  timeout: API_CONFIG.TIMEOUT,
});

// Initialize the API when this module is loaded
initializeAPI();

// Request interceptor
api.interceptors.request.use((config) => {
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method ? config.method.toLowerCase() : "get";

  console.debug(`[API] ${method.toUpperCase()} ${normalizedPath}`);

  // Skip authentication for public routes
  if (isPublicRoute(normalizedPath, method)) {
    return config;
  }

  // Add authentication for protected routes
  const { token, role } = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["x-user-role"] = role;
    config.roleContext = role;
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Export a function to reinitialize the API if needed
export const reinitializeAPI = () => {
  initializeAPI();
};

export default api;
