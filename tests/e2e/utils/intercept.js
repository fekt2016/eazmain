/**
 * Helper functions for intercepting and mocking API calls in E2E tests
 */

/**
 * Intercept and mock an API endpoint
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to match (can be string or regex)
 * @param {Object} response - Mock response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Promise<void>}
 */
export async function mockApiResponse(page, urlPattern, response, status = 200) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Intercept and mock multiple API endpoints
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Array<{url: string, response: Object, status?: number}>} mocks - Array of mock configurations
 * @returns {Promise<void>}
 */
export async function mockApiResponses(page, mocks) {
  for (const mock of mocks) {
    await mockApiResponse(page, mock.url, mock.response, mock.status || 200);
  }
}

/**
 * Wait for a specific API call to complete
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to wait for
 * @param {Object} options - Wait options
 * @returns {Promise<import('@playwright/test').Response>}
 */
export async function waitForApiCall(page, urlPattern, options = {}) {
  const timeout = options.timeout || 10000;
  
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      } else if (urlPattern instanceof RegExp) {
        return urlPattern.test(url);
      }
      return false;
    },
    { timeout }
  );
}

/**
 * Intercept and fail an API call (simulate network error)
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to match
 * @returns {Promise<void>}
 */
export async function failApiCall(page, urlPattern) {
  await page.route(urlPattern, async (route) => {
    await route.abort('failed');
  });
}

/**
 * Intercept and delay an API call (simulate slow network)
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to match
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise<void>}
 */
export async function delayApiCall(page, urlPattern, delay = 2000) {
  await page.route(urlPattern, async (route) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    await route.continue();
  });
}

/**
 * Clear all route handlers
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function clearApiMocks(page) {
  await page.unrouteAll();
}

/**
 * Capture all API requests for a specific pattern
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to capture
 * @returns {Promise<Array>}
 */
export async function captureApiRequests(page, urlPattern) {
  const requests = [];
  
  page.on('request', (request) => {
    const url = request.url();
    if (typeof urlPattern === 'string' && url.includes(urlPattern)) {
      requests.push({
        url,
        method: request.method(),
        postData: request.postData(),
        headers: request.headers(),
      });
    } else if (urlPattern instanceof RegExp && urlPattern.test(url)) {
      requests.push({
        url,
        method: request.method(),
        postData: request.postData(),
        headers: request.headers(),
      });
    }
  });
  
  return requests;
}

