/**
 * Mock for Vite's import.meta.env
 * 
 * This file provides a mock implementation of Vite's environment variables
 * for Jest tests that don't understand import.meta
 */

// Export mock environment variables
export const VITE_API_URL = process.env.VITE_API_URL || 'http://localhost:4000/api/v1';
export const MODE = 'test';
export const DEV = true;
export const PROD = false;
export const SSR = false;

// Mock import.meta object
if (typeof globalThis !== 'undefined') {
  if (!globalThis.import) {
    globalThis.import = {};
  }
  if (!globalThis.import.meta) {
    globalThis.import.meta = {};
  }
  globalThis.import.meta.env = {
    MODE,
    DEV,
    PROD,
    SSR,
    VITE_API_URL,
  };
}


