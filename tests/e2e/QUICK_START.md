# E2E Security Tests - Quick Start Guide

## 🚀 Run Tests in 3 Steps

### Step 1: Start Dev Server (if not running)
```bash
npm run dev
```

### Step 2: Run Tests
```bash
npm run test:e2e
```

### Step 3: View Results
```bash
npm run test:e2e:report
```

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all security tests |
| `npm run test:e2e:ui` | Run tests with interactive UI |
| `npm run test:e2e:headed` | Run tests with visible browser |
| `npm run test:e2e:debug` | Run tests in debug mode |
| `npm run test:e2e:prod` | Test against production build |
| `npm run test:e2e:report` | View HTML test report |

---

## 🎯 Test Files

- `auth.spec.js` - Authentication security (9 tests)
- `protectedRoutes.spec.js` - Route protection (11 tests)
- `xss.spec.js` - XSS prevention (9 tests)
- `formValidation.spec.js` - Form validation (10 tests)
- `paymentSecurity.spec.js` - Payment security (9 tests)
- `tokenSecurity.spec.js` - Token security (10 tests)
- `dataProtection.spec.js` - Data protection (10 tests)
- `errorHandling.spec.js` - Error handling (11 tests)

**Total: ~80+ test cases**

---

## ⚡ Quick Test Run

```bash
# Run single test file
npx playwright test tests/e2e/security/auth.spec.js

# Run specific test
npx playwright test -g "should reject invalid login"

# Run in specific browser
npx playwright test --project=chromium
```

---

## 🔧 Configuration

Tests run against `http://localhost:5173` by default.

To change base URL:
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

---

## 📊 Expected Results

All tests should pass, confirming:
- ✅ No security vulnerabilities
- ✅ Proper authentication
- ✅ XSS prevention
- ✅ Input validation
- ✅ Secure token handling
- ✅ Payment security
- ✅ Data protection

---

## 🐛 Troubleshooting

**Tests timeout?**
- Check if dev server is running
- Increase timeout in `playwright.config.js`

**Tests fail?**
- Check browser console for errors
- Review test reports in `playwright-report/`
- Verify selectors match current UI

**Need help?**
- See `tests/e2e/README.md` for detailed docs
- Check `SECURITY_TEST_SUMMARY.md` for test coverage

---

**Ready to test! Run `npm run test:e2e` to get started.**

