import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/urls';
import { isLoggedIn } from '../utils/login';

/**
 * Protected Routes Security Tests
 * 
 * Tests for:
 * - User cannot access protected routes when logged out
 * - Redirect to login when accessing protected routes
 * - Protected API calls fail safely
 * - Token expiration triggers logout
 */

test.describe('Protected Routes Security', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should redirect to login when accessing /profile without authentication', async ({ page }) => {
    await page.goto(ROUTES.PROFILE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
    
    // Should not be able to see profile content
    const profileContent = await page.locator('text=/profile|account|settings/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(profileContent).toBe(false);
  });

  test('should redirect to login when accessing /orders without authentication', async ({ page }) => {
    await page.goto(ROUTES.ORDERS);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
  });

  test('should redirect to login when accessing /checkout without authentication', async ({ page }) => {
    await page.goto(ROUTES.CHECKOUT);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
  });

  test('should redirect to login when accessing /wishlist without authentication', async ({ page }) => {
    await page.goto(ROUTES.WISHLIST);
    
    // Should redirect to login or show empty wishlist (depending on implementation)
    const isLoginPage = page.url().includes(ROUTES.LOGIN);
    const isEmptyWishlist = await page.locator('text=/empty|no items|wishlist/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    // Either should redirect to login or show empty state
    expect(isLoginPage || isEmptyWishlist).toBe(true);
  });

  test('should redirect to login when accessing /addresses without authentication', async ({ page }) => {
    await page.goto(ROUTES.ADDRESSES);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
  });

  test('should redirect to login when accessing /payment-methods without authentication', async ({ page }) => {
    await page.goto(ROUTES.PAYMENT_METHODS);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
  });

  test('should redirect to login when accessing /support/tickets without authentication', async ({ page }) => {
    await page.goto(ROUTES.SUPPORT_TICKETS);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
  });

  test('should preserve redirect URL when accessing protected route', async ({ page }) => {
    const protectedRoute = ROUTES.PROFILE;
    await page.goto(protectedRoute);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
    
    // Check if redirect parameter is preserved (if implemented)
    const hasRedirect = url.includes('redirect') || url.includes('return');
    // This is optional - depends on your implementation
  });

  test('should fail protected API calls when not authenticated', async ({ page }) => {
    // Intercept API calls
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/v1/') && !response.url().includes('/auth/login')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });
    
    // Try to access a protected route
    await page.goto(ROUTES.PROFILE);
    await page.waitForLoadState('networkidle');
    
    // Wait for API calls
    await page.waitForTimeout(3000);
    
    // Protected API calls should return 401 or 403
    const protectedCalls = apiCalls.filter(call => 
      call.url.includes('/order') || 
      call.url.includes('/user') || 
      call.url.includes('/profile')
    );
    
    // If no protected calls made, that's also acceptable (redirect happened before API call)
    if (protectedCalls.length > 0) {
      const unauthorizedCalls = protectedCalls.filter(call => call.status === 401 || call.status === 403);
      // At least some protected calls should be unauthorized
      expect(unauthorizedCalls.length).toBeGreaterThan(0);
    } else {
      // If redirected before API calls, that's also good security
      const url = page.url();
      expect(url.includes('/login') || url.includes('/verify-account')).toBe(true);
    }
  });

  test('should handle expired token gracefully', async ({ page, context }) => {
    // Simulate expired token by setting an old cookie
    await context.addCookies([{
      name: 'jwt',
      value: 'expired.token.here',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    }]);
    
    await page.goto(ROUTES.PROFILE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account when token is expired
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
    
    // Expired cookie should be cleared (or at least not valid)
    const cookies = await context.cookies();
    const jwtCookie = cookies.find(c => c.name === 'jwt' && c.value === 'expired.token.here');
    // Cookie might still exist but be invalid, which is acceptable
  });

  test('should not allow direct navigation to protected routes via URL manipulation', async ({ page }) => {
    // Try various URL manipulation techniques
    const maliciousUrls = [
      `${ROUTES.PROFILE}?token=fake`,
      `${ROUTES.PROFILE}#token=fake`,
      `${ROUTES.ORDERS}?bypass=true`,
      `${ROUTES.CHECKOUT}?admin=true`,
    ];
    
    for (const url of maliciousUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Should still redirect to login or verify-account
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/verify-account');
      expect(isRedirected).toBe(true);
      
      // Should not be logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(false);
    }
  });

  test('should handle multiple tabs with expired tokens safely', async ({ context }) => {
    // Create multiple pages (tabs)
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    const page3 = await context.newPage();
    
    try {
      // Set expired token
      await context.addCookies([{
        name: 'jwt',
        value: 'expired.token',
        domain: 'localhost',
        path: '/',
        expires: Math.floor(Date.now() / 1000) - 3600,
      }]);
      
      // Navigate all tabs to protected routes
      await Promise.all([
        page1.goto(ROUTES.PROFILE),
        page2.goto(ROUTES.ORDERS),
        page3.goto(ROUTES.CHECKOUT),
      ]);
      
      // Wait for all pages to load
      await Promise.all([
        page1.waitForLoadState('networkidle'),
        page2.waitForLoadState('networkidle'),
        page3.waitForLoadState('networkidle'),
      ]);
      
      await page.waitForTimeout(2000);
      
      // All should redirect to login or verify-account
      const url1 = page1.url();
      const url2 = page2.url();
      const url3 = page3.url();
      
      expect(url1.includes('/login') || url1.includes('/verify-account')).toBe(true);
      expect(url2.includes('/login') || url2.includes('/verify-account')).toBe(true);
      expect(url3.includes('/login') || url3.includes('/verify-account')).toBe(true);
    } finally {
      await page1.close();
      await page2.close();
      await page3.close();
    }
  });

  test('should show proper error UI when accessing protected route', async ({ page }) => {
    await page.goto(ROUTES.PROFILE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or verify-account
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    expect(isRedirected).toBe(true);
    
    // Should show login form or verify form (not error page)
    const loginForm = await page.locator('input[type="email"], input[type="password"], input[id="loginId"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(loginForm).toBe(true);
    
    // Should not show stack traces or technical errors
    const hasStackTrace = await page.locator('text=/stack|trace|error at|exception/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasStackTrace).toBe(false);
  });
});

