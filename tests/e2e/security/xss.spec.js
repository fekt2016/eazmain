import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/urls';

/**
 * XSS (Cross-Site Scripting) Security Tests
 * 
 * Tests for:
 * - Script injection in search bar
 * - Script injection in profile name
 * - Script injection in address form
 * - Script injection in review form
 * - Script injection in contact form
 */

test.describe('XSS Security Tests', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '<svg/onload=alert(1)>',
    'javascript:alert(1)',
    '<iframe src=javascript:alert(1)>',
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<select onfocus=alert(1) autofocus>',
    '<textarea onfocus=alert(1) autofocus>',
    '<keygen onfocus=alert(1) autofocus>',
    '<video><source onerror=alert(1)>',
    '<audio src=x onerror=alert(1)>',
    '<details open ontoggle=alert(1)>',
    '<marquee onstart=alert(1)>',
    '<div onmouseover=alert(1)>',
  ];

  test('should prevent XSS in search bar', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]').first();
    
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      for (const payload of xssPayloads.slice(0, 5)) {
        await page.goto(ROUTES.HOME);
        await page.waitForLoadState('networkidle');
        
        const currentSearchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]').first();
        await currentSearchInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        
        await currentSearchInput.clear();
        await currentSearchInput.fill(payload);
        
        // Check for alert dialogs
        let alertTriggered = false;
        page.on('dialog', () => {
          alertTriggered = true;
        });
        
        // Try to submit search
        await currentSearchInput.press('Enter');
        await page.waitForTimeout(2000);
        
        // Alert should not be triggered
        expect(alertTriggered).toBe(false);
        
        // Check that script is not in DOM
        const hasMaliciousScript = await page.locator('script').filter({ hasText: payload }).count();
        expect(hasMaliciousScript).toBe(0);
      }
    }
  });

  test('should prevent XSS in profile name field', async ({ page }) => {
    // This test requires authentication - skip if not logged in
    await page.goto(ROUTES.PROFILE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // If redirected to login, skip this test
    const url = page.url();
    if (url.includes('/login') || url.includes('/verify-account')) {
      test.skip();
      return;
    }
    
    // Find name input in profile form
    const nameInput = page.locator('input[name*="name" i], input[id*="name" i], input[placeholder*="name" i]').first();
    
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      for (const payload of xssPayloads.slice(0, 5)) {
        await nameInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        await nameInput.clear();
        await nameInput.fill(payload);
        
        // Check for alert dialogs
        let alertTriggered = false;
        page.on('dialog', () => {
          alertTriggered = true;
        });
        
        await page.waitForTimeout(2000);
        
        // Alert should not be triggered
        expect(alertTriggered).toBe(false);
        
        // Value should be sanitized
        const value = await nameInput.inputValue();
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('javascript:');
        expect(value).not.toContain('onerror=');
      }
    }
  });

  test('should prevent XSS in address form', async ({ page }) => {
    await page.goto(ROUTES.ADDRESSES);
    
    // If redirected to login, skip this test
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Find address input fields
    const streetInput = page.locator('input[name*="street" i], input[name*="address" i], textarea[name*="address" i]').first();
    
    if (await streetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      for (const payload of xssPayloads.slice(0, 5)) {
        await streetInput.clear();
        await streetInput.fill(payload);
        
        // Check for alert dialogs
        let alertTriggered = false;
        page.on('dialog', () => {
          alertTriggered = true;
        });
        
        await page.waitForTimeout(1000);
        
        // Alert should not be triggered
        expect(alertTriggered).toBe(false);
        
        // Value should be sanitized
        const value = await streetInput.inputValue();
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('javascript:');
      }
    }
  });

  test('should prevent XSS in contact form', async ({ page }) => {
    await page.goto(ROUTES.CONTACT);
    
    // Find contact form inputs
    const nameInput = page.locator('input[name*="name" i], input[id*="name" i]').first();
    const messageInput = page.locator('textarea[name*="message" i], textarea[id*="message" i]').first();
    
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      for (const payload of xssPayloads.slice(0, 3)) {
        // Test name field
        await nameInput.clear();
        await nameInput.fill(payload);
        
        let alertTriggered = false;
        page.on('dialog', () => {
          alertTriggered = true;
        });
        
        await page.waitForTimeout(1000);
        expect(alertTriggered).toBe(false);
        
        // Test message field if available
        if (await messageInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await messageInput.clear();
          await messageInput.fill(payload);
          
          await page.waitForTimeout(1000);
          expect(alertTriggered).toBe(false);
        }
      }
    }
  });

  test('should escape HTML in displayed user content', async ({ page }) => {
    // Test that any user-generated content is properly escaped
    await page.goto(ROUTES.HOME);
    
    // Inject script via URL parameter (if your app uses URL params)
    const maliciousUrl = `${ROUTES.SEARCH}?q=<script>alert(1)</script>`;
    await page.goto(maliciousUrl);
    
    // Check for alert dialogs
    let alertTriggered = false;
    page.on('dialog', () => {
      alertTriggered = true;
    });
    
    await page.waitForTimeout(2000);
    
    // Alert should not be triggered
    expect(alertTriggered).toBe(false);
    
    // Check that script is not in DOM
    const scriptContent = await page.locator('script').filter({ hasText: 'alert(1)' }).count();
    expect(scriptContent).toBe(0);
  });

  test('should sanitize input before storing in localStorage', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    
    // Try to inject script via search and check localStorage
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const payload = '<script>alert(1)</script>';
      await searchInput.fill(payload);
      await searchInput.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // Check localStorage
      const localStorageData = await page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return data;
      });
      
      // No localStorage value should contain unescaped script tags
      const hasUnescapedScript = Object.values(localStorageData).some(value =>
        typeof value === 'string' && value.includes('<script>') && !value.includes('&lt;script&gt;')
      );
      
      expect(hasUnescapedScript).toBe(false);
    }
  });

  test('should prevent XSS via URL hash', async ({ page }) => {
    const maliciousHash = '#<script>alert(1)</script>';
    await page.goto(`${ROUTES.HOME}${maliciousHash}`);
    
    let alertTriggered = false;
    page.on('dialog', () => {
      alertTriggered = true;
    });
    
    await page.waitForTimeout(2000);
    
    expect(alertTriggered).toBe(false);
  });

  test('should prevent XSS via URL query parameters', async ({ page }) => {
    const maliciousParams = [
      '?name=<script>alert(1)</script>',
      '?search=<img src=x onerror=alert(1)>',
      '?q=<svg/onload=alert(1)>',
    ];
    
    for (const param of maliciousParams) {
      await page.goto(`${ROUTES.HOME}${param}`);
      
      let alertTriggered = false;
      page.on('dialog', () => {
        alertTriggered = true;
      });
      
      await page.waitForTimeout(1000);
      expect(alertTriggered).toBe(false);
    }
  });

  test('should not execute scripts in error messages', async ({ page }) => {
    // Simulate an error that might include user input
    await page.goto(ROUTES.LOGIN);
    
    // Try to trigger error with malicious input
    const emailInput = page.locator('input[type="email"], input[id="loginId"]').first();
    await emailInput.fill('<script>alert(1)</script>@example.com');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('password');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    
    // Check for alert dialogs
    let alertTriggered = false;
    page.on('dialog', () => {
      alertTriggered = true;
    });
    
    await page.waitForTimeout(1000);
    expect(alertTriggered).toBe(false);
    
    // Error message should not contain executable script
    const errorMessages = await page.locator('text=/error|invalid|incorrect/i').all();
    for (const errorMsg of errorMessages) {
      const text = await errorMsg.textContent();
      expect(text).not.toContain('<script>');
    }
  });
});

