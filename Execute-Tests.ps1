# Execute-Tests.ps1
# KST Calibration System - Test Execution Script

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   KST Calibration System - Automated Testing" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Environment Check
Write-Host "`n[1/3] Checking environment..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Running npm install..." -ForegroundColor Gray
    npm install
}

# 2. Database Sync
Write-Host "[2/3] Syncing database schema..." -ForegroundColor Yellow
npx prisma generate

# 3. Run Tests
Write-Host "[3/3] Running Playwright tests..." -ForegroundColor Yellow
Write-Host "This will start the development server automatically if needed.`n" -ForegroundColor Gray

# Run all tests
npx playwright test

$testExitCode = $LASTEXITCODE

if ($testExitCode -eq 0) {
    Write-Host "`n✅ All tests passed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Some tests failed (Exit Code: $testExitCode)." -ForegroundColor Red
    Write-Host "Opening report..." -ForegroundColor Gray
    npx playwright show-report
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "Test execution complete." -ForegroundColor Cyan
