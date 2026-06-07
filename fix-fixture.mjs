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
  [`{ id: "serialNo", label: '??次/序??' },`, `{ id: "serialNo", label: '批次/序號' },`],
  [`{ id: "name", label: '??設????, alwaysVisible: true },`, `{ id: "name", label: '儀器設備名稱', alwaysVisible: true },`],
  [`{ id: "applicablePart", label: '??用??? },`, `{ id: "applicablePart", label: '適用料號' },`],
  [`{ id: "drawingNo", label: '對??? / 檢???? },`, `{ id: "drawingNo", label: '對應圖號 / 檢驗標準' },`],
  [`{ id: "manager", label: '管???? },`, `{ id: "manager", label: '管理單位' },`],
  [`{ id: "entryDate", label: '?????? },`, `{ id: "entryDate", label: '建檔日期' },`],
  [`{ id: "calType", label: '???類別' },`, `{ id: "calType", label: '校正類別' },`],
  [`{ id: "calibrationCycle", label: '?????? },`, `{ id: "calibrationCycle", label: '校正週期' },`],
  [`{ id: "calPoints", label: '??正點?? },`, `{ id: "calPoints", label: '校正點數' },`],
  [`{ id: "vendor", label: '供???? },`, `{ id: "vendor", label: '供應商' },`],
  [`{ id: "notes", label: '??註' },`, `{ id: "notes", label: '備註' },`],
  [`{ id: "rdIssuer", label: 'RD??? },`, `{ id: "rdIssuer", label: 'RD發行' },`],
  [`{ id: "lastCalDate", label: '上次?正?? },`, `{ id: "lastCalDate", label: '上次校正日' },`],
  [`{ id: "nextCalDate", label: '???正?? },`, `{ id: "nextCalDate", label: '下次校正日' },`],
  [`{ id: "nextCalMonth", label: '下次?正?? },`, `{ id: "nextCalMonth", label: '下次校正月' },`],
  [`{ id: "status", label: '??? },`, `{ id: "status", label: '狀態' },`],
  [`fixture.calType === '?校? `, `fixture.calType === '免校正' `],
  [`fixture.calType === '?校? ? '?校? `, `fixture.calType === '免校正' ? '免校正' `],
  [`?校?</span>`, `免校正</span>`]
]);

console.log("Replacements done for FixtureTable");
