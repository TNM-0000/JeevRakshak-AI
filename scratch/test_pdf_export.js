const { jsPDF } = require('jspdf');
const fs = require('fs');

console.log('Testing jsPDF generation...');
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

doc.setFillColor(45, 106, 79);
doc.rect(0, 0, 210, 28, 'F');
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.text('GOVERNMENT OF INDIA • JEEVRAKSHAK AI', 14, 11);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.text('Department of Animal Husbandry & Dairying (DAHD)', 14, 18);

doc.setTextColor(27, 67, 50);
doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.text('Monthly District Epidemiological Surveillance Bulletin', 14, 38);

const pdfOutput = doc.output('arraybuffer');
fs.writeFileSync('scratch/test_output.pdf', Buffer.from(pdfOutput));
console.log('Successfully generated test_output.pdf! Size:', pdfOutput.byteLength, 'bytes');

// Check magic bytes %PDF-
const header = Buffer.from(pdfOutput.slice(0, 5)).toString();
console.log('PDF Header Magic Bytes:', header);
if (header.startsWith('%PDF-')) {
  console.log('PASS: Valid PDF standard format verified!');
} else {
  console.error('FAIL: Not a valid PDF format.');
}
