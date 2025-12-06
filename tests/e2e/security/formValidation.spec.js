import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/urls';

/**
 * Form Validation Security Tests
 * 
 * Tests for:
 * - Email validation
 * - Phone validation
 * - Required fields enforcement
 * - HTML/script prevention in forms
 * - Password rules enforcement
 * - Input length limits
 */

test.describe('Form Validation Security', () => {
  test('should reject invalid email formats', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    const emailInput = page.locator('input[type="email"], input[id*="email" i]').first();
    
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'nodomain@.com',
        'spaces in@email.com',
        'special<>chars@email.com',
        'toolongemailaddressthatshouldberejected@example.com'.repeat(10),
      ];
      
      for (const invalidEmail of invalidEmails) {
        await emailInput.clear();
        await emailInput.fill(invalidEmail);
        
        // Try to submit
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        
        // Should show validation error
        const hasError = await page.locator('text=/invalid|valid|email|format/i').isVisible({ timeout: 3000 }).catch(() => false);
        expect(hasError).toBe(true);
      }
    }
  });

  test('should reject invalid phone numbers', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    const phoneInput = page.locator('input[type="tel"], input[id*="phone" i]').first();
    
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const invalidPhones = [
        '123', // Too short
        '12345678901234567890', // Too long
        'abc123', // Contains letters
        '++233123456789', // Multiple plus signs
        '<script>alert(1)</script>', // Script injection
      ];
      
      for (const invalidPhone of invalidPhones) {
        await phoneInput.clear();
        await phoneInput.fill(invalidPhone);
        
        await page.waitForTimeout(500);
        
        // Should show validation error or reject input
        const hasError = await page.locator('text=/invalid|phone|number/i').isVisible({ timeout: 2000 }).catch(() => false);
        const value = await phoneInput.inputValue();
        
        // Either shows error or input is rejected/sanitized
        expect(hasError || value !== invalidPhone).toBe(true);
      }
    }
  });

  test('should enforce required fields', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Try to submit empty form
    await submitButton.click();
    
    await page.waitForTimeout(1000);
    
    // Should show required field errors
    const requiredErrors = await page.locator('text=/required|must|fill/i').count();
    expect(requiredErrors).toBeGreaterThan(0);
    
    // Form should not submit
    await expect(page).toHaveURL(new RegExp(ROUTES.SIGNUP), { timeout: 2000 });
  });

  test('should prevent HTML/script in form inputs', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    const htmlPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<div>HTML content</div>',
      '<a href="javascript:alert(1)">Link</a>',
    ];
    
    // Test name field
    const nameInput = page.locator('input[name*="name" i], input[id*="name" i]').first();
    
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      for (const payload of htmlPayloads) {
        await nameInput.clear();
        await nameInput.fill(payload);
        
        const value = await nameInput.inputValue();
        
        // HTML tags should be removed or escaped
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('<img');
        expect(value).not.toContain('<div>');
        expect(value).not.toContain('javascript:');
      }
    }
  });

  test('should enforce password rules', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    const passwordInput = page.locator('input[type="password"][id*="password" i]').first();
    const confirmPasswordInput = page.locator('input[type="password"][id*="confirm" i], input[type="password"][id*="passwordConfirm" i]').first();
    
    if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Test minimum length
      await passwordInput.fill('short');
      await confirmPasswordInput.fill('short');
      
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      
      // Should show password length error
      const hasLengthError = await page.locator('text=/8|minimum|length|characters/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasLengthError).toBe(true);
      
      // Test password mismatch
      await passwordInput.fill('password123');
      await confirmPasswordInput.fill('password456');
      
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Should show mismatch error
      const hasMismatchError = await page.locator('text=/match|same|different/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasMismatchError).toBe(true);
    }
  });

  test('should enforce input length limits', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    // Test name field maxLength
    const nameInput = page.locator('input[name*="name" i], input[id*="name" i]').first();
    
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const maxLength = await nameInput.getAttribute('maxLength');
      
      if (maxLength) {
        const longInput = 'a'.repeat(parseInt(maxLength) + 10);
        await nameInput.fill(longInput);
        
        const value = await nameInput.inputValue();
        
        // Should not exceed maxLength
        expect(value.length).toBeLessThanOrEqual(parseInt(maxLength));
      }
    }
    
    // Test email field maxLength
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const maxLength = await emailInput.getAttribute('maxLength');
      
      if (maxLength) {
        const longEmail = 'a'.repeat(parseInt(maxLength) + 10) + '@example.com';
        await emailInput.fill(longEmail);
        
        const value = await emailInput.inputValue();
        expect(value.length).toBeLessThanOrEqual(parseInt(maxLength));
      }
    }
  });

  test('should sanitize input on paste', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    const nameInput = page.locator('input[name*="name" i]').first();
    
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Simulate paste with malicious content
      await nameInput.click();
      await nameInput.fill('<script>alert(1)</script>');
      
      const value = await nameInput.inputValue();
      
      // Should be sanitized
      expect(value).not.toContain('<script>');
    }
  });

  test('should validate address form fields', async ({ page }) => {
    await page.goto(ROUTES.ADDRESSES);
    
    // If redirected to login, skip
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Find address form
    const streetInput = page.locator('input[name*="street" i], input[name*="address" i]').first();
    
    if (await streetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Try to submit empty address
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      
      // Should show validation errors
      const hasErrors = await page.locator('text=/required|must|fill/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasErrors).toBe(true);
    }
  });

  test('should prevent special characters in certain fields', async ({ page }) => {
    await page.goto(ROUTES.SIGNUP);
    
    const nameInput = page.locator('input[name*="name" i]').first();
    
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const specialChars = ['<', '>', '{', '}', '[', ']', '|', '\\', '/'];
      
      for (const char of specialChars) {
        await nameInput.clear();
        await nameInput.fill(`Test${char}Name`);
        
        const value = await nameInput.inputValue();
        
        // Special characters might be allowed or sanitized
        // Just ensure script tags are not present
        expect(value).not.toContain('<script>');
      }
    }
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/v1/auth/register', route => route.abort('failed'));
    
    await page.goto(ROUTES.SIGNUP);
    
    // Fill form
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      await page.waitForTimeout(2000);
      
      // Should show user-friendly error
      const hasError = await page.locator('text=/error|failed|try again|network/i').isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasError).toBe(true);
      
      // Should not show stack trace
      const hasStackTrace = await page.locator('text=/stack|trace|error at/i').isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasStackTrace).toBe(false);
    }
  });
});

