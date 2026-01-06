import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'playwright-report', 'test-results']),
  // Exclude scripts, config files, and test files from console rule
  {
    files: ['scripts/**', '*.config.js', 'tests/**', 'playwright.config.js'],
    rules: {
      'no-console': 'off', // Allow console in scripts and config files
      'no-undef': 'off', // Allow Node.js globals in config files
    },
  },
  // Allow console usage only in logger.js
  {
    files: ['src/shared/utils/logger.js'],
    rules: {
      'no-console': 'off', // Allow all console methods in logger file
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['scripts/**', '*.config.js', 'tests/**', 'playwright.config.js', 'src/shared/utils/logger.js'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Disallow console usage in source code (except logger.js which is ignored above)
      'no-console': 'error', // No console methods allowed in source code
    },
  },
])
