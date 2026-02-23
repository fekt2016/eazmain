let isInitialized = false;
let isEnabled = false;
let sentryClient = null;

const getDsn = () => import.meta.env.VITE_ERROR_MONITORING_DSN;

const shouldEnableMonitoring = () => {
  if (import.meta.env.DEV) return false;
  const dsn = getDsn();
  return typeof dsn === "string" && dsn.trim().length > 0;
};

const getEnvironment = () => {
  try {
    return import.meta.env.MODE || (import.meta.env.PROD ? "production" : "development");
  } catch {
    return "production";
  }
};

const sanitizeContext = (context) => {
  if (!context || typeof context !== "object") return undefined;

  const forbiddenPattern = /(email|phone|name|password|token|address|card|cvv|ssn|nid)/i;
  const safe = {};

  Object.keys(context).forEach((key) => {
    if (!forbiddenPattern.test(key)) {
      safe[key] = context[key];
    }
  });

  return Object.keys(safe).length > 0 ? safe : undefined;
};

export const initErrorMonitoring = () => {
  if (isInitialized) return;

  isInitialized = true;

  if (!shouldEnableMonitoring()) {
    isEnabled = false;
    return;
  }

  const dsn = getDsn();

  try {
    if (typeof window !== "undefined" && window.Sentry && typeof window.Sentry.init === "function") {
      window.Sentry.init({
        dsn,
        environment: getEnvironment(),
        // Keep sampling conservative by default; can be tuned per environment.
        tracesSampleRate: 0.0,
      });

      sentryClient = window.Sentry;
      isEnabled = true;
    } else {
      // Sentry not available globally; monitoring will remain disabled until provided.
      isEnabled = false;
    }
  } catch (error) {
    isEnabled = false;
    try {
      // Use console directly here to avoid recursion into logger/error reporting.
      // eslint-disable-next-line no-console
      console.error("[errorMonitoring] Failed to initialize monitoring provider:", error);
    } catch {
      /* noop */
    }
  }
};

export const captureError = (error, context) => {
  if (!shouldEnableMonitoring()) {
    return;
  }

  if (!isInitialized) {
    initErrorMonitoring();
  }

  if (!isEnabled || !sentryClient) {
    return;
  }

  try {
    const err = error instanceof Error ? error : new Error(String(error || "Unknown error"));
    const safeContext = sanitizeContext(context);

    sentryClient.captureException(err, safeContext ? { extra: safeContext } : undefined);
  } catch (providerError) {
    // Avoid throwing from the monitoring layer; log directly to console in dev tools.
    try {
      // eslint-disable-next-line no-console
      console.warn("[errorMonitoring] Provider capture failed:", providerError);
    } catch {
      /* noop */
    }
  }
};

export default {
  initErrorMonitoring,
  captureError,
};

