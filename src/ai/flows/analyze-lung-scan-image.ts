'use server';
/**
 * @fileOverview Analyzes a lung scan image to detect potential cancer, provide an accuracy percentage, and suggest medical precautions and treatment options.
 *
 * - analyzeLungScanImage - A function that handles the lung scan image analysis process.
 * - AnalyzeLungScanImageInput - The input type for the analyzeLungScanImage function.
 * - AnalyzeLungScanImageOutput - The return type for the analyzeLungScanImage function.
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

const AnalyzeLungScanImageOutputSchema = z.object({
  hasCancer: z.boolean().describe('Whether cancer is detected in the lung scan image.'),
  accuracyPercentage: z
    .number()
    .describe('The accuracy percentage of the cancer detection.'),
  confidenceLevel: z.string().describe('The confidence level of the analysis.'),
  precautions: z.array(z.string()).describe('Medical precautions to consider.'),
  overcomeSolutions: z.array(z.string()).describe('Potential treatment options.'),
});
export type AnalyzeLungScanImageOutput = z.infer<typeof AnalyzeLungScanImageOutputSchema>;

export async function analyzeLungScanImage(
  input: AnalyzeLungScanImageInput
): Promise<AnalyzeLungScanImageOutput> {
  return analyzeLungScanImageFlow(input);
}

const analyzeLungScanImagePrompt = ai.definePrompt({
  name: 'analyzeLungScanImagePrompt',
  input: {schema: AnalyzeLungScanImageInputSchema},
  output: {schema: AnalyzeLungScanImageOutputSchema},
  prompt: `You are a medical AI assistant specializing in analyzing lung scan images for cancer detection.

  Analyze the provided lung scan image and provide the following information:

  - hasCancer: Whether cancer is detected in the lung scan image (true/false).
  - accuracyPercentage: The accuracy percentage of the cancer detection (0-100).
  - confidenceLevel: The confidence level of the analysis (low, medium, high).
  - precautions: Medical precautions to consider based on the analysis.
  - overcomeSolutions: Potential treatment options based on the analysis.

  Here is the lung scan image:
  {{media url=scanImageUri}}

Please provide the output in JSON format.
`,
});

const analyzeLungScanImageFlow = ai.defineFlow(
  {
    name: 'analyzeLungScanImageFlow',
    inputSchema: AnalyzeLungScanImageInputSchema,
    outputSchema: AnalyzeLungScanImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeLungScanImagePrompt(input);
    return output!;
  }
);
