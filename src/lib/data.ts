import type { Doctor, Patient, LungScan } from './types';
import { placeholderImages } from './placeholder-images.json';

// In-memory store
let doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    specialty: 'Pulmonologist',
    hospital: 'Unity Health Toronto',
    license_number: 'A-12345',
    phone: '555-0101',
    is_profile_complete: true,
    avatar: placeholderImages.find(p => p.id === 'doctor-1')?.imageUrl || '',
  },
];

let patients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    registration_id: 'P001',
    age: 68,
    gender: 'Male',
    phone: '555-0102',
    medical_history: 'Former smoker, diagnosed with COPD in 2020.',
    doctor_id: '1',
    avatar: placeholderImages.find(p => p.id === 'patient-1')?.imageUrl || '',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    registration_id: 'P002',
    age: 72,
    gender: 'Female',
    phone: '555-0103',
    medical_history: 'No significant respiratory issues. Annual check-up.',
    doctor_id: '1',
    avatar: placeholderImages.find(p => p.id === 'patient-2')?.imageUrl || '',
  },
  {
    id: '3',
    name: 'David Chen',
    registration_id: 'P003',
    age: 55,
    gender: 'Male',
    phone: '555-0104',
    medical_history: 'Works in a high-dust environment. Complains of persistent cough.',
    doctor_id: '1',
    avatar: placeholderImages.find(p => p.id === 'patient-3')?.imageUrl || '',
  },
];

let scans: LungScan[] = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: '1',
    consultation_date: '2024-07-15T10:30:00Z',
    scan_image_url: placeholderImages.find(p => p.id === 'scan-1')?.imageUrl || '',
    ai_analysis: {
      has_cancer: true,
      accuracy_percentage: 88,
      confidence_level: 'High',
      precautions: ['Avoid smoking and secondhand smoke.', 'Follow a healthy diet and exercise regularly.'],
      overcome_solutions: ['Biopsy to confirm diagnosis.', 'Consult with an oncologist for treatment plan.'],
    },
    doctor_notes: 'Suspicious nodule found in the upper left lobe. AI analysis confirms high probability of malignancy. Recommended follow-up with biopsy.',
    status: 'Reviewed',
  },
  {
    id: '2',
    patient_id: '2',
    doctor_id: '1',
    consultation_date: '2024-07-12T14:00:00Z',
    scan_image_url: placeholderImages.find(p => p.id === 'scan-2')?.imageUrl || '',
    ai_analysis: {
      has_cancer: false,
      accuracy_percentage: 95,
      confidence_level: 'High',
      precautions: ['Continue annual check-ups.', 'Maintain a healthy lifestyle.'],
      overcome_solutions: ['No immediate action required.'],
    },
    doctor_notes: 'Scan is clear. No signs of any abnormalities. AI analysis aligns with manual review.',
    status: 'Reviewed',
  },
];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API Functions ---

export async function getDoctor(id: string): Promise<Doctor> {
  await delay(200);
  const doctor = doctors.find(d => d.id === id);
  if (!doctor) throw new Error('Doctor not found');
  return doctor;
}

export async function updateDoctorProfile(id: string, data: Partial<Omit<Doctor, 'id'>>): Promise<Doctor> {
  await delay(500);
  let doctor = doctors.find(d => d.id === id);
  if (!doctor) throw new Error('Doctor not found');
  
  doctor = { ...doctor, ...data, is_profile_complete: true };
  doctors = doctors.map(d => d.id === id ? doctor : d);

  return doctor;
}

export async function getPatients(doctorId: string): Promise<Patient[]> {
  await delay(300);
  return patients.filter(p => p.doctor_id === doctorId);
}

export async function getPatient(id: string): Promise<Patient> {
    await delay(200);
    const patient = patients.find(p => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return patient;
}

export async function addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    await delay(500);
    const newPatient: Patient = {
        ...patientData,
        id: (patients.length + 1).toString(),
        avatar: placeholderImages.find(p => p.id === `patient-${patients.length + 1}`)?.imageUrl || '',
    };
    patients.push(newPatient);
    return newPatient;
}

export async function getScansForPatient(patientId: string): Promise<LungScan[]> {
  await delay(400);
  return scans
    .filter(s => s.patient_id === patientId)
    .sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime());
}

export async function getRecentScans(doctorId: string, limit: number): Promise<LungScan[]> {
    await delay(500);
    return scans
      .filter(s => s.doctor_id === doctorId)
      .sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime())
      .slice(0, limit);
}

export async function addScan(scanData: Omit<LungScan, 'id'>): Promise<LungScan> {
    await delay(1000);
    const newScan: LungScan = {
        ...scanData,
        id: (scans.length + 1).toString(),
    };
    scans.unshift(newScan); // Add to the beginning to appear as recent
    return newScan;
}
