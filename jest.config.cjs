/**
 * Jest Configuration for EazMain (CommonJS version)
 * 
 * Using .cjs extension to ensure CommonJS module resolution works correctly
 * This fixes the @jest/test-sequencer module resolution issue
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Explicitly disable test sequencer to avoid module resolution issues
  testSequencer: undefined,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],

  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Module name mapping (for CSS and other non-JS imports)
  moduleNameMapper: {
    // Path alias - must come before other mappings
    '^@/(.*)$': '<rootDir>/src/$1',
    // Swiper mocks - must come before CSS patterns
    '^swiper/react$': '<rootDir>/src/tests/__mocks__/swiper/react.js',
    '^swiper/modules$': '<rootDir>/src/tests/__mocks__/swiper/modules.js',
    '^swiper/css.*$': 'identity-obj-proxy',
    // CSS and style files (including Swiper CSS)
    '\\.(css|less|scss|sass|module\\.css)$': 'identity-obj-proxy',
    // Image and asset files
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
    // Axios mock
    '^axios$': '<rootDir>/src/tests/__mocks__/axios.js',
  },

  // Test match patterns
  testMatch: [
    '<rootDir>/src/tests/**/*.test.{js,jsx}',
    '<rootDir>/src/**/__tests__/**/*.test.{js,jsx}',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/tests/**',
    '!src/**/*.test.{js,jsx}',
    '!src/main.jsx',
    '!src/App.jsx',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,
};


