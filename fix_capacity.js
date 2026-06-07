const fs = require('fs');

const files = [
  'src/components/GageAddModal.tsx',
  'src/components/GageEditModal.tsx',
  'src/components/FixtureAddModal.tsx',
  'src/components/FixtureEditModal.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // change 1/3 back to 1/2
  content = content.replace(/className="w-full md:w-1\/3 px-3 mb-5"/g, 'className="w-full md:w-1/2 px-3 mb-5"');

  const isEdit = file.includes('Edit');
  const isFixture = file.includes('Fixture');
  const tKey = isFixture ? 'fixture' : 'gage';
  const dataVar = isFixture ? 'fixture' : 'gage';
  const defaultVal = isEdit ? `defaultValue={${dataVar}.capacity || ''}` : '';

  const capacityDiv = `
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>{t('calibration.${tKey}.capacity')}</label>
                    <input 
                      type="text" 
                      name="capacity" 
                      ${defaultVal}
                      className={inputStyle} 
                      placeholder="例如：250g"
                    />
                  </div>`;

  content = content.replace(/placeholder="例如：0~150mm"\n\s*\/>\n\s*<\/div>/g, 'placeholder="例如：0~150mm"\n                    />\n                  </div>' + capacityDiv);

  if (content.includes("usageRange: (formData.get('usageRange') as string) || null,")) {
    content = content.replace(/usageRange: \(formData\.get\('usageRange'\) as string\) \|\| null,/g, "usageRange: (formData.get('usageRange') as string) || null,\n      capacity: (formData.get('capacity') as string) || null,");
  }

  fs.writeFileSync(file, content);
});
console.log('done');
