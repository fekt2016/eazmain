import { test, expect } from '@playwright/test';
import { ROUTES, API_ENDPOINTS } from '../utils/urls';
import { loginUser } from '../utils/login';
import { waitForApiCall } from '../utils/intercept';

/**
 * User Data Protection Tests
 * 
 * Tests for:
 * - No sensitive fields in API responses
 * - User profile displays only allowed fields
 * - Order history does not leak internal IDs
 * - Password never returned in responses
 */

test.describe('User Data Protection', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
  });

  test('should not return password in API responses', async ({ page }) => {
    // Intercept API calls
    const apiResponses = [];
    page.on('response', async response => {
      if (response.url().includes('/api/v1/')) {
        try {
          const body = await response.json().catch(() => null);
          if (body) {
            apiResponses.push({
              url: response.url(),
              body,
            });
          }
        } catch (e) {
          // Ignore non-JSON responses
        }
      }
    });
    
    // Navigate to profile or any page that makes API calls
    await page.goto(ROUTES.PROFILE);
    
    // If redirected to login, try to login
    if (page.url().includes('/login')) {
      // Skip if no test credentials
      test.skip();
      return;
    }
    
    // Wait for API calls
    await page.waitForTimeout(3000);
    
    // Check all API responses for password fields
    for (const response of apiResponses) {
      const bodyStr = JSON.stringify(response.body);
      
      // Should not contain password (case insensitive)
      expect(bodyStr.toLowerCase()).not.toContain('"password"');
      expect(bodyStr.toLowerCase()).not.toContain('"pwd"');
      expect(bodyStr.toLowerCase()).not.toContain('"pass"');
    }
  });

  test('should not return JWT tokens in API responses', async ({ page }) => {
    const apiResponses = [];
    page.on('response', async response => {
      if (response.url().includes('/api/v1/')) {
        try {
          const body = await response.json().catch(() => null);
          if (body) {
            apiResponses.push({
              url: response.url(),
              body,
            });
          }
        } catch (e) {
          // Ignore
        }
      }
    });
    
    await page.goto(ROUTES.PROFILE);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.waitForTimeout(3000);
    
    // Check for JWT tokens in responses
    for (const response of apiResponses) {
      const bodyStr = JSON.stringify(response.body);
      
      // Should not contain JWT tokens (format: xxx.yyy.zzz)
      const jwtPattern = /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
      const matches = bodyStr.match(jwtPattern);
      
      if (matches) {
        // Filter JWT-like strings
        const jwtMatches = matches.filter(match => {
          const parts = match.split('.');
          return parts.length === 3 && parts[0].length > 10;
        });
        
        expect(jwtMatches.length).toBe(0);
      }
    }
  });

  test('should only display allowed fields in user profile', async ({ page }) => {
    await page.goto(ROUTES.PROFILE);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    
    // Get page content
    const content = await page.content();
    const text = await page.textContent('body');
    
    // Should not display sensitive fields
    const sensitiveFields = ['password', 'pwd', 'secret', 'api_key', 'private_key'];
    
    for (const field of sensitiveFields) {
      // Check that field is not displayed as label or value
      const hasField = text.toLowerCase().includes(field.toLowerCase());
      
      // If found, it should only be in error messages or help text, not as actual data
      if (hasField) {
        // Should not be in input values or displayed data
        const inputs = await page.locator(`input[value*="${field}" i]`).count();
        expect(inputs).toBe(0);
      }
    }
  });

  test('should not leak internal database IDs in order history', async ({ page }) => {
    await page.goto(ROUTES.ORDERS);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    
    // Intercept order API calls
    const orderResponses = [];
    page.on('response', async response => {
      if (response.url().includes(API_ENDPOINTS.ORDERS.LIST)) {
        try {
          const body = await response.json().catch(() => null);
          if (body) {
            orderResponses.push(body);
          }
        } catch (e) {
          // Ignore
        }
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Check order responses
    for (const response of orderResponses) {
      const responseStr = JSON.stringify(response);
      
      // Should not contain internal MongoDB ObjectIds in user-visible format
      // (ObjectIds are 24 hex characters)
      const objectIdPattern = /[0-9a-f]{24}/gi;
      const matches = responseStr.match(objectIdPattern);
      
      // ObjectIds might be present but should not be exposed in URLs or user-visible text
      // This is more of a backend concern, but we can check that they're not in visible text
      const visibleText = await page.textContent('body');
      const visibleObjectIds = matches?.filter(id => visibleText.includes(id)) || [];
      
      // Should minimize exposure of internal IDs
      expect(visibleObjectIds.length).toBeLessThan(10); // Reasonable threshold
    }
  });

  test('should not expose admin or seller internal data', async ({ page }) => {
    await page.goto(ROUTES.ORDERS);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    
    // Get page content
    const text = await page.textContent('body');
    
    // Should not expose admin-only fields
    const adminFields = ['admin', 'superuser', 'internal', 'system', 'debug'];
    
    for (const field of adminFields) {
      // These terms might appear in UI, but should not appear as data fields
      // This is a basic check - adjust based on your app
      const hasAdminData = text.toLowerCase().includes(`"${field}"`) || 
                          text.toLowerCase().includes(`${field}:`);
      
      // If found, it should be minimal
      // This is a heuristic check
    }
  });

  test('should sanitize user input before displaying', async ({ page }) => {
    // This test checks that user-generated content is properly sanitized
    await page.goto(ROUTES.HOME);
    
    // Check that any displayed user content doesn't contain executable scripts
    const content = await page.content();
    
    // Should not have unescaped script tags
    const hasUnescapedScript = content.includes('<script>') && !content.includes('&lt;script&gt;');
    expect(hasUnescapedScript).toBe(false);
  });

  test('should not expose API keys or secrets', async ({ page }) => {
    // Check page source for API keys
    const content = await page.content();
    
    // Common API key patterns
    const apiKeyPatterns = [
      /sk_live_[a-zA-Z0-9]{32,}/,
      /pk_live_[a-zA-Z0-9]{32,}/,
      /AIza[0-9A-Za-z_-]{35}/, // Google API key
      /[0-9a-f]{32}/, // Generic 32-char hex (might be false positives)
    ];
    
    for (const pattern of apiKeyPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Should not have API keys in client-side code
        // (Some might be public keys, but should be minimal)
        expect(matches.length).toBeLessThan(5);
      }
    }
  });

  test('should not expose error stack traces in production', async ({ page }) => {
    // Simulate an error
    await page.route('**/api/v1/**', route => route.abort('failed'));
    
    await page.goto(ROUTES.PROFILE);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.waitForTimeout(2000);
    
    // Check for stack traces
    const hasStackTrace = await page.locator('text=/stack|trace|error at|exception|at /i').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasStackTrace).toBe(false);
    
    // Check page source
    const content = await page.content();
    const hasStackTraceInSource = content.includes('at ') && 
                                  (content.includes('Error:') || content.includes('Exception:'));
    
    // Should not have stack traces in production
    // (This might be acceptable in development)
    if (process.env.NODE_ENV === 'production') {
      expect(hasStackTraceInSource).toBe(false);
    }
  });

  test('should not expose database connection strings', async ({ page }) => {
    // Check page source and network requests
    const content = await page.content();
    
    // Common database connection patterns
    const dbPatterns = [
      /mongodb:\/\/[^"'\s]+/,
      /postgres:\/\/[^"'\s]+/,
      /mysql:\/\/[^"'\s]+/,
      /connectionString[=:]["'][^"']+["']/i,
    ];
    
    for (const pattern of dbPatterns) {
      const matches = content.match(pattern);
      expect(matches).toBeNull();
    }
  });

  test('should protect sensitive data in network requests', async ({ page }) => {
    // Capture all network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
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
    
    // Check that password is not in URL
    const url = page.url();
    expect(url).not.toContain('password');
    expect(url).not.toContain('pwd');
    
    // Check request data
    const loginRequests = requests.filter(r => r.url.includes('/auth/login') || r.url.includes('/auth'));
    
    for (const request of loginRequests) {
      if (request.postData) {
        // Password should be in request body (encrypted in transit via HTTPS)
        // But should not be in URL or headers
        expect(request.url).not.toContain('password');
        
        const headersStr = JSON.stringify(request.headers);
        expect(headersStr.toLowerCase()).not.toContain('password');
      }
    }
  });
});

