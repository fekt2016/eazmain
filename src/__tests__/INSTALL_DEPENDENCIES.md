# Install Test Dependencies

Run this command to install all required test dependencies:

```bash
cd eazmain
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/ui jsdom
```

## Add Test Scripts to package.json

Test scripts have been added to `package.json`:
- `npm test` - Run unit tests (Vitest)
- `npm run test:ui` - Run with UI
- `npm run test:coverage` - Run with coverage
- `npm run test:watch` - Watch mode
- `npm run test:e2e` - Run E2E tests (Playwright - already exists)

## Verify Installation

After installing, verify the setup:

```bash
npm test
```

This should start Vitest and show the test runner.

## Note

Eazmain already has Playwright for E2E tests. These Vitest tests are for unit/component testing and complement the E2E tests.



