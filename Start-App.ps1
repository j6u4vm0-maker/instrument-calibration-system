# Start-App.ps1
# KST Calibration System - Application Startup Script

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   KST Calibration System - Starting Up" -ForegroundColor Cyan
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

# 3. Start Development Server
Write-Host "[3/3] Starting server at http://localhost:3000 ..." -ForegroundColor Yellow
Write-Host "The application will open in your default browser shortly.`n" -ForegroundColor Gray

# Open browser in the background after a short delay
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

# Run the dev server
npm run dev
