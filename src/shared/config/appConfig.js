const isDev = import.meta.env.DEV;

const warnedKeys = new Set();

const devWarnMissing = (key) => {
  if (!isDev) return;
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  // eslint-disable-next-line no-console
  console.warn(`[appConfig] Required env ${key} is not set. Using safe fallback.`);
};

const readEnv = (key, { required = false } = {}) => {
  const value = import.meta.env[key];
  if (required && (value === undefined || value === null || value === "")) {
    devWarnMissing(key);
  }
  return value ?? null;
};

// API base URL (backend)
export const API_BASE_URL =
  readEnv("VITE_API_BASE_URL") ||
  readEnv("VITE_API_URL") ||
  null;

// Analytics / tracking IDs
export const GA_MEASUREMENT_ID = readEnv("VITE_GA_MEASUREMENT_ID");
export const FB_PIXEL_ID = readEnv("VITE_FB_PIXEL_ID");
export const TIKTOK_PIXEL_ID = readEnv("VITE_TIKTOK_PIXEL_ID");

// Frontend URL (canonical)
export const FRONTEND_URL = (() => {
  const envValue = readEnv("VITE_FRONTEND_URL");
  if (envValue) return envValue;

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // Last-resort fallback; safe but generic
  return "https://saiisai.com";
})();

// Data Deletion Instructions URL (Facebook App Review; canonical buyer app URL)
export const DATA_DELETION_URL = `${FRONTEND_URL}/data-deletion`;

// Optional: Google Maps API key
export const GOOGLE_MAPS_API_KEY = readEnv("VITE_GOOGLE_MAPS_API_KEY");

const appConfig = {
  API_BASE_URL,
  GA_MEASUREMENT_ID,
  FB_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  FRONTEND_URL,
  DATA_DELETION_URL,
  GOOGLE_MAPS_API_KEY,
};

export default appConfig;

