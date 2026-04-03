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
// Dev fallback when env not set
const envApiUrl = readEnv("VITE_API_BASE_URL") || readEnv("VITE_API_URL");
export const API_BASE_URL =
  envApiUrl ||
  (typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? (() => {
        devWarnMissing("VITE_API_BASE_URL or VITE_API_URL");
        return "http://localhost:4000/api/v1";
      })()
    : null);

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

// Data Deletion Instructions URL (canonical buyer app URL)
export const DATA_DELETION_URL = `${FRONTEND_URL}/data-deletion`;

// Seller dashboard (eazseller web) — marketing links, promos
export const SELLER_APP_URL =
  readEnv('VITE_SELLER_APP_URL') || 'https://seller.saiisai.com';

/** Fallback (GHS) for cart “free shipping” messaging if /shipping/free-delivery fails; API value wins when set in admin. */
export const FREE_SHIPPING_MIN_FALLBACK_GHS = (() => {
  const raw = readEnv('VITE_FREE_SHIPPING_MIN_GHS');
  const n = raw != null && raw !== '' ? parseFloat(String(raw), 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 100;
})();

/**
 * Checkout “Bank transfer” instructions (buyer web). Override via VITE_* in .env.
 * Buyer mobile mirrors these with EXPO_PUBLIC_CHECKOUT_BANK_* (see saiisai/src/config/checkoutBankTransfer.js).
 * Defaults match previous hardcoded values.
 */
const checkoutBankStr = (key, fallback) => {
  const v = readEnv(key);
  const s = v != null ? String(v).trim() : '';
  return s !== '' ? s : fallback;
};

export const CHECKOUT_BANK_TRANSFER = (() => ({
  bankName: checkoutBankStr('VITE_CHECKOUT_BANK_NAME', 'CBG Bank'),
  branch: checkoutBankStr('VITE_CHECKOUT_BANK_BRANCH', 'Nima Branch'),
  accountName: checkoutBankStr('VITE_CHECKOUT_BANK_ACCOUNT_NAME', 'EasyworldPc'),
  accountNumber: checkoutBankStr('VITE_CHECKOUT_BANK_ACCOUNT_NUMBER', '2297931640001'),
  reference: checkoutBankStr('VITE_CHECKOUT_BANK_REFERENCE', 'Your Order Number'),
}))();

// Optional: Google Maps API key
export const GOOGLE_MAPS_API_KEY = readEnv("VITE_GOOGLE_MAPS_API_KEY");

const appConfig = {
  API_BASE_URL,
  GA_MEASUREMENT_ID,
  FB_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  FRONTEND_URL,
  DATA_DELETION_URL,
  SELLER_APP_URL,
  GOOGLE_MAPS_API_KEY,
  FREE_SHIPPING_MIN_FALLBACK_GHS,
  CHECKOUT_BANK_TRANSFER,
};

export default appConfig;

