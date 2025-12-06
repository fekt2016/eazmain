# Browser Update Instructions

## Fixing "Frozen ffmpeg browser on mac12" Warning

This warning occurs when Playwright uses outdated browser binaries that include a frozen ffmpeg build for macOS 12.

### Solution

Playwright uses **bundled browsers** by default, which are automatically downloaded and updated. To fix the warning:

1. **Update Playwright to latest version:**
   ```bash
   npm install --save-dev @playwright/test@latest playwright@latest
   ```

2. **Reinstall browsers with latest builds:**
   ```bash
   npx playwright install --with-deps chromium firefox webkit
   ```

   Or use the npm script:
   ```bash
   npm run test:e2e:install-browsers
   ```

3. **Clear old browser cache (if needed):**
   ```bash
   rm -rf ~/Library/Caches/ms-playwright
   npx playwright install --with-deps chromium firefox webkit
   ```

### Important Notes

- **Do NOT set `executablePath`** in `playwright.config.js` - this forces use of system browsers
- **Always use bundled browsers** - Playwright automatically downloads and manages them
- **Keep Playwright updated** - Latest versions include updated browser builds with current ffmpeg

### CI/CD

If running tests in CI, ensure:
- Use latest macOS runner (e.g., `macos-latest` or `macos-14`)
- Run `npx playwright install --with-deps` before tests
- Don't pin to old macOS versions (macos-12, macos-11)

### Verification

After updating, run:
```bash
npm run test:e2e
```

The warning should no longer appear, and tests will use up-to-date browser builds.


