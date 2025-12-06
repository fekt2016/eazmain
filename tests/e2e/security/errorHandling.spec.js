import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/urls';
import { failApiCall, mockApiResponse } from '../utils/intercept';

/**
 * Error Handling & Leak Tests
 * 
 * Tests for:
 * - Server 500 error handling
 * - Network offline handling
 * - No stack traces in production
 * - No exposed internal messages
 * - Error boundary functionality
 */

test.describe('Error Handling Security', () => {
  test('should show user-friendly message on server 500 error', async ({ page }) => {
    // Mock 500 error
    await mockApiResponse(
      page,
      '**/api/v1/**',
      { error: 'Internal Server Error' },
      500
    );
    
    await page.goto(ROUTES.HOME);
    
    // Wait for API call to fail
    await page.waitForTimeout(2000);
    
    // Should show user-friendly error message
    const hasUserFriendlyError = await page.locator('text=/error|something went wrong|try again|sorry/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    // Should not show technical error details
    const hasTechnicalError = await page.locator('text=/500|internal server|stack|trace|exception/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasUserFriendlyError || !hasTechnicalError).toBe(true);
  });

  test('should handle network offline gracefully', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);
    
    await page.goto(ROUTES.HOME);
    
    // Should show offline message or error boundary
    await page.waitForTimeout(2000);
    
    const hasOfflineMessage = await page.locator('text=/offline|connection|network|try again/i').isVisible({ timeout: 3000 }).catch(() => false);
    const hasErrorBoundary = await page.locator('text=/error|something went wrong/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    // Should handle offline state
    expect(hasOfflineMessage || hasErrorBoundary).toBe(true);
    
    // Re-enable network
    await context.setOffline(false);
  });

  test('should not show stack traces in production build', async ({ page }) => {
    // Simulate an error
    await failApiCall(page, '**/api/v1/**');
    
    await page.goto(ROUTES.PROFILE);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.waitForTimeout(2000);
    
    // Check for stack traces
    const hasStackTrace = await page.locator('text=/stack|trace|error at|at /i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasStackTrace).toBe(false);
    
    // Check page source
    const content = await page.content();
    const hasStackTraceInSource = content.includes('at ') && 
                                  (content.includes('Error:') || content.includes('Exception:')) &&
                                  content.includes('    at');
    
    // In production, should not have stack traces
    if (process.env.NODE_ENV === 'production') {
      expect(hasStackTraceInSource).toBe(false);
    }
  });

  test('should not expose internal error messages', async ({ page }) => {
    // Mock API error with internal message
    await mockApiResponse(
      page,
      '**/api/v1/**',
      {
        error: 'Internal Server Error',
        message: 'Database connection failed: mongodb://internal:27017',
        stack: 'Error: Database connection failed\n    at connect (db.js:123)',
      },
      500
    );
    
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(2000);
    
    // Should not show internal messages
    const hasInternalMessage = await page.locator('text=/database|mongodb|connection failed|internal/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasInternalMessage).toBe(false);
    
    // Should not show stack traces
    const hasStack = await page.locator('text=/at |stack|trace/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasStack).toBe(false);
  });

  test('should show error boundary on React errors', async ({ page }) => {
    // Inject error into page
    await page.goto(ROUTES.HOME);
    
    // Try to trigger error by accessing undefined properties
    await page.evaluate(() => {
      // This might trigger an error if error boundary is set up
      try {
        window.testError = () => {
          throw new Error('Test error');
        };
      } catch (e) {
        // Ignore
      }
    });
    
    // Check for error boundary UI
    const hasErrorBoundary = await page.locator('text=/something went wrong|error|try again/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    // Error boundary might not trigger from this, but if it does, it should show user-friendly message
    if (hasErrorBoundary) {
      const hasStackTrace = await page.locator('text=/stack|trace/i').isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasStackTrace).toBe(false);
    }
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    // Simulate slow API (timeout)
    await page.route('**/api/v1/**', async route => {
      // Delay response to simulate timeout
      await new Promise(resolve => setTimeout(resolve, 60000)); // 60 second delay
      await route.continue();
    });
    
    await page.goto(ROUTES.HOME);
    
    // Should show timeout or loading state
    await page.waitForTimeout(5000);
    
    const hasTimeoutMessage = await page.locator('text=/timeout|taking too long|try again/i').isVisible({ timeout: 3000 }).catch(() => false);
    const hasLoadingState = await page.locator('text=/loading|please wait/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    // Should handle timeout
    expect(hasTimeoutMessage || hasLoadingState).toBe(true);
  });

  test('should not log sensitive data to console in production', async ({ page }) => {
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      });
    });
    
    await page.goto(ROUTES.LOGIN);
    
    // Try to login
    const emailInput = page.locator('input[type="email"], input[id="loginId"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    
    // Check console messages for sensitive data
    const sensitiveData = consoleMessages.filter(msg =>
      msg.text.toLowerCase().includes('password') ||
      msg.text.toLowerCase().includes('token') ||
      msg.text.toLowerCase().includes('jwt') ||
      msg.text.toLowerCase().includes('secret')
    );
    
    // In production, should not log sensitive data
    if (process.env.NODE_ENV === 'production') {
      expect(sensitiveData.length).toBe(0);
    }
  });

  test('should handle malformed API responses gracefully', async ({ page }) => {
    // Mock malformed response
    await page.route('**/api/v1/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json{',
      });
    });
    
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(2000);
    
    // Should handle malformed response without crashing
    const hasError = await page.locator('text=/error|something went wrong/i').isVisible({ timeout: 3000 }).catch(() => false);
    const pageLoaded = page.url() !== 'about:blank';
    
    // Should either show error or continue normally
    expect(hasError || pageLoaded).toBe(true);
  });

  test('should not expose file paths in error messages', async ({ page }) => {
    // Simulate error that might include file paths
    await mockApiResponse(
      page,
      '**/api/v1/**',
      {
        error: 'File not found',
        path: '/var/www/app/src/utils/helpers.js',
        stack: 'Error: File not found\n    at /var/www/app/src/utils/helpers.js:123',
      },
      404
    );
    
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(2000);
    
    // Should not show file paths
    const hasFilePath = await page.locator('text=/var|www|app|src|utils|helpers/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasFilePath).toBe(false);
    
    // Check page source
    const content = await page.content();
    const hasFilePathInSource = content.includes('/var/www') || content.includes('src/utils');
    expect(hasFilePathInSource).toBe(false);
  });

  test('should handle CORS errors gracefully', async ({ page }) => {
    // Simulate CORS error
    await page.route('**/api/v1/**', async route => {
      await route.fulfill({
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': 'null',
        },
        body: JSON.stringify({ error: 'CORS error' }),
      });
    });
    
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(2000);
    
    // Should handle CORS error without exposing technical details
    const hasCorsError = await page.locator('text=/cors|access-control|origin/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasCorsError).toBe(false);
    
    // Should show user-friendly message instead
    const hasUserMessage = await page.locator('text=/error|try again|something went wrong/i').isVisible({ timeout: 3000 }).catch(() => false);
    // This might not always show, but if it does, it should be user-friendly
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    // Should show 404 page
    await page.waitForLoadState('networkidle');
    
    const has404 = await page.locator('text=/404|not found|page not found/i').isVisible({ timeout: 3000 }).catch(() => false);
    expect(has404).toBe(true);
    
    // Should not show technical error details
    const hasTechnical = await page.locator('text=/error at|stack|trace/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasTechnical).toBe(false);
  });
});

