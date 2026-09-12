const fs = require('fs');

console.log('Testing CSV Excel UTF-8 BOM export...');
const headers = ['Taluka', 'Risk Status', 'Active Cases', 'Affected Herds', 'Primary Threat'];
const rows = [
  ['Shirur', 'CRITICAL', '47', '11', 'Foot & Mouth Disease (FMD)'],
  ['Baramati', 'MODERATE', '14', '4', 'Clinical Mastitis'],
  ['Haveli', 'LOW', '5', '2', 'Lumpy Skin (Isolated)'],
];

const escapeCell = (cell) => {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  return `"${str.replace(/"/g, '""')}"`;
};

const headerLine = headers.map(escapeCell).join(',');
const rowLines = rows.map((r) => r.map(escapeCell).join(','));
const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

fs.writeFileSync('scratch/test_output.csv', csvContent, 'utf8');
console.log('Successfully generated test_output.csv! Length:', csvContent.length);

const buf = fs.readFileSync('scratch/test_output.csv');
console.log('First 3 bytes (BOM check):', buf[0].toString(16), buf[1].toString(16), buf[2].toString(16));
if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
  console.log('PASS: Valid UTF-8 BOM verified for Excel compatibility!');
} else {
  console.error('FAIL: UTF-8 BOM missing.');
}
