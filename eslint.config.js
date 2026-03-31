import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'playwright-report', 'test-results', 'update-imports.js']),
  // Scripts, config files
  {
    files: ['scripts/**', '*.config.js', 'tests/**', 'playwright.config.js'],
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
    },
  },
  // Allow console usage only in logger.js
  {
    files: ['src/shared/utils/logger.js'],
    rules: {
      'no-console': 'off',
    },
  },
  // Main app: strict rules
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['scripts/**', '*.config.js', 'tests/**', 'playwright.config.js', 'src/shared/utils/logger.js', 'src/tests/**'],
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
      'no-console': 'error',
    },
  },
  // Test files and setup: Jest/Node globals, relaxed rules (must come after main so it overrides)
  {
    files: ['src/tests/**', '**/*.test.js', '**/*.test.jsx'],
    extends: [js.configs.recommended, reactHooks.configs['recommended-latest'], reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.jest, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_|[A-Z_]', argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': 'off',
    },
  },
])
