export type DoctorSpecialty = 'Pulmonologist' | 'Oncologist' | 'Radiologist' | 'General Practitioner';

export interface Doctor {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  hospital: string;
  license_number: string;
  phone: string;
  is_profile_complete: boolean;
  avatar: string;
  created_at?: string;
  last_activity?: string;
}

export type PatientGender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  name: string;
  registration_id: string;
  age: number;
  gender: PatientGender;
  phone: string;
  medical_history: string;
  doctor_id: string;
  avatar: string;
  created_at?: string;
}

export type ScanStatus = 'Pending' | 'Analyzed' | 'Reviewed';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type ModelPrediction = {
  model: string;
  prediction: string;
  confidence: string;
};

export interface LungScan {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_date: string; // ISO date string
  scan_image_url: string;
  ai_analysis: {
    has_cancer: boolean;
    accuracy_percentage: number;
    confidence_level: ConfidenceLevel;
    precautions: string[];
    overcome_solutions: string[];
    predictions?: ModelPrediction[];
  };
  doctor_notes: string;
  status: ScanStatus;
}
