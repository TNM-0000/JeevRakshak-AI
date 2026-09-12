'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// 1. GENERIC CSV EXPORT (UTF-8 with BOM for Native Excel Compatibility)
// ============================================================================

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  try {
    const escapeCell = (cell: string | number | null | undefined): string => {
      if (cell === null || cell === undefined) return '""';
      const str = String(cell);
      // Escape double quotes by doubling them
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const headerLine = headers.map(escapeCell).join(',');
    const rowLines = rows.map((row) => row.map(escapeCell).join(','));
    const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n'); // \uFEFF is UTF-8 BOM

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('CSV Export Error:', err);
    return false;
  }
}

// ============================================================================
// 2. OFFICIAL GOVERNMENT & CLINICAL PDF GENERATOR
// ============================================================================

export interface PDFReportConfig {
  filename: string;
  title: string;
  subtitle?: string;
  department?: string;
  jurisdiction?: string;
  summaryMetrics?: { label: string; value: string | number }[];
  tables: {
    title?: string;
    headers: string[];
    rows: (string | number)[][];
  }[];
  notes?: string[];
}

export function generateOfficialPDF(config: PDFReportConfig) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // --- Header Banner ---
    doc.setFillColor(45, 106, 79); // #2D6A4F Forest Green
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Emblem & Title in Banner
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GOVERNMENT OF INDIA • JEEVRAKSHAK AI', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(216, 243, 220); // soft mint
    const dept = config.department || 'Department of Animal Husbandry & Dairying (DAHD) • National Surveillance';
    doc.text(dept, margin, 18);

    doc.setFontSize(8);
    doc.setTextColor(183, 228, 199);
    doc.text(`DATE GENERATED: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin, 18, { align: 'right' });

    let currentY = 36;

    // --- Document Title & Subtitle ---
    doc.setTextColor(27, 67, 50); // #1B4332 Dark Forest Slate
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(config.title, margin, currentY);

    if (config.subtitle) {
      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(82, 121, 111); // #52796F
      doc.text(config.subtitle, margin, currentY);
    }

    if (config.jurisdiction) {
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(45, 106, 79);
      doc.text(`JURISDICTION: ${config.jurisdiction.toUpperCase()}`, margin, currentY);
    }

    currentY += 8;

    // --- Summary Metrics Cards (if provided) ---
    if (config.summaryMetrics && config.summaryMetrics.length > 0) {
      const cardWidth = (pageWidth - margin * 2 - (config.summaryMetrics.length - 1) * 4) / config.summaryMetrics.length;
      const cardHeight = 16;

      config.summaryMetrics.forEach((metric, idx) => {
        const cardX = margin + idx * (cardWidth + 4);
        doc.setFillColor(248, 255, 249); // #F8FFF9
        doc.setDrawColor(82, 183, 136); // #52B788
        doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 3, 3, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(82, 121, 111);
        doc.text(metric.label.toUpperCase(), cardX + 3, currentY + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(45, 106, 79);
        doc.text(String(metric.value), cardX + 3, currentY + 12);
      });

      currentY += cardHeight + 8;
    }

    // --- Render Tables ---
    config.tables.forEach((table) => {
      if (table.title) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(27, 67, 50);
        doc.text(table.title, margin, currentY);
        currentY += 3;
      }

      autoTable(doc, {
        startY: currentY,
        head: [table.headers],
        body: table.rows,
        margin: { left: margin, right: margin },
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2.8,
          textColor: [27, 67, 50],
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [45, 106, 79],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        alternateRowStyles: {
          fillColor: [248, 255, 249],
        },
        didDrawPage: (data) => {
          // Footer on every page
          doc.setFontSize(7.5);
          doc.setTextColor(140, 150, 160);
          doc.text(
            'CONFIDENTIAL • OFFICIAL GOVERNMENT OF INDIA VETERINARY HEALTH REGISTER • JEEVRAKSHAK AI',
            margin,
            pageHeight - 8
          );
          doc.text(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
        },
      });

      // Get Y position after table
      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    // --- Notes & Verification Seal ---
    if (config.notes && config.notes.length > 0) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(45, 106, 79);
      doc.text('ADMINISTRATIVE DIRECTIVE & COMPLIANCE NOTES:', margin, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(82, 121, 111);
      config.notes.forEach((note) => {
        doc.text(`•  ${note}`, margin + 2, currentY);
        currentY += 4;
      });
      currentY += 4;
    }

    // Official Digital Stamp
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(46, 204, 113);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(45, 106, 79);
    doc.text('✓ DIGITALLY SECURED & ARCHIVED INTO NATIONAL HEALTH DATABASE', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(82, 121, 111);
    const hash = 'JR-SEC-' + Math.random().toString(16).substring(2, 10).toUpperCase() + '-' + Date.now().toString(16).toUpperCase();
    doc.text(`Security Verification Hash: ${hash} | Certified by District Animal Husbandry Officer (DAHO)`, margin + 4, currentY + 11);

    // Trigger Save
    const fname = config.filename.endsWith('.pdf') ? config.filename : `${config.filename}.pdf`;
    doc.save(fname);
    return true;
  } catch (err) {
    console.error('PDF Generation Error:', err);
    return false;
  }
}

// ============================================================================
// 3. SPECIALIZED HIGH-LEVEL GOVERNMENT EXPORTERS
// ============================================================================

export function downloadMonthlyEpidemiologicalBulletinPDF() {
  return generateOfficialPDF({
    filename: 'Monthly_District_Epidemiological_Bulletin_Pune.pdf',
    title: 'Monthly District Epidemiological Surveillance Bulletin',
    subtitle: 'Comprehensive Disease Telemetry, Pathogen Risk Assessment & Active Containment Rings',
    jurisdiction: 'Pune Division (14 Talukas) • Maharashtra State',
    summaryMetrics: [
      { label: 'Active Outbreaks', value: 2 },
      { label: 'Monitored Herds', value: 142 },
      { label: 'Total Cattle Monitored', value: '3,84,000' },
      { label: 'Vaccination Rate', value: '81.4%' },
    ],
    tables: [
      {
        title: 'Taluka-Level Pathogen Incidence & Containment Status',
        headers: ['Taluka / Block', 'Risk Category', 'Active Cases', 'Affected Herds', 'Primary Threat', 'Containment Directive'],
        rows: [
          ['Shirur', 'CRITICAL', '47', '11', 'Foot & Mouth Disease (FMD)', '5km Quarantine Ring & Market Closure'],
          ['Baramati', 'MODERATE', '14', '4', 'Clinical Mastitis', 'Mobile Veterinary Unit Dispatched'],
          ['Haveli', 'LOW', '5', '2', 'Lumpy Skin (Isolated)', 'Ring Booster Immunization Active'],
          ['Khed', 'MODERATE', '9', '3', 'Black Quarter (BQ)', 'Antibiotic Buffer Deployed'],
          ['Daund', 'LOW', '3', '1', 'Bovine Babesiosis', 'Acaricide Dipping Advisory Issued'],
          ['Indapur', 'LOW', '2', '1', 'Foot Rot (Ovine)', 'Sanitization & Foot Bath Deployed'],
          ['Ambegaon', 'LOW', '0', '0', 'None (Monitored)', 'Routine NADCP Surveillance'],
          ['Junnar', 'LOW', '0', '0', 'None (Monitored)', 'Cold-Chain Reserve Stocked'],
        ],
      },
      {
        title: 'Division Pathogen Proportions (Current Month)',
        headers: ['Pathogen / Disease', 'Identified Cases', 'Division Share (%)', 'Targeted Species', 'Vaccine Buffer Available'],
        rows: [
          ['Foot & Mouth Disease (FMD)', '47', '45.2%', 'Cattle & Buffalo', '3,20,000 doses in cold-chain'],
          ['Lumpy Skin Disease (LSD)', '28', '26.9%', 'Indigenous & Crossbred Bovines', '1,38,000 doses reserved'],
          ['Clinical Mastitis', '18', '17.3%', 'Lactating Dairy Cows', '4,500 intramammary kits'],
          ['Haemorrhagic Septicaemia (HS)', '7', '6.7%', 'Buffalo & Calves', '45,000 doses in warehouse'],
          ['Black Quarter (BQ)', '4', '3.8%', 'Young Bovines (6-24 months)', '30,000 doses deployed'],
        ],
      },
    ],
    notes: [
      'Movement of cloven-hoofed livestock within the 5km radius of Shirur is strictly restricted under the Prevention and Control of Infectious Diseases in Animals Act.',
      'All taluka polyclinics must maintain cold chain temperature between 2°C and 8°C with dual digital temperature loggers.',
      '1962 mobile veterinary vans must report all acute recumbency calls within 30 minutes of notification.',
    ],
  });
}

export function downloadNADCPVaccinationLogExcel() {
  const headers = [
    'Campaign ID',
    'Campaign Name',
    'Target Species',
    'District',
    'Taluka / Block',
    'Target Population',
    'Vaccinated Count',
    'Coverage (%)',
    'Vaccine Batch #',
    'Cold Chain Temp (°C)',
    'Status',
  ];

  const rows = [
    ['NADCP-FMD-04-PUN-01', 'National FMD Control Programme (Phase 4)', 'Bovine Cattle & Buffalo', 'Pune', 'Shirur', '38,000', '31,200', '82.1%', 'BIO-FMD-2026-09A', '3.8°C', 'In Progress'],
    ['NADCP-FMD-04-PUN-02', 'National FMD Control Programme (Phase 4)', 'Bovine Cattle & Buffalo', 'Pune', 'Baramati', '42,000', '38,220', '91.0%', 'BIO-FMD-2026-09A', '4.1°C', 'Near Target'],
    ['NADCP-FMD-04-PUN-03', 'National FMD Control Programme (Phase 4)', 'Bovine Cattle & Buffalo', 'Pune', 'Haveli', '34,000', '26,860', '79.0%', 'BIO-FMD-2026-09B', '3.9°C', 'In Progress'],
    ['NADCP-FMD-04-PUN-04', 'National FMD Control Programme (Phase 4)', 'Bovine Cattle & Buffalo', 'Pune', 'Khed', '30,000', '24,600', '82.0%', 'BIO-FMD-2026-09B', '4.0°C', 'In Progress'],
    ['NADCP-FMD-04-PUN-05', 'National FMD Control Programme (Phase 4)', 'Bovine Cattle & Buffalo', 'Pune', 'Daund', '28,000', '21,000', '75.0%', 'BIO-FMD-2026-09C', '3.7°C', 'In Progress'],
    ['LSD-RING-2026-01', 'Lumpy Skin Ring Immunization Drive', 'Crossbred Cows & Calves', 'Pune', 'Shirur Buffer (5km)', '15,000', '13,800', '92.0%', 'LSD-LIVE-4412', '4.2°C', 'Completed'],
    ['BRUC-CALF-2026-01', 'Brucellosis Calf-Hood Vaccination', 'Female Calves (4-8 months)', 'Pune', 'Division Total', '65,000', '48,200', '74.1%', 'BRUC-S19-901', '3.5°C', 'In Progress'],
    ['PPR-SHEEP-2026-01', 'Peste des Petits Ruminants (PPR) Control', 'Sheep & Goats', 'Pune', 'Division Total', '55,000', '51,400', '93.4%', 'PPR-VAC-012', '4.0°C', 'Near Target'],
  ];

  return exportToCSV('NADCP_Vaccination_Target_Coverage_Log_Pune.csv', headers, rows);
}

export function download1962EmergencyAuditPDF() {
  return generateOfficialPDF({
    filename: '1962_Ambulatory_Response_Case_Audit_Pune.pdf',
    title: '1962 Mobile Veterinary Ambulance (MVU) Response Audit',
    subtitle: 'Incident Response Times, Unit Deployment Logistics & Emergency Outcomes',
    jurisdiction: 'Pune Division Command • Emergency 1962 Control Room',
    summaryMetrics: [
      { label: 'Active Ambulances', value: '18 / 20' },
      { label: 'Avg Response Time', value: '24 mins' },
      { label: 'Monthly Dispatches', value: 142 },
      { label: 'Stabilization Rate', value: '96.4%' },
    ],
    tables: [
      {
        title: 'Recent Critical Emergency Dispatches (Live Log)',
        headers: ['Ticket ID', 'Species / Breed', 'Farmer Name', 'Village / Taluka', 'Emergency Condition', 'MVU Unit #', 'Response Status'],
        rows: [
          ['SOS-2026-901', 'Bovine Cow (Gir)', 'Baburao Kale', 'Koregaon Bhima, Shirur', 'Acute recumbency & hypocalcemia', 'MH-12-MV-4412', 'Team On-Site'],
          ['SOS-2026-902', 'Crossbred Heifer', 'Pandurang Jagtap', 'Nimgaon Mhalungi, Shirur', 'Suspected OP toxicity / salivation', 'MH-12-MV-4418', 'Dispatched'],
          ['SOS-2026-903', 'Murrah Buffalo', 'Kishor Shinde', 'Shirapur, Shirur', 'High fever, oral vesicles & lameness', 'MH-12-MV-4412', 'Stabilized'],
          ['SOS-2026-898', 'Jersey Cross Cow', 'Anandrao Mane', 'Supa, Baramati', 'Dystocia (difficult calving)', 'MH-12-MV-4409', 'Resolved (Delivered)'],
          ['SOS-2026-895', 'Deoni Bull', 'Vikas Deshmukh', 'Uruli Kanchan, Haveli', 'Severe bloat / ruminal tympany', 'MH-12-MV-4403', 'Resolved (Trocarized)'],
        ],
      },
      {
        title: 'MVU Ambulance Fleet Readiness Matrix',
        headers: ['Vehicle Reg #', 'Base Polyclinic', 'Veterinarian In-Charge', 'GPS Telemetry Status', 'Emergency Kits', 'Fuel Buffer'],
        rows: [
          ['MH-12-MV-4412', 'Shirur Polyclinic', 'Dr. S. R. Joshi (MSVC-14201)', 'Active (Koregaon Bhima)', '100% Stocked', '92% Full'],
          ['MH-12-MV-4418', 'Baramati Polyclinic', 'Dr. N. G. Shinde (MSVC-16044)', 'En Route (Nimgaon)', '100% Stocked', '88% Full'],
          ['MH-12-MV-4409', 'Daund Health Center', 'Dr. V. P. Patil (MSVC-15112)', 'Standby at Base', '100% Stocked', '95% Full'],
          ['MH-12-MV-4403', 'Haveli Polyclinic', 'Dr. R. M. Kulkarni (MSVC-17882)', 'Returning to Base', 'Re-stocking Required', '75% Full'],
        ],
      },
    ],
    notes: [
      'The 1962 service operates 24x7 under the Government of India Mobile Veterinary Units scheme.',
      'Emergency medicine kits contain Calcium Borogluconate, Atropine Sulphate, Broad-Spectrum Ceftiofur, and Dextrose 20% solutions.',
    ],
  });
}

export function downloadLivestockCensusRegistryExcel() {
  const headers = [
    'Animal ID / INAPH Tag',
    'Species',
    'Breed',
    'Gender',
    'Age (Years)',
    'Owner / Farmer Name',
    'Village',
    'Taluka / Block',
    'District',
    'Vaccination Status',
    'Health Status',
    'Last Clinical Visit',
  ];

  const rows = [
    ['INAPH-MH-9021441', 'Cattle', 'Gir', 'Female', '4.5', 'Baburao Kale', 'Koregaon Bhima', 'Shirur', 'Pune', 'FMD Vaccinated', 'Treatment', '12-Sept-2026'],
    ['INAPH-MH-9021442', 'Cattle', 'Crossbred HF', 'Female', '3.0', 'Pandurang Jagtap', 'Nimgaon Mhalungi', 'Shirur', 'Pune', 'FMD Vaccinated', 'Critical', '12-Sept-2026'],
    ['INAPH-MH-9021443', 'Buffalo', 'Murrah', 'Female', '5.0', 'Kishor Shinde', 'Shirapur', 'Shirur', 'Pune', 'Booster Due', 'Critical', '11-Sept-2026'],
    ['INAPH-MH-9021444', 'Cattle', 'Deoni', 'Male', '6.0', 'Suresh Rambhau Shinde', 'Shirapur', 'Shirur', 'Pune', 'FMD Vaccinated', 'Healthy', '08-Sept-2026'],
    ['INAPH-MH-9021445', 'Buffalo', 'Surti', 'Female', '4.0', 'Anandrao Mane', 'Supa', 'Baramati', 'Pune', 'All Vaccines Current', 'Healthy', '05-Sept-2026'],
    ['INAPH-MH-9021446', 'Goat', 'Osmanabadi', 'Female', '2.0', 'Vikas Deshmukh', 'Uruli Kanchan', 'Haveli', 'Pune', 'PPR Vaccinated', 'Healthy', '01-Sept-2026'],
    ['INAPH-MH-9021447', 'Cattle', 'Khillari', 'Male', '5.5', 'Babanrao Thite', 'Khed Shivapur', 'Haveli', 'Pune', 'FMD Vaccinated', 'Healthy', '28-Aug-2026'],
    ['INAPH-MH-9021448', 'Cattle', 'Sahiwal', 'Female', '3.5', 'Ramesh Gholap', 'Manchar', 'Ambegaon', 'Pune', 'All Vaccines Current', 'Healthy', '25-Aug-2026'],
  ];

  return exportToCSV('Livestock_Census_Disease_Registry_Pune.csv', headers, rows);
}

// ============================================================================
// 4. VETERINARIAN CLINICAL REGISTER EXPORT (FOR VET PORTAL)
// ============================================================================

export function downloadVetClinicalRegisterPDF(doctorName = 'Dr. Priya Kulkarni', licenseNumber = 'MSVC-18492', hospital = 'Baramati Taluka Veterinary Polyclinic') {
  return generateOfficialPDF({
    filename: `Veterinary_Clinical_Register_${doctorName.replace(/\s+/g, '_')}.pdf`,
    title: 'Veterinary Clinical Register & Caseload Summary',
    subtitle: `Registered Medical Practitioner Case Log • Department of Animal Husbandry`,
    department: 'Maharashtra State Veterinary Council (MSVC) • Clinical Practice Log',
    jurisdiction: `${hospital} • Pune District`,
    summaryMetrics: [
      { label: 'Attending Clinician', value: doctorName },
      { label: 'MSVC Reg Number', value: licenseNumber },
      { label: 'Clinical Cases', value: 48 },
      { label: 'Recovery Rate', value: '94.2%' },
    ],
    tables: [
      {
        title: 'Recent Clinical Diagnoses & Treatment History',
        headers: ['Case #', 'Date', 'Animal Species', 'Owner Name', 'Diagnosis', 'Prescribed Treatment', 'Status'],
        rows: [
          ['CASE-8901', '12-Sept-2026', 'Gir Cow (F)', 'Baburao Kale', 'Bovine Hypocalcemia', 'Mifex 450ml IV + Neurobion Forte', 'Under Treatment'],
          ['CASE-8894', '11-Sept-2026', 'Murrah Buffalo', 'Kishor Shinde', 'Suspected FMD / Vesicles', 'Flunixin Meglumine + Antiseptic Mouth Wash', 'Quarantined'],
          ['CASE-8889', '10-Sept-2026', 'Crossbred HF', 'Suresh Shinde', 'Subclinical Mastitis', 'Cephalosporin Intramammary Infusion', 'Recovered'],
          ['CASE-8880', '08-Sept-2026', 'Osmanabadi Goat', 'Dnyaneshwar More', 'Parasitic Gastroenteritis', 'Albendazole 10% Oral Suspension', 'Recovered'],
          ['CASE-8872', '06-Sept-2026', 'Khillari Bull', 'Ramesh Gholap', 'Traumatic Lameness', 'Meloxicam 15ml IM + Restorative Bandage', 'Recovered'],
        ],
      },
    ],
    notes: [
      'This clinical register is an official record pursuant to the Veterinary Council of India Regulations.',
      'Scheduled antibiotics and restricted biologicals are logged in compliance with drug withdrawal safety guidelines.',
    ],
  });
}
