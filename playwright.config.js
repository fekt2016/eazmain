import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Security Tests
 * 
 * Run tests against:
 * - Dev server: npm run dev (default)
 * - Production build: npm run build && npm run preview
 * 
 * IMPORTANT: This configuration uses Playwright's bundled browsers (not system browsers).
 * Browsers are automatically downloaded and updated when you run `npx playwright install`.
 * This ensures we always use up-to-date browser builds with current ffmpeg versions,
 * avoiding "frozen ffmpeg browser" warnings on older macOS versions.
 */
export default defineConfig({
  testDir: './tests/e2e/security',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL - can be overridden with --baseURL flag
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
    
    // SECURITY: Use Playwright's bundled browsers (not system browsers)
    // This ensures we use up-to-date browser builds with current ffmpeg
    // Do NOT set executablePath - let Playwright use bundled browsers
  },

  // Configure projects for major browsers
  // These use Playwright's bundled browser binaries (automatically downloaded)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use bundled Chromium (default) - no executablePath needed
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Use bundled Firefox (default) - no executablePath needed
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Use bundled WebKit (default) - no executablePath needed
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: process.env.PLAYWRIGHT_SKIP_SERVER ? undefined : {
    command: process.env.NODE_ENV === 'production' 
      ? 'npm run preview' 
      : 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

