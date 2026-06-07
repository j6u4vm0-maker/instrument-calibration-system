#!/bin/bash

# KST Calibration System - Test Execution Script (Bash)

echo "==============================================="
echo "   KST Calibration System - Automated Testing"
echo "==============================================="

# 1. Environment Check
echo -e "\n[1/3] Checking environment..."
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Running npm install..."
    npm install
fi

# 2. Database Sync
echo "[2/3] Syncing database schema..."
npx prisma generate

# 3. Run Tests
echo "[3/3] Running Playwright tests..."
echo "This will start the development server automatically if needed."
echo ""

# Run all tests
npx playwright test

testExitCode=$?

if [ $testExitCode -eq 0 ]; then
    echo -e "\n✅ All tests passed successfully!"
else
    echo -e "\n❌ Some tests failed (Exit Code: $testExitCode)."
    echo "Opening report..."
    npx playwright show-report
fi

echo "==============================================="
echo "Test execution complete."
