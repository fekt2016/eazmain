# Installation Instructions for Jest Test Setup

## Quick Install

```bash
cd /Users/mac/Desktop/eazshop/eazmain
npm install --legacy-peer-deps
```

## Why `--legacy-peer-deps`?

The project uses **React 19**, but `@testing-library/react@14.x` only supports React 18. 

I've updated `package.json` to use `@testing-library/react@^16.0.1` which supports React 19, but npm may still show peer dependency warnings. The `--legacy-peer-deps` flag tells npm to ignore these warnings and proceed with installation.

## Verify Installation

After installation, verify the setup:

```bash
npm test
```

You should see Jest running the test suite.

## Alternative: If Installation Still Fails

If you encounter permission errors, try:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

## Dependencies Installed

All required dependencies are already listed in `package.json`:

- ✅ Jest and related packages
- ✅ React Testing Library v16 (React 19 compatible)
- ✅ Babel configuration for JSX
- ✅ All test utilities and mocks

Just run `npm install --legacy-peer-deps` and you're ready to test!


