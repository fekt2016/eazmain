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

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    // Development environment (localhost or local IP)
    if (
      hostname === "localhost" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname === "127.0.0.1"
    ) {
      console.log("API Base URL:", API_CONFIG.DEVELOPMENT);
      return API_CONFIG.DEVELOPMENT;
    }
    console.log("API Base URL:", API_CONFIG.PRODUCTION);
    // Production environment
    return API_CONFIG.PRODUCTION;
  }

  // Default fallback for server-side rendering
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
  const role = localStorage.getItem("current_role") || "user";
  const tokenKey = TOKEN_KEYS[role] || "token";

  return {
    token: localStorage.getItem(tokenKey),
    role,
  };
};

// Create axios instance
const baseURL = getBaseURL();
console.log("API Base URL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method.toLowerCase();

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

export default api;
