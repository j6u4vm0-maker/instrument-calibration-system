import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const projectRoot = path.join(__dirname, '../../');
const logFile = path.join(projectRoot, 'daily-task.log');

function logInfo(message: string) {
  const time = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  const line = `[INFO] ${time} - ${message}\n`;
  console.log(line.trim());
  fs.appendFileSync(logFile, line);
}

function logError(message: string, error?: any) {
  const time = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  const line = `[ERROR] ${time} - ${message} ${error ? String(error) : ''}\n`;
  console.error(line.trim());
  fs.appendFileSync(logFile, line);
}

logInfo('初始化排程器中...');

// 設定為每天凌晨 02:00 執行
cron.schedule('0 2 * * *', () => {
  logInfo('=====================================');
  logInfo('開始執行每日排程任務...');
  
  // 這裡放置您要執行的腳本指令，例如 npm start、npm run build 等
  // 注意：如果您的系統已經在運行，再次啟動可能會遇到 Port 衝突。
  // 若是想要重新啟動，建議考慮在這裡先找出舊程序的 PID 並 kill 掉，再啟動新的。
  const command = 'npm run dev'; // 暫時以 dev 為例
  logInfo(`執行指令: ${command}`);

  const child = exec(command, { cwd: projectRoot });

  child.stdout?.on('data', (data) => {
    const text = data.toString().trim();
    if (text) logInfo(`[STDOUT] ${text}`);
  });

  child.stderr?.on('data', (data) => {
    const text = data.toString().trim();
    if (text) logError(`[STDERR] ${text}`);
  });

  child.on('close', (code) => {
    logInfo(`指令執行完畢，退出碼 (Exit code): ${code}`);
  });
});

logInfo('排程器已啟動，等待每日 02:00 觸發。保持此視窗/程序不關閉即可持續運作。');
