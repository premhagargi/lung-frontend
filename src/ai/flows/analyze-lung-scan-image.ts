'use server';
/**
 * @fileOverview Analyzes a lung scan image to detect potential cancer by calling an external service.
 *
 * - analyzeLungScanImage - A function that handles the lung scan image analysis process.
 * - AnalyzeLungScanImageInput - The input type for the analyzeLungScanImage function.
 * - AnalyzeLungScanImageOutput - The return type for the analyzeLungscanImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLungScanImageInputSchema = z.object({
  scanImageUri: z
    .string()
    .describe(
      "A lung scan image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLungScanImageInput = z.infer<typeof AnalyzeLungScanImageInputSchema>;

const ModelPredictionSchema = z.object({
  model: z.string(),
  prediction: z.string(),
  confidence: z.string(),
});

const AnalyzeLungScanImageOutputSchema = z.object({
  predictions: z.array(ModelPredictionSchema),
  hasCancer: z.boolean(),
  accuracyPercentage: z.number(),
  confidenceLevel: z.string(),
  precautions: z.array(z.string()),
  overcomeSolutions: z.array(z.string()),
});
export type AnalyzeLungScanImageOutput = z.infer<typeof AnalyzeLungScanImageOutputSchema>;

// Helper function to convert data URI to Blob
function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

export async function analyzeLungScanImage(
  input: AnalyzeLungScanImageInput
): Promise<AnalyzeLungScanImageOutput> {
  return analyzeLungScanImageFlow(input);
}

const analyzeLungScanImageFlow = ai.defineFlow(
  {
    name: 'analyzeLungScanImageFlow',
    inputSchema: AnalyzeLungScanImageInputSchema,
    outputSchema: AnalyzeLungScanImageOutputSchema,
  },
  async ({ scanImageUri }) => {

    const imageBlob = dataURItoBlob(scanImageUri);
    const formData = new FormData();
    formData.append('file', imageBlob, 'scan.png');

    const models = ['cnn', 'nb', 'resnet'];
    const predictions: { model: string; prediction: string; confidence: number }[] = [];

    for (const model of models) {
      try {
        const response = await fetch(`http://localhost:5000/predict/${model}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API call failed for ${model} with status: ${response.status}`);
        }

        const data = await response.json();
        predictions.push({
          model: model.toUpperCase(),
          prediction: data.prediction,
          confidence: parseFloat(data.confidence),
        });
      } catch (error) {
        console.error(`Error calling ${model}:`, error);
        // Skip this model or handle error
      }
    }

    if (predictions.length === 0) {
      throw new Error('All model predictions failed');
    }

    const highestConfidencePrediction = predictions.reduce((max, p) => p.confidence > max.confidence ? p : max, predictions[0]);
    const hasCancer = predictions.some(p => p.prediction.toLowerCase().includes('carcinoma'));

    // Mocking precautions and solutions as the new API doesn't provide them.
    const precautions = hasCancer
      ? ['Consult with an oncologist immediately.', 'Avoid smoking and exposure to pollutants.', 'Undergo further diagnostic tests as advised.']
      : ['Maintain a healthy lifestyle.', 'Continue with regular check-ups.'];
    const overcomeSolutions = hasCancer
      ? ['Biopsy for confirmation.', 'Chemotherapy or Radiation therapy might be options.', 'Surgical removal could be considered.']
      : ['No immediate treatment required.'];

    return {
      predictions: predictions.map(p => ({
        model: p.model,
        prediction: p.prediction,
        confidence: p.confidence.toString(),
      })),
      hasCancer,
      accuracyPercentage: Math.round(highestConfidencePrediction.confidence),
      confidenceLevel: highestConfidencePrediction.confidence > 80 ? 'High' : highestConfidencePrediction.confidence > 60 ? 'Medium' : 'Low',
      precautions,
      overcomeSolutions,
    };
  }
);
