import type { Doctor, Patient, LungScan } from './types';
import { placeholderImages } from './placeholder-images.json';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API Functions ---

export async function getDoctor(id: string): Promise<Doctor> {
  await delay(200);
  const doctorRef = doc(db, 'doctors', id);
  const doctorSnap = await getDoc(doctorRef);

  if (!doctorSnap.exists()) {
    throw new Error('Doctor not found');
  }

  return { id: doctorSnap.id, ...doctorSnap.data() } as Doctor;
}

export async function updateDoctorProfile(id: string, data: Partial<Omit<Doctor, 'id'>>): Promise<Doctor> {
  await delay(500);
  const doctorRef = doc(db, 'doctors', id);
  const doctorSnap = await getDoc(doctorRef);

  if (!doctorSnap.exists()) {
    throw new Error('Doctor not found');
  }

  const updatedData = { ...doctorSnap.data(), ...data, is_profile_complete: true };
  await updateDoc(doctorRef, updatedData);

  return updatedData as Doctor;
}

export async function updateDoctorActivity(doctorId: string): Promise<void> {
  await delay(200);
  const doctorRef = doc(db, 'doctors', doctorId);
  await updateDoc(doctorRef, {
    last_activity: new Date().toISOString()
  });
}

export async function getPatients(doctorId: string): Promise<Patient[]> {
  await delay(300);
  const patientsRef = collection(db, 'patients');
  const q = query(patientsRef, where('doctor_id', '==', doctorId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
}

export async function getPatient(id: string): Promise<Patient> {
    await delay(200);
    const patientRef = doc(db, 'patients', id);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) {
      throw new Error('Patient not found');
    }

    return { id: patientSnap.id, ...patientSnap.data() } as Patient;
}

export async function addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    await delay(500);
    const patientsRef = collection(db, 'patients');
    const patientWithTimestamp = {
      ...patientData,
      created_at: new Date().toISOString(),
    };
    const docRef = await addDoc(patientsRef, patientWithTimestamp);

    // Update doctor's last activity
    await updateDoctorActivity(patientData.doctor_id);

    return { id: docRef.id, ...patientWithTimestamp } as Patient;
}

export async function getScansForPatient(patientId: string): Promise<LungScan[]> {
  await delay(400);
  const scansRef = collection(db, 'scans');
  const q = query(scansRef, where('patient_id', '==', patientId));
  const querySnapshot = await getDocs(q);

  // Sort in memory since composite index is required
  const scans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LungScan));
  return scans.sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime());
}

export async function getRecentScans(doctorId: string, limitCount: number): Promise<LungScan[]> {
    await delay(500);
    const scansRef = collection(db, 'scans');
    const q = query(scansRef, where('doctor_id', '==', doctorId));
    const querySnapshot = await getDocs(q);

    // Sort and limit in memory since composite index is required
    const scans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LungScan));
    return scans
      .sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime())
      .slice(0, limitCount);
}

export async function getAllScansForDoctor(doctorId: string): Promise<LungScan[]> {
    await delay(500);
    const scansRef = collection(db, 'scans');
    const q = query(scansRef, where('doctor_id', '==', doctorId));
    const querySnapshot = await getDocs(q);

    // Sort in memory since composite index is required for orderBy + where
    const scans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LungScan));
    return scans.sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime());
}

export async function addScan(scanData: Omit<LungScan, 'id'>): Promise<LungScan> {
    await delay(1000);
    const scansRef = collection(db, 'scans');
    const docRef = await addDoc(scansRef, scanData);

    // Update doctor's last activity
    await updateDoctorActivity(scanData.doctor_id);

    return { id: docRef.id, ...scanData } as LungScan;
}

export async function createDoctor(uid: string, name: string, email: string): Promise<Doctor> {
  await delay(500);
  const now = new Date().toISOString();
  const doctorData: Omit<Doctor, 'id'> = {
    name,
    specialty: 'General Practitioner',
    hospital: '',
    license_number: '',
    phone: '',
    is_profile_complete: false,
    avatar: placeholderImages.find(p => p.id === 'doctor-1')?.imageUrl || '',
    created_at: now,
    last_activity: now,
  };

  await setDoc(doc(db, 'doctors', uid), doctorData);
  return { id: uid, ...doctorData };
}
