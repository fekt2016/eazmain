# E2E Security Test Suite

This directory contains end-to-end security tests for the EazMain application using Playwright.

## 📁 Structure

```
tests/e2e/
├── security/          # Security test files
│   ├── auth.spec.js
│   ├── protectedRoutes.spec.js
│   ├── xss.spec.js
│   ├── formValidation.spec.js
│   ├── paymentSecurity.spec.js
│   ├── tokenSecurity.spec.js
│   ├── dataProtection.spec.js
│   └── errorHandling.spec.js
└── utils/             # Helper utilities
    ├── login.js
    ├── urls.js
    └── intercept.js
```

## 🚀 Running Tests

### Run all security tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run tests against production build
```bash
npm run test:e2e:prod
```

### View test report
```bash
npm run test:e2e:report
```

## 🧪 Test Coverage

### Authentication Security (`auth.spec.js`)
- Invalid login attempts
- SQL injection prevention
- Script injection prevention
- Rate limiting
- Session expiration
- No sensitive data in localStorage/sessionStorage

### Protected Routes (`protectedRoutes.spec.js`)
- Redirect to login when not authenticated
- Token expiration handling
- Protected API call security
- Multiple tabs with expired tokens

### XSS Security (`xss.spec.js`)
- Script injection in search bar
- Script injection in profile forms
- Script injection in address forms
- Script injection in contact forms
- URL parameter sanitization
- HTML escaping

### Form Validation (`formValidation.spec.js`)
- Email validation
- Phone validation
- Required fields
- HTML/script prevention
- Password rules
- Input length limits

### Payment Security (`paymentSecurity.spec.js`)
- Price manipulation prevention
- Request payload validation
- Paystack redirection security
- Fake payment success URL prevention
- Order ownership validation

### Token Security (`tokenSecurity.spec.js`)
- Token removal on logout
- No manual token injection
- Token expiration handling
- httpOnly cookie usage
- No JWT in localStorage

### Data Protection (`dataProtection.spec.js`)
- No passwords in API responses
- No JWT tokens in responses
- Limited field exposure
- No internal IDs leakage
- Input sanitization

### Error Handling (`errorHandling.spec.js`)
- User-friendly error messages
- No stack traces in production
- Network offline handling
- Error boundary functionality
- No sensitive data in console

## ⚙️ Configuration

Tests are configured in `playwright.config.js` at the root of the project.

### Environment Variables

- `PLAYWRIGHT_BASE_URL`: Override base URL (default: `http://localhost:5173`)
- `PLAYWRIGHT_SKIP_SERVER`: Skip starting dev server (default: false)
- `NODE_ENV`: Set to `production` to test against production build

### Test Credentials

Some tests require authentication. Update test credentials in `tests/e2e/utils/login.js` or use environment variables:

```bash
TEST_USER_EMAIL=test@example.com TEST_USER_PASSWORD=password123 npm run test:e2e
```

## 📝 Writing New Tests

### Example Test

```javascript
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/urls';

test('should prevent XSS in search', async ({ page }) => {
  await page.goto(ROUTES.HOME);
  
  const searchInput = page.locator('input[type="search"]').first();
  await searchInput.fill('<script>alert(1)</script>');
  
  let alertTriggered = false;
  page.on('dialog', () => { alertTriggered = true; });
  
  await page.waitForTimeout(1000);
  expect(alertTriggered).toBe(false);
});
```

## 🔍 Debugging

1. Use `--debug` flag to step through tests
2. Use `--headed` to see browser actions
3. Use `--ui` for interactive test runner
4. Check `playwright-report/` for detailed reports

## 📊 Continuous Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
```

## ⚠️ Important Notes

1. **Test Data**: Tests use mock data and should not affect production
2. **Credentials**: Never commit real credentials to version control
3. **Environment**: Tests run against local dev server by default
4. **Isolation**: Each test runs in isolation with fresh browser context

## 🐛 Troubleshooting

### Tests fail with "Target closed"
- Increase timeout in `playwright.config.js`
- Check if dev server is running

### Tests timeout
- Check network connectivity
- Verify API endpoints are accessible
- Increase `timeout` in test configuration

### Tests are flaky
- Add `waitForLoadState('networkidle')` before assertions
- Use `waitForSelector` instead of `isVisible`
- Increase wait times for slow operations

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

