# 這個腳本會幫您把 run-scheduler.bat 加入 Windows 工作排程器，設定開機自動執行
$taskName = "InstrumentCalibrationScheduler"
$scriptPath = Join-Path $PSScriptRoot "run-scheduler.bat"

# 建立動作：執行 bat 檔
$action = New-ScheduledTaskAction -Execute $scriptPath -WorkingDirectory $PSScriptRoot

# 建立觸發條件：系統啟動時
$trigger = New-ScheduledTaskTrigger -AtStartup

# 建立原則：不限於交流電，允許喚醒，最高權限
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Write-Host "準備建立 Windows 排程任務: $taskName"
Write-Host "目標腳本: $scriptPath"

try {
    # 註冊工作排程
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force
    Write-Host "✅ 成功建立工作排程！排程器將在下次開機時自動在背景啟動。" -ForegroundColor Green
    Write-Host "您可以開啟 Windows 的「工作排程器 (Task Scheduler)」，找到 $taskName 來進行手動啟動或修改。" -ForegroundColor Yellow
} catch {
    Write-Host "❌ 建立排程任務失敗。請嘗試以「系統管理員身分」執行此 PowerShell 腳本。" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
pause
