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

/** Live API (HTTPS). Used when running a production build (e.g. deployed or `vite preview`). */
const PRODUCTION_API_ORIGIN = "https://api.saiisai.com";

/**
 * Local Express + Socket.io in development.
 * The Vite buyer app runs on http://localhost:5173 — that is only the UI; REST + chat use :4000.
 */
const DEVELOPMENT_API_ORIGIN = "http://localhost:4000";

/** Strip /api/v1 and normalize local dev to http (avoids https→localhost mixups). */
const normalizeEnvToApiOrigin = (raw) => {
  if (raw == null || raw === "") return null;
  let url = String(raw).trim().replace(/\/+$/, "");
  if (!url) return null;
  url = url.replace(/\/api\/v1\/?$/i, "");
  const isLocal = /localhost|127\.0\.0\.1|:4000/i.test(url);
  if (isLocal) {
    url = url.replace(/^https:\/\//i, "http://");
    if (!/^https?:\/\//i.test(url)) {
      url = `http://${url.replace(/^\/\//, "")}`;
    }
  }
  return url;
};

/** Vite dev servers — never the Socket.io/Express host (polling there returns HTML → parser error). */
const VITE_UI_PORTS = new Set(["5173", "5174", "5175"]);

const stripViteDevServerPortFromOrigin = (origin) => {
  if (!origin || typeof origin !== "string") return origin;
  const trimmed = origin.trim().replace(/\/+$/, "");
  let u;
  try {
    u = new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`);
  } catch {
    return trimmed;
  }
  const port = u.port || "";
  const loopback = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  if (loopback && VITE_UI_PORTS.has(port)) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(
        `[appConfig] ${trimmed} is a Vite UI port, not the API. Using ${u.protocol}//${u.hostname}:4000 for REST and Socket.io.`
      );
    }
    u.port = "4000";
    return u.origin;
  }
  return trimmed;
};

const envApiRaw = readEnv("VITE_API_BASE_URL") || readEnv("VITE_API_URL");
const envApiNormalized = normalizeEnvToApiOrigin(envApiRaw);
const envApiOrigin = envApiNormalized
  ? stripViteDevServerPortFromOrigin(envApiNormalized)
  : null;

/**
 * API host only (no path). Socket.io lives here; REST is `${API_ORIGIN}/api/v1`.
 * - No env: DEV → localhost:4000, production build → https://api.saiisai.com
 * - Override: set VITE_API_BASE_URL or VITE_API_URL (with or without /api/v1)
 */
export const API_ORIGIN =
  envApiOrigin || (isDev ? DEVELOPMENT_API_ORIGIN : PRODUCTION_API_ORIGIN);

const loopbackKey = (hostname) => {
  if (!hostname) return "";
  const h = String(hostname).toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return "__loopback__";
  return h;
};

/**
 * In Vite dev, proxy `/socket.io` and `/api` to the local backend so WebSocket uses the page
 * origin — CSP connect-src 'self' then allows ws: without listing every host/port.
 *
 * When the UI is opened via a LAN URL (e.g. http://192.168.1.5:5173) but the API is still
 * http://localhost:4000, connecting directly to ws://localhost:4000 is blocked ('self' is the
 * LAN origin). Using window.location.origin sends ws to the Vite dev server, which proxies.
 */
const useViteDevProxyOrigin = (apiOriginStr, pageOriginStr) => {
  if (!isDev || typeof window === "undefined") return false;
  try {
    const api = new URL(apiOriginStr);
    const page = new URL(pageOriginStr);
    if (api.protocol !== "http:") return false;
    const apiPort = api.port || "80";
    if (apiPort !== "4000") return false;
    const a = loopbackKey(api.hostname);
    if (a === "__loopback__") return true;
    return api.hostname === page.hostname;
  } catch {
    return false;
  }
};

/**
 * Host for Socket.io + `/api/v1/chat/*` fetch.
 * 1) `VITE_SOCKET_URL` when set (dev: put `http://localhost:4000` in .env so chat matches local API).
 * 2) Else same-origin Vite proxy when API is `http` + :4000 (CSP / LAN dev).
 * 3) Else `API_ORIGIN` (production builds → https://api.saiisai.com when env unset).
 */
export const getChatSocketOrigin = () => {
  const resolveExplicit = (raw) => {
    const base =
      normalizeEnvToApiOrigin(raw) ||
      String(raw).trim().replace(/\/+$/, "");
    return stripViteDevServerPortFromOrigin(base);
  };

  const explicitSocket = String(readEnv("VITE_SOCKET_URL") || "").trim();
  if (explicitSocket) {
    const base = resolveExplicit(explicitSocket);
    if (
      typeof window !== "undefined" &&
      useViteDevProxyOrigin(base, window.location.origin)
    ) {
      return window.location.origin;
    }
    return base;
  }

  if (
    typeof window !== "undefined" &&
    useViteDevProxyOrigin(API_ORIGIN, window.location.origin)
  ) {
    return window.location.origin;
  }

  return API_ORIGIN;
};

export const API_BASE_URL = `${String(API_ORIGIN).replace(/\/+$/, "")}/api/v1`;

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
  API_ORIGIN,
  getChatSocketOrigin,
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

