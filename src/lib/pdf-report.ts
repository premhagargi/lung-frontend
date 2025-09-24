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
  const doc = new jsPDF();

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const accentColor = [231, 76, 60]; // Red for warnings

  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('LUNGVISION MEDICAL CENTER', 105, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Advanced CT Scan Analysis Report', 105, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CT SCAN ANALYSIS REPORT', 105, yPosition, { align: 'center' });

  // Report metadata
  yPosition += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  doc.text(`Report Generated: ${currentDate} at ${currentTime}`, 20, yPosition);
  doc.text(`Report ID: ${data.reportId}`, 150, yPosition);

  // Patient Information Section
  yPosition += 20;
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PATIENT INFORMATION', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Patient Name: ${data.patient.name}`, 20, yPosition);
  doc.text(`Patient ID: ${data.patient.id}`, 120, yPosition);

  yPosition += 8;
  doc.text(`Age: ${data.patient.age} years`, 20, yPosition);
  doc.text(`Phone: ${data.patient.phone || 'N/A'}`, 120, yPosition);

  // Scan Information Section
  yPosition += 20;
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SCAN INFORMATION', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Scan Type: Lung CT Scan`, 20, yPosition);
  doc.text(`Date: ${data.scanDate}`, 120, yPosition);

  yPosition += 8;
  doc.text(`Scan Time: ${data.scanTime}`, 20, yPosition);
  doc.text(`Analyzed By: ${data.analyzedBy}`, 120, yPosition);

  // AI Analysis Results Section
  yPosition += 20;
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AI ANALYSIS RESULTS', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const primaryDiagnosis = data.scanResult.hasCancer ? 'Potential Cancer Detected' : 'Normal';
  doc.text(`Primary Diagnosis: ${primaryDiagnosis}`, 20, yPosition);
  doc.text(`Confidence Level: ${data.scanResult.accuracyPercentage.toFixed(1)}%`, 120, yPosition);

  yPosition += 10;
  doc.text('Detailed Analysis:', 20, yPosition);

  yPosition += 8;
  // Group predictions by type and calculate percentages
  const predictionCounts: { [key: string]: number } = {};
  data.scanResult.predictions.forEach(pred => {
    const label = pred.predictionLabel.split(' (')[0]; // Remove the code part
    predictionCounts[label] = (predictionCounts[label] || 0) + 1;
  });

  const totalPredictions = data.scanResult.predictions.length;
  Object.entries(predictionCounts)
    .sort(([,a], [,b]) => b - a) // Sort by count descending
    .forEach(([label, count]) => {
      const percentage = ((count / totalPredictions) * 100).toFixed(1);
      doc.text(`• ${label}: ${percentage}%`, 30, yPosition);
      yPosition += 6;
    });

  // Health Recommendations Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('HEALTH RECOMMENDATIONS', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  const recommendations = data.scanResult.hasCancer
    ? [
        'Consult with an oncologist immediately.',
        'Avoid smoking and exposure to pollutants.',
        'Undergo further diagnostic tests as advised.',
        'Follow prescribed treatment plan strictly.',
        'Maintain regular follow-up appointments.'
      ]
    : [
        'Maintain Healthy Lifestyle',
        'Continue with regular exercise, balanced diet, and adequate sleep to maintain good lung health.',
        'Regular Check-ups',
        'Schedule routine medical check-ups every 6-12 months to monitor your health status.',
        'Avoid Smoking',
        'Stay away from smoking and secondhand smoke to protect your respiratory system.'
      ];

  recommendations.forEach((rec, index) => {
    if (data.scanResult.hasCancer || index % 2 === 0) {
      yPosition += 8;
      if (data.scanResult.hasCancer) {
        doc.text(`${index + 1}. ${rec}`, 20, yPosition);
      } else {
        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${index % 2 === 0 ? Math.floor(index / 2) + 1 : ''}. ${rec}`, 20, yPosition);
        doc.setFontSize(11);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      }
    } else {
      doc.text(rec, 30, yPosition);
    }
  });

  // Disclaimer Section
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 20;
  doc.setFontSize(14);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('IMPORTANT DISCLAIMER', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const disclaimer = 'This AI-generated analysis is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment. The AI predictions are based on image analysis and may not be 100% accurate.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
  doc.text(splitDisclaimer, 20, yPosition);

  // Footer
  yPosition += 30;
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Lungvision Medical Center | Advanced AI Diagnostics | https://lungcare-ai.netlify.app/', 105, yPosition, { align: 'center' });

  // Save the PDF
  doc.save(`lung-scan-report-${data.patient.id}-${Date.now()}.pdf`);
}