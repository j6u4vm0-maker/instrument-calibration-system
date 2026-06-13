@echo off
REM 切換到批次檔所在目錄 (專案根目錄)
cd /d "%~dp0"

echo [System] Starting Node.js Scheduler...
REM 執行 package.json 中我們新增的指令
npm run start:scheduler
