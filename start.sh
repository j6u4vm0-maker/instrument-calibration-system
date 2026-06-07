#!/bin/bash

# KST Calibration System - Application Startup Script (Bash)

echo "==============================================="
echo "   KST Calibration System - Starting Up"
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

# 3. Start Development Server
echo "[3/3] Starting server at http://localhost:3000 ..."
echo "The application will open in your default browser shortly."
echo ""

# Attempt to open browser (OS dependent)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    (sleep 5; start http://localhost:3000) &
elif [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 5; open http://localhost:3000) &
else
    (sleep 5; xdg-open http://localhost:3000) &
fi

# Run the dev server
npm run dev
