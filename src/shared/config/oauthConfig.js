const isDev = import.meta.env.DEV;

const warnedKeys = new Set();

const warnMissingEnv = (provider, envKey) => {
  if (!isDev) return;
  const id = `${provider}:${envKey}`;
  if (warnedKeys.has(id)) return;
  warnedKeys.add(id);
  // eslint-disable-next-line no-console
  console.warn(
    `[oauthConfig] ${provider} OAuth disabled: required env ${envKey} is not set. ` +
      `Set it in your .env file to enable this provider.`
  );
};

const getSafeOrigin = (explicitOrigin) => {
  if (explicitOrigin) return explicitOrigin;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
};

const getApiBaseUrl = () => {
  // Deprecated in favor of appConfig.API_BASE_URL; kept for backward compatibility if needed
  const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  return typeof apiBase === "string" ? apiBase.trim() : "";
};

export const getFacebookOAuthConfig = (origin) => {
  const clientId = import.meta.env.VITE_FACEBOOK_CLIENT_ID;

  if (!clientId) {
    warnMissingEnv("Facebook", "VITE_FACEBOOK_CLIENT_ID");
    return { enabled: false, url: null };
  }

  const safeOrigin = getSafeOrigin(origin);
  if (!safeOrigin) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn("[oauthConfig] Facebook OAuth disabled: unable to determine redirect origin.");
    }
    return { enabled: false, url: null };
  }

  const redirectUri = `${safeOrigin}/facebook-callback`;

  const url = `https://www.facebook.com/v17.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=email,public_profile`;

  return { enabled: true, url };
};

export const getGoogleOAuthConfig = (origin) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    warnMissingEnv("Google", "VITE_GOOGLE_CLIENT_ID");
    return { enabled: false, url: null };
  }

  const safeOrigin = getSafeOrigin(origin);
  if (!safeOrigin) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn("[oauthConfig] Google OAuth disabled: unable to determine redirect origin.");
    }
    return { enabled: false, url: null };
  }

  const redirectUri = `${safeOrigin}/google-callback`;

  const url = `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

  return { enabled: true, url };
};

export const getAppleOAuthConfig = (origin) => {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;

  if (!clientId) {
    warnMissingEnv("Apple", "VITE_APPLE_CLIENT_ID");
    return { enabled: false, url: null };
  }

  const safeOrigin = getSafeOrigin(origin);
  if (!safeOrigin) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn("[oauthConfig] Apple OAuth disabled: unable to determine redirect origin.");
    }
    return { enabled: false, url: null };
  }

  const redirectUri = `${safeOrigin}/apple-callback`;

  const url = `https://appleid.apple.com/auth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code%20id_token` +
    `&scope=email%20name` +
    `&response_mode=web_message`;

  return { enabled: true, url };
};

export const oauthEnvironment = {
  apiBaseUrl: getApiBaseUrl(),
};

export default {
  getFacebookOAuthConfig,
  getGoogleOAuthConfig,
  getAppleOAuthConfig,
  oauthEnvironment,
};

