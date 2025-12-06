/**
 * Helper functions for authentication in E2E tests
 */

/**
 * Login a test user programmatically
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} credentials.otp - OTP code (if required)
 * @returns {Promise<void>}
 */
export async function loginUser(page, { email, password, otp = '123456' }) {
  // Navigate to login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Wait for login form to be visible
  const emailInput = page.locator('input[type="email"], input[id="loginId"], input[name*="login" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Fill in credentials
  await emailInput.fill(email);
  
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(password);
  
  // Submit form
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.waitFor({ state: 'visible', timeout: 10000 });
  await submitButton.click();
  
  // Wait for response
  await page.waitForTimeout(3000);
  
  // Wait for OTP step if it appears
  const otpInput = page.locator('input[type="text"][maxlength="1"], input[type="text"][inputmode="numeric"]').first();
  const otpVisible = await otpInput.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (otpVisible) {
    // Fill OTP (assuming 6-digit OTP)
    const otpInputs = page.locator('input[type="text"][maxlength="1"], input[type="text"][inputmode="numeric"]');
    const count = await otpInputs.count();
    
    for (let i = 0; i < Math.min(count, 6); i++) {
      await otpInputs.nth(i).fill(otp[i] || '1');
    }
    
    // Submit OTP
    const otpSubmitButton = page.locator('button[type="submit"]').first();
    await otpSubmitButton.waitFor({ state: 'visible', timeout: 10000 });
    await otpSubmitButton.click();
    
    // Wait for navigation after OTP verification
    await page.waitForTimeout(3000);
  }
  
  // Wait for navigation after login (should redirect away from login page)
  await page.waitForURL((url) => !url.pathname.includes('/login') && !url.pathname.includes('/verify-account'), { timeout: 15000 }).catch(() => {});
  
  // Wait a bit for auth state to settle
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

/**
 * Logout current user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function logoutUser(page) {
  // Look for logout button/link (adjust selector based on your UI)
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();
  
  if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname.includes('/login'), { timeout: 5000 });
  } else {
    // If no logout button found, clear cookies manually
    await page.context().clearCookies();
    await page.goto('/');
  }
}

/**
 * Check if user is logged in
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn(page) {
  // Wait for page to load
  await page.waitForLoadState('networkidle').catch(() => {});
  
  // Check for user-specific UI elements
  const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user"], [aria-label*="account"], button:has-text("logout" i), button:has-text("sign out" i)').first();
  const isVisible = await userMenu.isVisible({ timeout: 3000 }).catch(() => false);
  
  // Also check cookies
  const cookies = await page.context().cookies();
  const hasAuthCookie = cookies.some(cookie => 
    cookie.name.includes('jwt') || cookie.name.includes('token') || cookie.name.includes('auth')
  );
  
  // Check if we're on a protected page (not login/verify)
  const url = page.url();
  const isOnProtectedPage = !url.includes('/login') && !url.includes('/verify-account') && !url.includes('/signup');
  
  return isVisible || hasAuthCookie || isOnProtectedPage;
}

/**
 * Wait for authentication state to settle
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function waitForAuthState(page) {
  // Wait for any auth-related API calls to complete
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

