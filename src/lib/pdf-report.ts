import jsPDF from 'jspdf';
import type { Patient, LungScan } from './types';

interface PDFReportData {
  patient: Patient;
  scanResult: {
    predictions: Array<{
      model: string;
      prediction: string;
      predictionLabel: string;
      confidence: string;
    }>;
    hasCancer: boolean;
    accuracyPercentage: number;
    confidenceLevel: string;
    precautions: string[];
    overcomeSolutions: string[];
  };
  scanDate: string;
  scanTime: string;
  analyzedBy: string;
  reportId: string;
}

export function generateScanReportPDF(data: PDFReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const primaryColor = [22, 74, 133]; // Professional Blue
  const secondaryColor = [44, 62, 80]; // Dark Slate
  const accentColor = [192, 57, 43]; // Subtle Red
  const borderColor = [200, 200, 200]; // Light Gray

  let yPosition = 15;

  // Page Border
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277); // A4 size border with 10mm margin

  // Header Section
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(10, 10, 190, 20, 'F'); // Header background
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('LUNGVISION MEDICAL CENTER', 105, 22, { align: 'center' });

  // Logo Placeholder (Text-based for no external dependencies)
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text('[Logo]', 15, 15);

  // Subtitle
  yPosition = 35;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Advanced CT Scan Analysis Report', 105, yPosition, { align: 'center' });

  // Report Title
  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CT SCAN ANALYSIS REPORT', 105, yPosition, { align: 'center' });

  // Divider Line
  yPosition += 10;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.line(20, yPosition, 190, yPosition);

  // Report Metadata
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  doc.text(`Report Generated: ${currentDate} at ${currentTime}`, 15, yPosition);
  doc.text(`Report ID: ${data.reportId}`, 150, yPosition);

  // Patient Information Section
  yPosition += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PATIENT INFORMATION', 15, yPosition);

  yPosition += 5;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.2);
  doc.line(15, yPosition, 195, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Name: ${data.patient.name}`, 15, yPosition);
  doc.text(`Patient ID: ${data.patient.id}`, 105, yPosition);

  yPosition += 8;
  doc.text(`Age: ${data.patient.age} years`, 15, yPosition);
  doc.text(`Phone: ${data.patient.phone || 'N/A'}`, 105, yPosition);

  // Scan Information Section
  yPosition += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SCAN INFORMATION', 15, yPosition);

  yPosition += 5;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, yPosition, 195, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Scan Type: Lung CT Scan`, 15, yPosition);
  doc.text(`Date: ${data.scanDate}`, 105, yPosition);

  yPosition += 8;
  doc.text(`Time: ${data.scanTime}`, 15, yPosition);
  doc.text(`Analyzed By: ${data.analyzedBy}`, 105, yPosition);

  // AI Analysis Results Section
  yPosition += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AI ANALYSIS RESULTS', 15, yPosition);

  yPosition += 5;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, yPosition, 195, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const primaryDiagnosis = data.scanResult.hasCancer ? 'Potential Cancer Detected' : 'No Cancer Detected';
  doc.text(`Primary Diagnosis: ${primaryDiagnosis}`, 15, yPosition);
  doc.text(`Confidence: ${data.scanResult.accuracyPercentage.toFixed(1)}%`, 105, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Detailed Analysis:', 15, yPosition);

  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  const predictionCounts: { [key: string]: number } = {};
  data.scanResult.predictions.forEach(pred => {
    const label = pred.predictionLabel.split(' (')[0];
    predictionCounts[label] = (predictionCounts[label] || 0) + 1;
  });

  const totalPredictions = data.scanResult.predictions.length;
  Object.entries(predictionCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([label, count]) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 15;
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(10, 10, 190, 277);
      }
      const percentage = ((count / totalPredictions) * 100).toFixed(1);
      doc.text(`• ${label}: ${percentage}%`, 20, yPosition);
      yPosition += 6;
    });

  // Health Recommendations Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 15;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.rect(10, 10, 190, 277);
  }

  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('HEALTH RECOMMENDATIONS', 15, yPosition);

  yPosition += 5;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, yPosition, 195, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  const recommendations = data.scanResult.hasCancer
    ? [
        'Consult an oncologist immediately for further evaluation.',
        'Avoid smoking and exposure to environmental pollutants.',
        'Follow through with recommended diagnostic tests.',
        'Adhere strictly to the prescribed treatment plan.',
        'Schedule regular follow-up appointments.'
      ]
    : [
        'Maintain a healthy lifestyle with regular exercise and balanced diet.',
        'Schedule routine medical check-ups every 6-12 months.',
        'Avoid smoking and secondhand smoke exposure.',
        'Stay hydrated and ensure adequate sleep for optimal health.'
      ];

  recommendations.forEach((rec, index) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 15;
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.rect(10, 10, 190, 277);
    }
    doc.text(`${index + 1}. ${rec}`, 15, yPosition);
    yPosition += 8;
  });

  // Disclaimer Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 15;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.rect(10, 10, 190, 277);
  }

  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('IMPORTANT NOTICE', 15, yPosition);

  yPosition += 5;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, yPosition, 195, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const disclaimer = 'This AI-generated report is for informational purposes only and does not constitute professional medical advice. Consult a qualified healthcare provider for accurate diagnosis and treatment. AI predictions are based on image analysis and may not be fully accurate.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, 180);
  doc.text(splitDisclaimer, 15, yPosition);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Lungvision Medical Center | Advanced AI Diagnostics | https://lungcare-ai.netlify.app', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
  }

  // Save the PDF
  doc.save(`lung-scan-report-${data.patient.id}-${Date.now()}.pdf`);
}