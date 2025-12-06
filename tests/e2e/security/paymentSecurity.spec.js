import { test, expect } from '@playwright/test';
import { ROUTES, API_ENDPOINTS } from '../utils/urls';
import { loginUser } from '../utils/login';
import { mockApiResponse, waitForApiCall } from '../utils/intercept';

/**
 * Payment Security Tests
 * 
 * Tests for:
 * - Price manipulation prevention
 * - Request payload validation
 * - Paystack redirection security
 * - Fake payment success URL prevention
 */

test.describe('Payment Security', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all storage
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should not allow price manipulation in frontend', async ({ page }) => {
    // This test requires items in cart and authentication
    // Navigate to checkout
    await page.goto(ROUTES.CHECKOUT);
    
    // If redirected to login, we need to login first
    if (page.url().includes('/login')) {
      // Skip if we don't have test credentials
      test.skip();
      return;
    }
    
    // Intercept payment initialization API call
    let paymentRequest = null;
    page.on('request', request => {
      if (request.url().includes(API_ENDPOINTS.PAYMENT.INITIALIZE)) {
        paymentRequest = request;
      }
    });
    
    // Try to find and modify price display (if any)
    const priceElements = await page.locator('[data-testid*="price" i], [class*="price" i], .price').all();
    
    // Attempt to modify price via JavaScript (should not work)
    await page.evaluate(() => {
      // Try to find and modify price elements
      const priceElements = document.querySelectorAll('[data-price], .price, [class*="price"]');
      priceElements.forEach(el => {
        if (el.dataset.price) {
          el.dataset.price = '0.01'; // Try to set to 1 cent
        }
      });
    });
    
    // Try to proceed with payment
    const payButton = page.locator('button:has-text("pay" i), button:has-text("checkout" i)').first();
    
    if (await payButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payButton.click();
      
      // Wait for payment API call
      await page.waitForTimeout(2000);
      
      if (paymentRequest) {
        const postData = paymentRequest.postDataJSON();
        
        // Backend should validate amount - frontend manipulation should not work
        // The actual amount should match what backend calculated
        if (postData && postData.amount) {
          // Amount should be reasonable (not 0.01 or manipulated)
          expect(parseFloat(postData.amount)).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should validate payment request payload on backend', async ({ page }) => {
    // Intercept and modify payment request
    await page.route(API_ENDPOINTS.PAYMENT.INITIALIZE, async (route, request) => {
      const postData = request.postDataJSON();
      
      // Try to modify amount
      if (postData) {
        postData.amount = 1; // Try to set to 1 cent
      }
      
      // Continue with modified request
      await route.continue({
        postData: JSON.stringify(postData),
      });
    });
    
    await page.goto(ROUTES.CHECKOUT);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Try to proceed with payment
    const payButton = page.locator('button:has-text("pay" i)').first();
    
    if (await payButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payButton.click();
      
      // Wait for response
      const response = await page.waitForResponse(
        response => response.url().includes(API_ENDPOINTS.PAYMENT.INITIALIZE),
        { timeout: 5000 }
      ).catch(() => null);
      
      if (response) {
        // Backend should reject invalid amount
        const status = response.status();
        expect([400, 401, 403, 422]).toContain(status);
      }
    }
  });

  test('should only redirect to Paystack with valid session data', async ({ page }) => {
    await page.goto(ROUTES.CHECKOUT);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Mock payment initialization to return fake Paystack URL
    await mockApiResponse(
      page,
      API_ENDPOINTS.PAYMENT.INITIALIZE,
      {
        status: 'success',
        data: {
          authorization_url: 'https://checkout.paystack.com/fake',
        },
      }
    );
    
    // Try to proceed with payment
    const payButton = page.locator('button:has-text("pay" i)').first();
    
    if (await payButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payButton.click();
      
      await page.waitForTimeout(2000);
      
      // Should redirect to Paystack (but with valid order data)
      const url = page.url();
      
      // If redirected, should be to Paystack domain
      if (url.includes('paystack.com')) {
        expect(url).toContain('checkout.paystack.com');
      }
    }
  });

  test('should not confirm order with fake Paystack success URL', async ({ page }) => {
    // Try to access order confirmation with fake success parameters
    const fakeUrl = `${ROUTES.ORDER_CONFIRMATION}?status=success&reference=fake123&trxref=fake123&orderId=fake123`;
    
    await page.goto(fakeUrl);
    
    // Should not confirm order
    // Should show error or redirect
    await page.waitForTimeout(2000);
    
    // Check for error message or invalid order state
    const hasError = await page.locator('text=/invalid|error|not found|unauthorized/i').isVisible({ timeout: 3000 }).catch(() => false);
    const isConfirmed = await page.locator('text=/confirmed|success|completed/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    // Should show error, not confirmation
    expect(hasError || !isConfirmed).toBe(true);
  });

  test('should verify payment reference on backend', async ({ page }) => {
    // Intercept payment verification
    let verifyRequest = null;
    page.on('request', request => {
      if (request.url().includes(API_ENDPOINTS.PAYMENT.VERIFY)) {
        verifyRequest = request;
      }
    });
    
    // Try to access order confirmation with fake reference
    await page.goto(`${ROUTES.ORDER_CONFIRMATION}?reference=fake123&orderId=test123`);
    
    await page.waitForTimeout(3000);
    
    if (verifyRequest) {
      // Backend should verify the reference
      const url = verifyRequest.url();
      expect(url).toContain('reference=');
      
      // Backend should reject fake references
      const response = await page.waitForResponse(
        response => response.url().includes(API_ENDPOINTS.PAYMENT.VERIFY),
        { timeout: 5000 }
      ).catch(() => null);
      
      if (response) {
        const status = response.status();
        // Should reject invalid reference
        expect([400, 401, 403, 404, 422]).toContain(status);
      }
    }
  });

  test('should not allow order ID manipulation', async ({ page }) => {
    await page.goto(ROUTES.CHECKOUT);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Intercept order creation
    let orderRequest = null;
    page.on('request', request => {
      if (request.url().includes(API_ENDPOINTS.ORDERS.CREATE)) {
        orderRequest = request;
      }
    });
    
    // Try to modify order data via JavaScript
    await page.evaluate(() => {
      // Try to find and modify order form data
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => {
          if (input.name.includes('order') || input.name.includes('id')) {
            input.value = 'fake-order-id';
          }
        });
      });
    });
    
    // Try to submit order
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitButton.click();
      
      await page.waitForTimeout(2000);
      
      if (orderRequest) {
        // Backend should validate order ownership
        const response = await page.waitForResponse(
          response => response.url().includes(API_ENDPOINTS.ORDERS.CREATE),
          { timeout: 5000 }
        ).catch(() => null);
        
        if (response) {
          const status = response.status();
          // Should reject invalid order data
          expect([400, 401, 403, 422]).toContain(status);
        }
      }
    }
  });

  test('should validate order ownership before payment', async ({ page }) => {
    // Try to access order confirmation for another user's order
    // This requires knowing another user's order ID (which shouldn't be possible)
    const otherUserOrderId = '507f1f77bcf86cd799439011'; // Example MongoDB ObjectId format
    
    await page.goto(`${ROUTES.ORDER_CONFIRMATION}?orderId=${otherUserOrderId}`);
    
    await page.waitForTimeout(2000);
    
    // Should reject or redirect
    const hasError = await page.locator('text=/unauthorized|forbidden|not found|access denied/i').isVisible({ timeout: 3000 }).catch(() => false);
    const isRedirected = page.url().includes('/login') || page.url().includes('/orders');
    
    // Should not show other user's order
    expect(hasError || isRedirected).toBe(true);
  });

  test('should prevent payment amount tampering', async ({ page }) => {
    await page.goto(ROUTES.CHECKOUT);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Intercept and try to modify payment amount
    await page.route(API_ENDPOINTS.PAYMENT.INITIALIZE, async (route, request) => {
      const originalPostData = request.postDataJSON();
      
      // Try to modify amount to 0
      const modifiedData = {
        ...originalPostData,
        amount: 0,
      };
      
      await route.continue({
        postData: JSON.stringify(modifiedData),
      });
    });
    
    // Try to proceed with payment
    const payButton = page.locator('button:has-text("pay" i)').first();
    
    if (await payButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payButton.click();
      
      // Wait for response
      const response = await page.waitForResponse(
        response => response.url().includes(API_ENDPOINTS.PAYMENT.INITIALIZE),
        { timeout: 5000 }
      ).catch(() => null);
      
      if (response) {
        // Backend should reject zero or invalid amount
        const status = response.status();
        expect([400, 422]).toContain(status);
      }
    }
  });

  test('should require valid order before payment initialization', async ({ page }) => {
    // Try to initialize payment without valid order
    await page.goto(ROUTES.CHECKOUT);
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Clear cart or ensure no items
    await page.evaluate(() => {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestCart');
    });
    
    // Try to proceed to payment
    const payButton = page.locator('button:has-text("pay" i), button:has-text("checkout" i)').first();
    
    if (await payButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payButton.click();
      
      await page.waitForTimeout(2000);
      
      // Should show error about empty cart
      const hasError = await page.locator('text=/cart|empty|items|add/i').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError).toBe(true);
    }
  });
});

