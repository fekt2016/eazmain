import axios from "axios";

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
