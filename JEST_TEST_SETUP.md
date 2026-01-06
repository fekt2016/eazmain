# Jest + React Testing Library Setup for EazMain

## ✅ Setup Complete

This project now has a complete Jest + React Testing Library testing setup.

## 📦 Installed Dependencies

- `jest` - Testing framework
- `@testing-library/react@^16.0.1` - React component testing utilities (React 19 compatible)
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - Browser-like environment for tests
- `babel-jest` - Babel transformer for Jest
- `@babel/core`, `@babel/preset-env`, `@babel/preset-react` - Babel configuration
- `identity-obj-proxy` - CSS module mocking

**Important**: `@testing-library/react@16.x` is used because it supports React 19. Version 14.x only supports React 18.

## 📁 File Structure

```
eazmain/
├── jest.config.js                    # Jest configuration
├── babel.config.js                   # Babel configuration for JSX
├── src/
│   └── tests/
│       ├── setupTests.js            # Global test setup
│       ├── test-utils.jsx           # renderWithProviders helper
│       ├── __mocks__/
│       │   ├── axios.js             # Axios API mocks
│       │   └── fileMock.js          # Static file mocks
│       ├── pages/
│       │   ├── HomePage.test.jsx    # HomePage tests
│       │   └── CheckoutPage.test.jsx # CheckoutPage tests
│       ├── components/
│       │   └── ProductCard.test.jsx # ProductCard tests
│       └── cart/
│           └── cartSkuLogic.test.jsx # Cart SKU logic tests
```

## 🧪 Test Files Created

### 1. HomePage.test.jsx
- ✅ Renders hero section with text
- ✅ Renders featured products section
- ✅ Renders categories section
- ✅ Renders trust section with features

### 2. ProductCard.test.jsx
- ✅ Renders product name, image, and price
- ✅ Shows discount badge when discount exists
- ✅ Clicking "Add to Cart" automatically selects DEFAULT variant SKU
- ✅ Never throws "Product variant SKU is required" error
- ✅ Adds product without variants to cart without SKU
- ✅ Disables "Add to Cart" button when product is out of stock

### 3. cartSkuLogic.test.jsx
- ✅ Adding same SKU twice increases quantity
- ✅ Adding different SKUs creates separate cart items
- ✅ Quantity increments only when SKU matches

### 4. CheckoutPage.test.jsx
- ✅ Renders Paystack payment option (mobile_money)
- ✅ Renders Account Balance payment option
- ✅ Disables Account Balance when balance < order total
- ✅ Enables Account Balance when balance >= order total
- ✅ Shows current balance and order total when Account Balance is selected

## 🚀 Installation & Running Tests

### Install Dependencies

```bash
cd eazmain
npm install --legacy-peer-deps
```

**Note**: Use `--legacy-peer-deps` flag because `@testing-library/react@16.x` supports React 19, but npm may show peer dependency warnings. This flag allows the installation to proceed.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Configuration Details

### jest.config.js
- Test environment: `jsdom` (browser-like)
- Setup file: `src/tests/setupTests.js`
- Test match: `src/tests/**/*.test.{js,jsx}`
- Coverage thresholds: 70% for branches, functions, lines, statements

### babel.config.js
- Transforms JSX with `@babel/preset-react`
- Uses automatic runtime (no need to import React in JSX files)
- Targets current Node.js version

### test-utils.jsx
- `renderWithProviders()` - Wraps components with:
  - `BrowserRouter` (React Router)
  - `QueryClientProvider` (React Query)
  - Disabled query retries for faster tests

## 🎯 Key Features

1. **SKU-Based Cart Logic**: Tests verify that cart items are tracked by SKU, not just product ID
2. **Default Variant Selection**: ProductCard automatically selects default SKU when adding variant products
3. **Payment Method Validation**: CheckoutPage tests verify Account Balance is disabled when insufficient
4. **No Real Network Calls**: All API calls are mocked via axios mock

## 📝 Best Practices Followed

- ✅ Use Testing Library queries (getByRole, getByText)
- ✅ Avoid testing implementation details
- ✅ Use realistic mock data based on EazMain schemas
- ✅ Keep tests isolated and deterministic
- ✅ Mock external dependencies (API, hooks, etc.)

## 🔍 Mocking Strategy

- **Axios**: Mocked in `src/tests/__mocks__/axios.js` to prevent real network calls
- **React Query**: Disabled retries in test QueryClient
- **React Router**: Wrapped in BrowserRouter via `renderWithProviders()`
- **Hooks**: Mocked using `jest.mock()` for useCart, useAuth, useWallet, etc.

## ⚠️ Important Notes

1. **No styled-components**: Tests use CSS/stylesheet only (as per requirements)
2. **SKU Validation**: All cart tests verify SKU-based logic is working correctly
3. **Payment Options**: CheckoutPage tests verify Paystack and Account Balance options
4. **Test Isolation**: Each test is independent and doesn't rely on previous tests

## 🐛 Troubleshooting

If tests fail:

1. **Install dependencies**: `npm install`
2. **Clear Jest cache**: `npm test -- --clearCache`
3. **Check Babel config**: Ensure `@babel/preset-react` is installed
4. **Verify mocks**: Check that axios mock is in `src/tests/__mocks__/axios.js`

## 📚 Next Steps

To add more tests:

1. Create test file in appropriate directory (`src/tests/pages/`, `src/tests/components/`, etc.)
2. Import `renderWithProviders` from `test-utils.jsx`
3. Mock necessary dependencies
4. Write tests following the same patterns as existing tests

---

**Status**: ✅ All tests are ready to run with `npm test`

