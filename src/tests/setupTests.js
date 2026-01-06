/**
 * Jest Setup File for EazMain
 * 
 * This file runs before all tests to configure the testing environment.
 * 
 * Purpose:
 * - Set up jest-dom matchers
 * - Configure global test utilities
 * - Mock window and browser APIs
 * - Set up environment variables
 */

import '@testing-library/jest-dom';
import React from 'react';

// Suppress specific React DOM warnings for styled-components props
// These are non-critical warnings about props used for styling
// Must be set up early before any components render
const originalError = console.error;
console.error = (...args) => {
  // Filter out warnings about non-boolean attributes from styled-components
  // React may pass the message in different formats, so check all arguments
  const allArgsAsString = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg);
    return String(arg);
  }).join(' ');
  
  if (
    (allArgsAsString.includes('Received') && allArgsAsString.includes('non-boolean attribute')) ||
    allArgsAsString.includes('Warning: Invalid DOM property') ||
    allArgsAsString.includes('non-boolean attribute')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Polyfill TextEncoder/TextDecoder for jsdom (required by React Router and other libraries)
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set up environment variables for tests
process.env.VITE_API_URL = process.env.VITE_API_URL || 'http://localhost:4000/api/v1';
process.env.NODE_ENV = 'test';

// Mock window.location for tests
delete window.location;
window.location = {
  hostname: 'localhost',
  origin: 'http://localhost:5173',
  href: 'http://localhost:5173',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  writable: true,
  configurable: true,
  value: jest.fn(() => Promise.resolve()),
});

// Mock navigator.clipboard - must be configurable to allow user-event to override
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true,
    value: {
      writeText: jest.fn(() => Promise.resolve()),
      readText: jest.fn(() => Promise.resolve('')),
    },
  });
} else {
  // If clipboard already exists, just ensure methods are mocked
  if (!navigator.clipboard.writeText) {
    navigator.clipboard.writeText = jest.fn(() => Promise.resolve());
  }
  if (!navigator.clipboard.readText) {
    navigator.clipboard.readText = jest.fn(() => Promise.resolve(''));
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock import.meta.env for Vite compatibility
// Vite uses import.meta.env, but Jest doesn't understand it
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        MODE: 'test',
        DEV: true,
        PROD: false,
        SSR: false,
        VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:4000/api/v1',
        VITE_API_TIMEOUT: '60000',
      },
    },
  },
  writable: true,
});

// Also mock it on window for browser context
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'import', {
    value: {
      meta: {
        env: {
          MODE: 'test',
          DEV: true,
          PROD: false,
          SSR: false,
          VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:4000/api/v1',
          VITE_API_TIMEOUT: '60000',
        },
      },
    },
    writable: true,
  });
}

// Mock logger to prevent import.meta.env issues
jest.mock('@/shared/utils/logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock API service to prevent interceptor crashes
jest.mock('@/shared/services/api', () => ({
  __esModule: true,
  default: {
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

// Mock Neighborhood dependencies
jest.mock('@/shared/hooks/useNeighborhoods', () => ({
  __esModule: true,
  useSearchNeighborhoods: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useGetNeighborhoodsByCity: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useGetNeighborhood: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

// Mock Container component to filter out non-DOM props
// This prevents "Received `true` for a non-boolean attribute `fluid`" warnings
jest.mock('@/shared/components/Container', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, fluid, constrained, ...props }) => {
      // Filter out non-DOM props (fluid, constrained)
      // Only pass valid HTML attributes to the div
      return React.createElement('div', props, children);
    },
  };
});


