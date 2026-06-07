import fs from 'fs';

function fixFile(file, replacements) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of replacements) {
    if (search instanceof RegExp) {
      text = text.replace(search, replace);
    } else {
      text = text.split(search).join(replace);
    }
  }
  fs.writeFileSync(file, text);
}

// FixtureTable
fixFile('src/components/FixtureTable.tsx', [
  [`{ id: "id", label: '??設?編??, alwaysVisible: true },`, `{ id: "id", label: '儀器設備編號', alwaysVisible: true },`],
  [`{ id: "name", label: '??設????, alwaysVisible: true },`, `{ id: "name", label: '儀器設備名稱', alwaysVisible: true },`],
  [`{ id: "drawingNo", label: '對??? / 檢???? },`, `{ id: "drawingNo", label: '對應圖號 / 檢驗標準' },`],
  [`{ id: "manager", label: '管???? },`, `{ id: "manager", label: '管理單位' },`],
  [`{ id: "vendor", label: '供???? },`, `{ id: "vendor", label: '供應商' },`],
  [`{ id: "rdIssuer", label: 'RD??? },`, `{ id: "rdIssuer", label: 'RD發行' },`],
  [`{ id: "lastCalDate", label: '上次?正?? },`, `{ id: "lastCalDate", label: '上次校正日' },`],
  [`{ id: "nextCalDate", label: '???正?? },`, `{ id: "nextCalDate", label: '下次校正日' },`],
  [`{ id: "nextCalMonth", label: '下次?正?? },`, `{ id: "nextCalMonth", label: '下次校正月' },`],
  [`{ id: "status", label: '??? },`, `{ id: "status", label: '狀態' },`],
  [`fixture.calType === '?校? `, `fixture.calType === '免校正' `],
  [`fixture.calType === '?校? ? '?校? `, `fixture.calType === '免校正' ? '免校正' `],
  [`?校?</span>`, `免校正</span>`]
]);

// BatchEditForm
fixFile('src/components/BatchEditForm.tsx', [
  [`總費??/label>`, `總費用</label>`]
]);

// GageDataTables
fixFile('src/components/GageDataTables.tsx', [
  [`placeholder="例?：??\n`, `placeholder="例如：溫度"\n`],
  [`placeholder="例?：??\r\n`, `placeholder="例如：溫度"\r\n`]
]);

// GageTable
fixFile('src/components/GageTable.tsx', [
  [`gage.calType === '?校? `, `gage.calType === '免校正' `],
  [`gage.calType === '?校? ? `, `gage.calType === '免校正' ? `],
  [`?校?</span>`, `免校正</span>`]
]);

// RecordTable
fixFile('src/components/RecordTable.tsx', [
  [`record.gage.calType === '?校? ? `, `record.gage.calType === '免校正' ? `],
  [`record.gage.calType === '?校? `, `record.gage.calType === '免校正' `],
  [`?校?</span>`, `免校正</span>`]
]);

// InternalCalibrationForm
fixFile('src/components/InternalCalibrationForm.tsx', [
  [`或者異常?是?確定?繼??出?);`, `或者異常，是否確定繼續送出？");`],
  [`~ {c.rangeEnd || '??}\n`, `~ {c.rangeEnd || '無限大'}\n`],
  [`~ {c.rangeEnd || '??}\r\n`, `~ {c.rangeEnd || '無限大'}\r\n`]
]);

console.log("Replacements done");
