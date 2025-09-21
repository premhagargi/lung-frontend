'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating medical recommendations based on lung scan analysis.
 *
 * The flow takes lung scan data as input and returns suggested medical precautions and potential treatment options.
 * @file
 * - generateMedicalRecommendations - A function that handles the generation of medical recommendations.
 * - GenerateMedicalRecommendationsInput - The input type for the generateMedicalRecommendations function.
 * - GenerateMedicalRecommendationsOutput - The return type for the generateMedicalRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMedicalRecommendationsInputSchema = z.object({
  scanReport: z
    .string()
    .describe(
      'A detailed report of the lung scan analysis, including findings and observations.'
    ),
});
export type GenerateMedicalRecommendationsInput = z.infer<
  typeof GenerateMedicalRecommendationsInputSchema
>;

const GenerateMedicalRecommendationsOutputSchema = z.object({
  precautions: z
    .array(z.string())
    .describe('A list of medical precautions based on the scan analysis.'),
  treatmentOptions: z
    .array(z.string())
    .describe('A list of potential treatment options based on the scan analysis.'),
});
export type GenerateMedicalRecommendationsOutput = z.infer<
  typeof GenerateMedicalRecommendationsOutputSchema
>;

export async function generateMedicalRecommendations(
  input: GenerateMedicalRecommendationsInput
): Promise<GenerateMedicalRecommendationsOutput> {
  return generateMedicalRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMedicalRecommendationsPrompt',
  input: {schema: GenerateMedicalRecommendationsInputSchema},
  output: {schema: GenerateMedicalRecommendationsOutputSchema},
  prompt: `You are an AI assistant specialized in providing medical recommendations based on lung scan analysis reports.

  Based on the following lung scan report, suggest relevant medical precautions and potential treatment options.
  Report: {{{scanReport}}}

  Provide the precautions and treatment options as a JSON object.
  `,
});

const generateMedicalRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateMedicalRecommendationsFlow',
    inputSchema: GenerateMedicalRecommendationsInputSchema,
    outputSchema: GenerateMedicalRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
