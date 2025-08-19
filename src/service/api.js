import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

// 1. Public exact path matches (any HTTP method)
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
  // Add new exact-path public routes here
];

const PUBLIC_GET_ENDPOINTS = [
  /^\/product\/[a-fA-F\d]{24}$/,
  /^\/product\/\d+$/,
  /^\/seller\/[^/]+\/public-profile$/,
  /^\/seller\/public\/[^/]+$/, // For seller/public/sellerId
  /^\/seller\/(?!me\/)[^/]+\/products$/, // Fixed pattern
  /^\/category\/[^/]+$/,
  /^\/public\/.+$/,
];

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 500000,
});

// Helper functions
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

// Request interceptor
api.interceptors.request.use((config) => {
  // console.log("config", config);
  const relativePath = getRelativePath(config.url);
  // console.log("relativePath", relativePath);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method.toLowerCase();

  // Debug logs (optional)
  console.debug(`[API] ${method.toUpperCase()} ${normalizedPath}`);

  // Check public access
  const isPublicRoute = PUBLIC_ROUTES.includes(normalizedPath);
  const isPublicGet =
    method === "get" &&
    PUBLIC_GET_ENDPOINTS.some((pattern) => pattern.test(normalizedPath));

  if (isPublicRoute || isPublicGet) {
    return config; // Skip token for public routes
  }

  // PROTECTED BY DEFAULT - Add token
  const role = localStorage.getItem("current_role") || "user";
  const tokenKey =
    {
      seller: "seller_token",
      admin: "admin_token",
      user: "token",
    }[role] || "token";

  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["x-user-role"] = role;
    config.roleContext = role;
  }

  return config;
});

// Response interceptor (keep your existing implementation)
api.interceptors.response.use(
  (response) => {
    // console.log(`[API] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Your existing error handling logic
    return Promise.reject(error);
  }
);

export default api;
