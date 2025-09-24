'use server';

import { analyzeLungScanImage } from '@/ai/flows/analyze-lung-scan-image';
import { addScan } from '@/lib/data';
import type { Patient } from '@/lib/types';
import { z } from 'zod';

const actionSchema = z.object({
  scanImageUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: 'Image must be a data URI',
  }),
  patient: z.custom<Patient>(),
  doctorNotes: z.string().optional(),
});

type ActionInput = z.infer<typeof actionSchema>;
type ActionResult = { success: true; scanId: string } | { success: false; error: string };

export async function performScanAnalysis(input: ActionInput): Promise<ActionResult> {
  const validation = actionSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.message };
  }

  const { scanImageUri, patient, doctorNotes } = validation.data;

  try {
    const aiAnalysis = await analyzeLungScanImage({ scanImageUri });

    if (!aiAnalysis) {
        return { success: false, error: 'AI analysis returned no result.' };
    }

    const newScan = await addScan({
      patient_id: patient.id,
      doctor_id: patient.doctor_id,
      consultation_date: new Date().toISOString(),
      scan_image_url: '', // Not storing image data as requested
      ai_analysis: {
        has_cancer: aiAnalysis.hasCancer,
        accuracy_percentage: aiAnalysis.accuracyPercentage,
        confidence_level: aiAnalysis.confidenceLevel as 'Low' | 'Medium' | 'High',
        precautions: aiAnalysis.precautions,
        overcome_solutions: aiAnalysis.overcomeSolutions,
        predictions: aiAnalysis.predictions,
      },
      doctor_notes: doctorNotes || '',
      status: 'Analyzed',
    });

    return { success: true, scanId: newScan.id };
  } catch (error) {
    console.error('Error during scan analysis action:', error);
    let errorMessage = 'An unexpected error occurred during AI analysis.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
