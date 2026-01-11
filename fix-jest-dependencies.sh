#!/bin/bash

# Fix Jest Dependencies Script
# This script fixes the @jest/test-sequencer module resolution issue

set -e

echo "🔧 Fixing Jest Dependencies..."
echo ""

cd "$(dirname "$0")"

# Step 1: Remove Jest packages
echo "📦 Step 1: Removing Jest packages..."
rm -rf node_modules/@jest
rm -rf node_modules/jest
rm -rf node_modules/jest-*

# Step 2: Clear npm cache
echo "🧹 Step 2: Clearing npm cache..."
npm cache clean --force

# Step 3: Reinstall Jest packages
echo "📥 Step 3: Reinstalling Jest packages..."
npm install --save-dev --legacy-peer-deps \
  jest@^29.7.0 \
  @jest/core@^29.7.0 \
  @jest/environment@^29.7.0 \
  @jest/globals@^29.7.0 \
  @jest/test-sequencer@^29.7.0 \
  jest-environment-jsdom@^29.7.0 \
  babel-jest@^29.7.0

# Step 4: Verify installation
echo ""
echo "✅ Step 4: Verifying installation..."
if [ -d "node_modules/@jest/test-sequencer" ]; then
  echo "✅ @jest/test-sequencer is installed"
else
  echo "❌ @jest/test-sequencer is missing"
  exit 1
fi

if [ -d "node_modules/@jest/test-sequencer/build" ]; then
  echo "✅ @jest/test-sequencer/build directory exists"
else
  echo "❌ @jest/test-sequencer/build directory is missing"
  exit 1
fi

# Step 5: Test Jest
echo ""
echo "🧪 Step 5: Testing Jest..."
npx jest --version

echo ""
echo "✅ Jest dependencies fixed successfully!"
echo "You can now run: npm test"










