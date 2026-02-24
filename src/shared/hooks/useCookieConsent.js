import { useState, useEffect, useCallback } from 'react';
import {
  GA_MEASUREMENT_ID,
  FB_PIXEL_ID,
  TIKTOK_PIXEL_ID,
} from '../config/appConfig';

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────

const COOKIE_CONSENT_KEY = 'cookie_consent_eazshop';
const BANNER_DISMISSED_KEY = 'cookie_banner_dismissed_eazshop';
const COOKIE_EXPIRY_DAYS = 365;

// Tracking IDs are provided via appConfig (Vite env wrapper)

// Facebook Pixel ID must be a numeric string (from Events Manager), not the Facebook App ID.
// Empty, "0", or "disabled" = do not load Pixel.
const isValidFacebookPixelId = (id) => {
  if (id == null) return false;
  const s = String(id).trim();
  if (s === '' || s === '0' || s.toLowerCase() === 'disabled') return false;
  return /^\d{15,16}$/.test(s);
};


// ────────────────────────────────────────────────
// Cookie Utilities
// ────────────────────────────────────────────────

const setCookie = (name, value, days = COOKIE_EXPIRY_DAYS) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// ────────────────────────────────────────────────
// LocalStorage Utilities
// ────────────────────────────────────────────────

const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage quota exceeded or disabled
  }
};

// ────────────────────────────────────────────────
// Default Consent State
// ────────────────────────────────────────────────

const getDefaultConsent = () => ({
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  preferences: false,
  performance: false,
});

// ────────────────────────────────────────────────
// Script Management
// ────────────────────────────────────────────────

const loadGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || window.gtag) return;

  // Load gtag.js
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

const unloadGoogleAnalytics = () => {
  if (window.gtag) {
    delete window.gtag;
    delete window.dataLayer;
  }
  // Remove GA scripts
  const scripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
  scripts.forEach((script) => script.remove());
};

const loadFacebookPixel = () => {
  if (!isValidFacebookPixelId(FB_PIXEL_ID) || window.fbq) return;

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  const pixelId = FB_PIXEL_ID.trim();
  try {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  } catch (err) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[CookieConsent] Facebook Pixel init failed. Use a Pixel ID from Events Manager, not the App ID.', err?.message || err);
    }
  }
};

const unloadFacebookPixel = () => {
  if (window.fbq) {
    window.fbq('consent', 'revoke');
    delete window.fbq;
  }
  // Remove FB scripts
  const scripts = document.querySelectorAll('script[src*="facebook.net"]');
  scripts.forEach((script) => script.remove());
};

const loadTikTokPixel = () => {
  if (!TIKTOK_PIXEL_ID || window.ttq) return;

  !(function (w, d, t) {
    w.ttq = w.ttq || function () {
      (w.ttq.q = w.ttq.q || []).push(arguments);
    };
    const js = d.createElement(t);
    js.src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    js.async = true;
    js.id = 'tt-pixel-script';
    d.getElementsByTagName('head')[0].appendChild(js);
  })(window, document, 'script');

  window.ttq.load(TIKTOK_PIXEL_ID);
  window.ttq.page();
};

const unloadTikTokPixel = () => {
  if (window.ttq) {
    delete window.ttq;
  }
  // Remove TikTok scripts
  const scripts = document.querySelectorAll('script[src*="tiktok.com"]');
  scripts.forEach((script) => script.remove());
};

const manageScripts = (consent) => {
  // Google Analytics (analytics)
  if (consent.analytics && GA_MEASUREMENT_ID) {
    loadGoogleAnalytics();
  } else {
    unloadGoogleAnalytics();
  }

  // Facebook Pixel (marketing) – use only if ID is valid
  if (consent.marketing && isValidFacebookPixelId(FB_PIXEL_ID)) {
    loadFacebookPixel();
  } else {
    unloadFacebookPixel();
  }

  // TikTok Pixel (marketing)
  if (consent.marketing && TIKTOK_PIXEL_ID) {
    loadTikTokPixel();
  } else {
    unloadTikTokPixel();
  }
};

// ────────────────────────────────────────────────
// E-commerce Event Tracking
// ────────────────────────────────────────────────

const trackEcommerceEvents = (consent) => ({
  trackProductView: (productId, name, price, category) => {
    if (!consent.analytics && !consent.marketing) return;

    const eventData = {
      event: 'view_item',
      ecommerce: {
        currency: 'GHS',
        value: price,
        items: [{
          item_id: productId,
          item_name: name,
          item_category: category,
          price: price,
          quantity: 1,
        }],
      },
    };

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'GHS',
        value: price,
        items: [{
          item_id: productId,
          item_name: name,
          item_category: category,
          price: price,
          quantity: 1,
        }],
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: name,
        content_ids: [productId],
        content_type: 'product',
        value: price,
        currency: 'GHS',
      });
    }

    // TikTok Pixel
    if (consent.marketing && window.ttq) {
      window.ttq.track('ViewContent', {
        content_type: 'product',
        content_id: productId,
        value: price,
        currency: 'GHS',
      });
    }
  },

  trackAddToCart: (productId, name, price, quantity = 1) => {
    if (!consent.analytics && !consent.marketing) return;

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'GHS',
        value: price * quantity,
        items: [{
          item_id: productId,
          item_name: name,
          price: price,
          quantity: quantity,
        }],
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: name,
        content_ids: [productId],
        content_type: 'product',
        value: price * quantity,
        currency: 'GHS',
      });
    }

    // TikTok Pixel
    if (consent.marketing && window.ttq) {
      window.ttq.track('AddToCart', {
        content_type: 'product',
        content_id: productId,
        value: price * quantity,
        currency: 'GHS',
      });
    }
  },

  trackRemoveFromCart: (productId, name, price, quantity = 1) => {
    if (!consent.analytics && !consent.marketing) return;

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'GHS',
        value: price * quantity,
        items: [{
          item_id: productId,
          item_name: name,
          price: price,
          quantity: quantity,
        }],
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'RemoveFromCart', {
        content_name: name,
        content_ids: [productId],
        content_type: 'product',
        value: price * quantity,
        currency: 'GHS',
      });
    }
  },

  trackWishlist: (productId, name) => {
    if (!consent.analytics && !consent.marketing) return;

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'add_to_wishlist', {
        items: [{
          item_id: productId,
          item_name: name,
        }],
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'AddToWishlist', {
        content_name: name,
        content_ids: [productId],
        content_type: 'product',
      });
    }
  },

  trackBeginCheckout: (cartTotal, items) => {
    if (!consent.analytics && !consent.marketing) return;

    const formattedItems = items.map((item) => ({
      item_id: item.productId || item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }));

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'GHS',
        value: cartTotal,
        items: formattedItems,
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: cartTotal,
        currency: 'GHS',
        contents: formattedItems.map((item) => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price,
        })),
      });
    }

    // TikTok Pixel
    if (consent.marketing && window.ttq) {
      window.ttq.track('InitiateCheckout', {
        value: cartTotal,
        currency: 'GHS',
        contents: formattedItems,
      });
    }
  },

  trackPurchase: (orderId, amount, items) => {
    if (!consent.analytics && !consent.marketing) return;

    const formattedItems = items.map((item) => ({
      item_id: item.productId || item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }));

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: amount,
        currency: 'GHS',
        items: formattedItems,
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: amount,
        currency: 'GHS',
        contents: formattedItems.map((item) => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price,
        })),
      });
    }

    // TikTok Pixel
    if (consent.marketing && window.ttq) {
      window.ttq.track('CompletePayment', {
        value: amount,
        currency: 'GHS',
        contents: formattedItems,
      });
    }
  },

  trackSearch: (query) => {
    if (!consent.analytics && !consent.marketing) return;

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'Search', {
        search_string: query,
      });
    }
  },

  trackCategoryView: (category) => {
    if (!consent.analytics && !consent.marketing) return;

    // Google Analytics
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'view_item_list', {
        item_list_name: category,
      });
    }

    // Facebook Pixel
    if (consent.marketing && window.fbq) {
      window.fbq('track', 'ViewCategory', {
        content_category: category,
      });
    }
  },
});

// ────────────────────────────────────────────────
// Preference Management
// ────────────────────────────────────────────────

const PREFERENCE_KEYS = {
  CATEGORIES: 'eazshop_preferred_categories',
  RECENT_PRODUCTS: 'eazshop_recent_products',
  SEARCH_TERMS: 'eazshop_search_terms',
  VISITED_SELLERS: 'eazshop_visited_sellers',
  DELIVERY_METHOD: 'eazshop_delivery_method',
};

const savePreference = (key, value, maxItems = 10) => {
  if (!getLocalStorage(COOKIE_CONSENT_KEY)?.preferences) return;

  const current = getLocalStorage(key, []);
  let updated = [];

  if (Array.isArray(value)) {
    updated = [...value];
  } else if (Array.isArray(current)) {
    // Add to array if not already present
    if (!current.includes(value)) {
      updated = [value, ...current].slice(0, maxItems);
    } else {
      // Move to front if already exists
      updated = [value, ...current.filter((item) => item !== value)].slice(0, maxItems);
    }
  } else {
    updated = value;
  }

  setLocalStorage(key, updated);
};

const getPreference = (key, defaultValue = null) => {
  if (!getLocalStorage(COOKIE_CONSENT_KEY)?.preferences) return defaultValue;
  return getLocalStorage(key, defaultValue);
};

// ────────────────────────────────────────────────
// Main Hook
// ────────────────────────────────────────────────

export const useCookieConsent = () => {
  const [consent, setConsentState] = useState(getDefaultConsent());
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  // Initialize consent from cookie
  useEffect(() => {
    const savedConsent = getCookie(COOKIE_CONSENT_KEY);
    const bannerDismissed = getCookie(BANNER_DISMISSED_KEY);

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsentState({ ...getDefaultConsent(), ...parsed });
      } catch (error) {
        // Invalid cookie, use defaults
        setConsentState(getDefaultConsent());
      }
    } else {
      setConsentState(getDefaultConsent());
    }

    setShouldShowBanner(!bannerDismissed);
  }, []);

  // Manage scripts based on consent
  useEffect(() => {
    manageScripts(consent);
    
    // Cleanup: Unload all scripts when component unmounts
    return () => {
      unloadGoogleAnalytics();
      unloadFacebookPixel();
      unloadTikTokPixel();
    };
  }, [consent]);

  // Dispatch custom event when consent changes
  useEffect(() => {
    const event = new CustomEvent('cookieConsentUpdated', {
      detail: { consent },
    });
    window.dispatchEvent(event);
  }, [consent]);

  const updateConsent = useCallback((newConsent) => {
    const updated = { ...getDefaultConsent(), ...newConsent };
    updated.necessary = true; // Always enforce necessary
    setConsentState(updated);
    setCookie(COOKIE_CONSENT_KEY, JSON.stringify(updated));
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      performance: true,
    };
    updateConsent(allAccepted);
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, [updateConsent]);

  const acceptEssential = useCallback(() => {
    const essential = getDefaultConsent();
    updateConsent(essential);
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, [updateConsent]);

  const savePreferences = useCallback((preferences) => {
    updateConsent({
      ...consent,
      ...preferences,
    });
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, [consent, updateConsent]);

  const dismissBanner = useCallback(() => {
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, []);

  // Preference helpers
  const preferenceHelpers = {
    savePreferredCategory: (category) => {
      savePreference(PREFERENCE_KEYS.CATEGORIES, category);
    },
    getPreferredCategories: () => getPreference(PREFERENCE_KEYS.CATEGORIES, []),
    saveRecentProduct: (productId) => {
      savePreference(PREFERENCE_KEYS.RECENT_PRODUCTS, productId);
    },
    getRecentProducts: () => getPreference(PREFERENCE_KEYS.RECENT_PRODUCTS, []),
    saveSearchTerm: (term) => {
      savePreference(PREFERENCE_KEYS.SEARCH_TERMS, term);
    },
    getSearchTerms: () => getPreference(PREFERENCE_KEYS.SEARCH_TERMS, []),
    saveVisitedSeller: (sellerId) => {
      savePreference(PREFERENCE_KEYS.VISITED_SELLERS, sellerId);
    },
    getVisitedSellers: () => getPreference(PREFERENCE_KEYS.VISITED_SELLERS, []),
    saveDeliveryMethod: (method) => {
      setLocalStorage(PREFERENCE_KEYS.DELIVERY_METHOD, method);
    },
    getDeliveryMethod: () => getPreference(PREFERENCE_KEYS.DELIVERY_METHOD, null),
  };

  return {
    consent,
    shouldShowBanner,
    acceptAll,
    acceptEssential,
    savePreferences,
    dismissBanner,
    trackEcommerceEvents: trackEcommerceEvents(consent),
    preferences: preferenceHelpers,
  };
};

export default useCookieConsent;

