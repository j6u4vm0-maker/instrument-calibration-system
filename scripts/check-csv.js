const fs = require('fs');
const iconv = require('iconv-lite');
const { parse } = require('csv-parse/sync');

const fileBuffer = fs.readFileSync('印度廠設備清單_2025.10.22.csv');
const content = iconv.decode(fileBuffer, 'big5');
const records = parse(content, {
  columns: true,
  skip_empty_lines: true
});

console.log('Headers:', Object.keys(records[0]));
console.log('First Record:', records[0]);
