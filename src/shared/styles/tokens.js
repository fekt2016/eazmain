/**
 * Design tokens for programmatic access.
 * Source of truth: GlobalStyles.js (:root CSS variables).
 * Use var(--token-name) in styles; use this module when you need values in JS.
 */

export const colors = {
  brand: {
    gold: '#D4882A',
    goldHover: '#B8711F',
    navy: '#1A1F2E',
  },
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#D4882A',
    600: '#D4882A',
    700: '#B8711F',
  },
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  semantic: {
    success: '#15803d',
    successHover: '#059669',
    warning: '#a16207',
    warningHover: '#d97706',
    error: '#f87171',
    errorHover: '#dc2626',
    white: '#fff',
  },
  red: {
    100: '#fee2e2',
    500: '#fcc',
    600: '#f87171',
    650: '#dc2626',
    700: '#b91c1c',
  },
  green: {
    100: '#dcfce7',
    500: '#38a169',
    600: '#059669',
    700: '#15803d',
  },
};

export const spacing = {
  xs: '0.4rem',
  sm: '0.8rem',
  md: '1.6rem',
  lg: '2.4rem',
  xl: '3.2rem',
  '2xl': '4.8rem',
  '3xl': '6.4rem',
};

export const fontSizes = {
  xs: '1.2rem',
  sm: '1.4rem',
  md: '1.6rem',
  lg: '1.8rem',
  xl: '2rem',
  '2xl': '2.4rem',
  '3xl': '3.2rem',
  '4xl': '4rem',
};

export const borderRadius = {
  tiny: '3px',
  sm: '5px',
  md: '7px',
  lg: '9px',
  xl: '12px',
  card: '10px',
  button: '8px',
  input: '6px',
};

export const shadows = {
  sm: '0 0.2rem 1rem rgba(0, 0, 0, 0.1)',
  md: '0 0.6rem 2.4rem rgba(0, 0, 0, 0.06)',
  lg: '0 2.4rem 3.2rem rgba(0, 0, 0, 0.12)',
  float: '0 4px 16px rgba(0, 0, 0, 0.08)',
  gold: '0 4px 20px rgba(255, 196, 0, 0.3)',
};

export const transitions = {
  fast: '0.15s ease',
  base: '0.3s ease',
  normal: '0.3s ease',
  slow: '0.5s ease',
};

export const layout = {
  sidebarWidth: '240px',
  headerHeight: '64px',
};

/**
 * Breakpoint values in pixels (for JS media queries, e.g. window.matchMedia).
 */
export const breakpointPx = {
  xs: 512,
  sm: 1024,
  md: 1229,
  lg: 1638,
  xl: 2048,
  '2xl': 2458,
};

/**
 * Standard mobile-first breakpoints (for future adoption).
 * See breakpoint.js for current desktop-first values.
 */
export const breakpointPxMobileFirst = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export default {
  colors,
  spacing,
  fontSizes,
  borderRadius,
  shadows,
  transitions,
  layout,
  breakpointPx,
  breakpointPxMobileFirst,
};
