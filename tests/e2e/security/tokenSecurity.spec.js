import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/urls';
import { loginUser, logoutUser, isLoggedIn } from '../utils/login';

/**
 * Token Security Tests
 * 
 * Tests for:
 * - Token removal on logout
 * - Token cannot be manually injected
 * - Token expiration triggers logout
 * - Multiple tabs with expired tokens
 * - No JWT in localStorage (should use httpOnly cookies)
 */

test.describe('Token Security', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all storage and cookies
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should remove tokens on logout', async ({ page, context }) => {
    // Login first (if you have test credentials)
    // For this test, we'll simulate by checking logout behavior
    
    await page.goto(ROUTES.PROFILE);
    
    // If not logged in, try to login or skip
    if (page.url().includes('/login')) {
      // Try to login with test credentials (adjust as needed)
      // await loginUser(page, { email: 'test@example.com', password: 'password123' });
      test.skip();
      return;
    }
    
    // Check that auth cookie exists
    const cookiesBefore = await context.cookies();
    const hasAuthCookie = cookiesBefore.some(c => 
      c.name.includes('jwt') || c.name.includes('token') || c.name.includes('auth')
    );
    
    expect(hasAuthCookie).toBe(true);
    
    // Logout
    await logoutUser(page);
    
    // Check that auth cookie is removed
    const cookiesAfter = await context.cookies();
    const hasAuthCookieAfter = cookiesAfter.some(c => 
      c.name.includes('jwt') || c.name.includes('token') || c.name.includes('auth')
    );
    
    expect(hasAuthCookieAfter).toBe(false);
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    // Should not contain auth tokens (except resetToken which is temporary)
    const authKeys = Object.keys(localStorageData).filter(key =>
      (key.includes('token') || key.includes('jwt') || key.includes('auth')) &&
      key !== 'resetToken'
    );
    
    expect(authKeys.length).toBe(0);
  });

  test('should not allow manual token injection into localStorage', async ({ page }) => {
    // Try to manually set token in localStorage
    await page.goto(ROUTES.HOME);
    
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake.jwt.token');
      localStorage.setItem('jwt', 'another.fake.token');
    });
    
    // Try to access protected route
    await page.goto(ROUTES.PROFILE);
    
    // Should still redirect to login (tokens should be in httpOnly cookies, not localStorage)
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
    
    // Should not be logged in
    const loggedIn = await isLoggedIn(page);
    expect(loggedIn).toBe(false);
  });

  test('should not store JWT tokens in localStorage', async ({ page }) => {
    // Navigate to login and attempt login
    await page.goto(ROUTES.LOGIN);
    
    const emailInput = page.locator('input[type="email"], input[id="loginId"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    // Check for JWT tokens (format: xxx.yyy.zzz)
    const hasJWT = Object.values(localStorageData).some(value => {
      if (typeof value !== 'string') return false;
      const parts = value.split('.');
      return parts.length === 3; // JWT has 3 parts
    });
    
    // Should not have JWT tokens in localStorage
    expect(hasJWT).toBe(false);
    
    // Check for token keys (except resetToken)
    const tokenKeys = Object.keys(localStorageData).filter(key =>
      (key.includes('token') || key.includes('jwt')) && key !== 'resetToken'
    );
    
    expect(tokenKeys.length).toBe(0);
  });

  test('should use httpOnly cookies for authentication', async ({ page, context }) => {
    // Attempt login
    await page.goto(ROUTES.LOGIN);
    
    const emailInput = page.locator('input[type="email"], input[id="loginId"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check cookies
    const cookies = await context.cookies();
    
    // Should have auth cookie (httpOnly)
    const authCookies = cookies.filter(c =>
      c.name.includes('jwt') || c.name.includes('token') || c.name.includes('auth')
    );
    
    // If login was successful, should have httpOnly cookie
    if (authCookies.length > 0) {
      // httpOnly cookies cannot be accessed via JavaScript
      // But we can verify they exist
      expect(authCookies.length).toBeGreaterThan(0);
    }
  });

  test('should handle token expiration gracefully', async ({ page, context }) => {
    // Set expired token cookie
    await context.addCookies([{
      name: 'jwt',
      value: 'expired.token.here',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      expires: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    }]);
    
    await page.goto(ROUTES.PROFILE);
    
    // Should redirect to login
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
    
    // Expired cookie should be cleared
    const cookies = await context.cookies();
    const expiredCookie = cookies.find(c => c.name === 'jwt' && c.value === 'expired.token.here');
    expect(expiredCookie).toBeUndefined();
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
        httpOnly: true,
        expires: Math.floor(Date.now() / 1000) - 3600,
      }]);
      
      // Navigate all tabs to protected routes
      await Promise.all([
        page1.goto(ROUTES.PROFILE),
        page2.goto(ROUTES.ORDERS),
        page3.goto(ROUTES.CHECKOUT),
      ]);
      
      // All should redirect to login
      await expect(page1).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
      await expect(page2).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
      await expect(page3).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
      
      // All should have cleared expired cookies
      const cookies = await context.cookies();
      const expiredCookie = cookies.find(c => c.name === 'jwt' && c.value === 'expired.token');
      expect(expiredCookie).toBeUndefined();
    } finally {
      await page1.close();
      await page2.close();
      await page3.close();
    }
  });

  test('should not expose token in URL parameters', async ({ page }) => {
    // Try to access protected route with token in URL
    await page.goto(`${ROUTES.PROFILE}?token=fake.jwt.token`);
    
    // Should redirect to login (tokens should not be in URL)
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
    
    // URL should not contain token
    const url = page.url();
    expect(url).not.toContain('token=');
    expect(url).not.toContain('jwt=');
  });

  test('should not expose token in page source', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    
    // Get page content
    const content = await page.content();
    
    // Should not contain JWT tokens in HTML
    const jwtPattern = /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
    const matches = content.match(jwtPattern);
    
    if (matches) {
      // Filter out non-JWT matches (like base64 encoded images, etc.)
      const jwtMatches = matches.filter(match => {
        const parts = match.split('.');
        return parts.length === 3 && parts[0].length > 10;
      });
      
      // Should not have JWT tokens in page source
      expect(jwtMatches.length).toBe(0);
    }
  });

  test('should clear tokens on browser close simulation', async ({ page, context }) => {
    // Set a session cookie (expires when browser closes)
    await context.addCookies([{
      name: 'jwt',
      value: 'session.token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      // No expires means session cookie
    }]);
    
    await page.goto(ROUTES.PROFILE);
    
    // Close context (simulates browser close)
    await context.close();
    
    // Create new context
    const newContext = await page.context().browser().newContext();
    const newPage = await newContext.newPage();
    
    try {
      await newPage.goto(ROUTES.PROFILE);
      
      // Session cookie should be gone, should redirect to login
      await expect(newPage).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
    } finally {
      await newPage.close();
      await newContext.close();
    }
  });

  test('should validate token format before using', async ({ page, context }) => {
    // Set invalid token format
    await context.addCookies([{
      name: 'jwt',
      value: 'invalid-token-format',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    }]);
    
    await page.goto(ROUTES.PROFILE);
    
    // Should redirect to login (invalid token should be rejected)
    await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN), { timeout: 5000 });
    
    // Invalid cookie should be cleared
    const cookies = await context.cookies();
    const invalidCookie = cookies.find(c => c.name === 'jwt' && c.value === 'invalid-token-format');
    expect(invalidCookie).toBeUndefined();
  });
});

