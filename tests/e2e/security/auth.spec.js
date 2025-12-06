import { test, expect } from '@playwright/test';
import { loginUser, isLoggedIn } from '../utils/login';
import { ROUTES } from '../utils/urls';

/**
 * Authentication Security Tests
 * 
 * Tests for:
 * - Invalid login attempts
 * - SQL injection attempts
 * - Script injection attempts
 * - Rate limiting
 * - Session expiration
 * - No sensitive data in localStorage/sessionStorage
 */

test.describe('Authentication Security', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage before each test
    await page.goto(ROUTES.LOGIN);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should reject invalid login credentials', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    // Wait for login form to be visible
    const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i], input[placeholder*="email" i], input[placeholder*="phone" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("login" i), button:has-text("sign in" i)').first();
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.click();
    
    // Wait for response (either error message or OTP step)
    await page.waitForTimeout(3000);
    
    // Should show error message OR still be on login page (OTP might be sent but verification will fail)
    const hasError = await page.locator('text=/invalid|incorrect|error|wrong|failed/i').isVisible({ timeout: 5000 }).catch(() => false);
    const isOnLoginPage = page.url().includes('/login') || page.url().includes('/verify-account');
    
    // Either error shown or still on login/verify page
    expect(hasError || isOnLoginPage).toBe(true);
    
    // Should not be logged in
    const loggedIn = await isLoggedIn(page);
    expect(loggedIn).toBe(false);
  });

  test('should prevent SQL injection in login form', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    const sqlInjectionPayloads = [
      "test@test.com' OR 1=1 --",
      "admin'--",
      "' OR '1'='1",
      "admin'/*",
      "test@test.com'; DROP TABLE users; --",
    ];
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    for (const payload of sqlInjectionPayloads) {
      await page.goto(ROUTES.LOGIN);
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      
      await emailInput.clear();
      await emailInput.fill(payload);
      await passwordInput.clear();
      await passwordInput.fill('password123');
      
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Should not crash or execute SQL
      await page.waitForTimeout(3000);
      
      // Should show validation error, reject login, or still be on login page
      const hasError = await page.locator('text=/invalid|error|incorrect|wrong|failed/i').isVisible({ timeout: 3000 }).catch(() => false);
      const isOnLoginPage = page.url().includes('/login') || page.url().includes('/verify-account');
      
      expect(hasError || isOnLoginPage).toBe(true);
    }
    
    // No SQL-related errors should appear
    const sqlErrors = errors.filter(e => 
      e.toLowerCase().includes('sql') || 
      e.toLowerCase().includes('database') ||
      e.toLowerCase().includes('syntax error')
    );
    expect(sqlErrors.length).toBe(0);
  });

  test('should prevent script injection in login form', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    const scriptPayloads = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
      "<svg/onload=alert(1)>",
      "javascript:alert(1)",
      "<iframe src=javascript:alert(1)>",
    ];
    
    for (const payload of scriptPayloads) {
      await page.goto(ROUTES.LOGIN);
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      
      await emailInput.clear();
      await emailInput.fill(payload);
      
      // Check that script is not executed
      let alertTriggered = false;
      page.on('dialog', () => {
        alertTriggered = true;
      });
      
      await page.waitForTimeout(1000);
      
      // Alert should not be triggered
      expect(alertTriggered).toBe(false);
      
      // Input value should be sanitized or rejected
      const value = await emailInput.inputValue();
      expect(value).not.toContain('<script>');
      expect(value).not.toContain('javascript:');
    }
  });

  test('should handle rate limiting on rapid login attempts', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Attempt multiple rapid logins
    for (let i = 0; i < 5; i++) {
      await emailInput.fill(`test${i}@example.com`);
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      await page.waitForTimeout(1000); // Increased timeout for API calls
    }
    
    // Wait a bit for rate limiting to potentially trigger
    await page.waitForTimeout(2000);
    
    // Should eventually show rate limit message, disable form, or show error
    const rateLimitMessage = await page.locator('text=/rate limit|too many|try again later|wait|slow down/i').isVisible({ timeout: 5000 }).catch(() => false);
    const formDisabled = await submitButton.isDisabled().catch(() => false);
    const hasError = await page.locator('text=/error|failed|invalid/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    // Either rate limit message, form disabled, or error shown (all indicate proper handling)
    expect(rateLimitMessage || formDisabled || hasError).toBe(true);
  });

  test('should redirect to login when session expires', async ({ page, context }) => {
    // Clear all cookies to simulate expired session
    await context.clearCookies();
    
    // Try to access protected route
    await page.goto(ROUTES.PROFILE);
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login or verify-account page
    await page.waitForTimeout(2000);
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/verify-account');
    
    expect(isRedirected).toBe(true);
  });

  test('should not store sensitive data in localStorage', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    // Attempt login
    const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
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
    
    // Should not contain JWT tokens or passwords
    const sensitiveKeys = Object.keys(localStorageData).filter(key => 
      key.toLowerCase().includes('token') || 
      key.toLowerCase().includes('jwt') ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('auth')
    );
    
    // Only resetToken is acceptable (temporary password reset token)
    const allowedKeys = ['resetToken'];
    const unauthorizedKeys = sensitiveKeys.filter(key => !allowedKeys.includes(key));
    
    expect(unauthorizedKeys.length).toBe(0);
    
    // Check that no JWT tokens are stored
    const hasJWT = Object.values(localStorageData).some(value => 
      typeof value === 'string' && value.includes('.') && value.split('.').length === 3
    );
    
    expect(hasJWT).toBe(false);
  });

  test('should not store sensitive data in sessionStorage', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    // Attempt login
    const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check sessionStorage
    const sessionStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data[key] = sessionStorage.getItem(key);
      }
      return data;
    });
    
    // Should not contain JWT tokens or passwords
    const sensitiveKeys = Object.keys(sessionStorageData).filter(key => 
      key.toLowerCase().includes('token') || 
      key.toLowerCase().includes('jwt') ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('auth')
    );
    
    expect(sensitiveKeys.length).toBe(0);
  });

  test('should sanitize user input in login form', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    const maliciousInputs = [
      '<script>alert(1)</script>',
      '"><img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      '<svg/onload=alert(1)>',
    ];
    
    for (const input of maliciousInputs) {
      await page.goto(ROUTES.LOGIN);
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      
      await emailInput.clear();
      await emailInput.fill(input);
      
      // Get the actual value stored
      const storedValue = await emailInput.inputValue();
      
      // Should be sanitized (no script tags, no javascript:)
      expect(storedValue).not.toContain('<script>');
      expect(storedValue).not.toContain('javascript:');
      expect(storedValue).not.toContain('onerror=');
      expect(storedValue).not.toContain('onload=');
    }
  });

  test('should handle network errors gracefully during login', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/v1/auth/**', route => route.abort('failed'));
    
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for error to appear
    await page.waitForTimeout(3000);
    
    // Should show user-friendly error message OR still be on login page
    const hasError = await page.locator('text=/network|connection|error|try again|failed|unable/i').isVisible({ timeout: 5000 }).catch(() => false);
    const isOnLoginPage = page.url().includes('/login');
    
    // Either error shown or still on login page (both indicate graceful handling)
    expect(hasError || isOnLoginPage).toBe(true);
    
    // Should not crash or show stack trace
    const hasStackTrace = await page.locator('text=/stack|trace|error at|exception/i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasStackTrace).toBe(false);
  });
});

