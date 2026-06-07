const fs = require('fs');
const fix = (file, replacements) => {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of replacements) {
    text = text.replace(search, replace);
  }
  fs.writeFileSync(file, text);
};

fix('src/components/BatchEditForm.tsx', [
  [/總費\?\?\/label>/g, '總費用</label>']
]);

fix('src/components/FixtureTable.tsx', [
  [/\?\?設\?編\?\?, alwaysVisible/g, '儀器設備編號\', alwaysVisible'],
  [/fixture.calType === \'\?校\? /g, 'fixture.calType === \\'免校正\\' '],
  [/fixture.calType === \'\?校\? \? \'\?校\? /g, 'fixture.calType === \\'免校正\\' ? \\'免校正\\' '],
  [/\?校\?\/span>/g, '免校正</span>']
]);

fix('src/components/GageDataTables.tsx', [
  [/placeholder=\"例\?：\?\?/g, 'placeholder=\"例如：溫度\"']
]);

fix('src/components/GageTable.tsx', [
  [/gage.calType === \'\?校\? /g, 'gage.calType === \\'免校正\\' '],
  [/gage.calType === \'\?校\? \? /g, 'gage.calType === \\'免校正\\' ? ']
]);

fix('src/components/RecordTable.tsx', [
  [/record.gage.calType === \'\?校\? \? /g, 'record.gage.calType === \\'免校正\\' ? '],
  [/record.gage.calType === \'\?校\? /g, 'record.gage.calType === \\'免校正\\' ']
]);

fix('src/components/InternalCalibrationForm.tsx', [
  [/或者異常\?是\?確定\?繼\?\?出\?\);/g, '或者異常，是否確定繼續送出？\");'],
  [/~ \{c.rangeEnd \|\| \'\?\?\}\r?\n/g, '~ {c.rangeEnd || \\'無限大\\'}\n']
]);
console.log('Fixed');
