/**
 * Shared variant definitions for design system components.
 * Use with $variant transient prop in styled-components.
 */

/**
 * Text variants: body | caption | muted | primary | error | success
 */
export const textVariants = {
  body: {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-grey-700)',
    fontWeight: 400,
  },
  caption: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-grey-600)',
    fontWeight: 400,
  },
  muted: {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-grey-500)',
    fontWeight: 400,
  },
  primary: {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-primary-500)',
    fontWeight: 500,
  },
  error: {
    fontSize: 'var(--font-size-md)',
    color: 'var(--error)',
    fontWeight: 400,
  },
  success: {
    fontSize: 'var(--font-size-md)',
    color: 'var(--success)',
    fontWeight: 400,
  },
};

/**
 * Button variants (reference – implemented in Button.jsx)
 */
export const buttonVariants = [
  'primary',
  'secondary',
  'outline',
  'danger',
  'ghost',
  'success',
  'link',
];

/**
 * Input variants: default | error | success
 */
export const inputVariants = {
  default: {
    borderColor: 'var(--color-grey-300)',
    focusBorderColor: 'var(--color-primary-500)',
    focusShadow: '0 0 0 3px rgba(212, 136, 42, 0.1)',
  },
  error: {
    borderColor: 'var(--error)',
    focusBorderColor: 'var(--error)',
    focusShadow: '0 0 0 3px rgba(248, 113, 113, 0.2)',
  },
  success: {
    borderColor: 'var(--success)',
    focusBorderColor: 'var(--success)',
    focusShadow: '0 0 0 3px rgba(21, 128, 61, 0.15)',
  },
};

/**
 * Card variants: default | elevated | glass | stats
 */
export const cardVariants = {
  default: {
    background: 'var(--color-white-0)',
    borderColor: 'var(--color-grey-200)',
    boxShadow: 'var(--shadow-md)',
  },
  elevated: {
    background: 'var(--color-white-0)',
    borderColor: 'var(--color-grey-100)',
    boxShadow: 'var(--shadow-lg)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: 'none',
    backdropFilter: 'blur(20px)',
  },
  stats: {
    background: 'var(--gradient-primary)',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--color-white-0)',
  },
};
