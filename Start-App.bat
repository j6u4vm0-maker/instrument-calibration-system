@echo off
title KST Calibration System - Startup
echo ===============================================
echo    KST Calibration System - Starting Up
echo ===============================================

echo.
echo [1/3] Checking environment...
if not exist node_modules (
    echo node_modules not found. Running npm install...
    call npm install
)

echo [2/3] Syncing database schema...
call npx prisma generate

echo [3/3] Starting server at http://localhost:3000 ...
echo The application will open in your default browser shortly.
echo.

start http://localhost:3000
npm run dev

pause
