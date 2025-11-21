'use server';

/**
 * @fileOverview This file defines a Genkit flow to calculate the overall progress of a contract based on the completion status of its estimations.
 *
 * - calculateContractProgress - A function that calculates the contract progress.
 * - CalculateContractProgressInput - The input type for the calculateContractProgress function.
 * - CalculateContractProgressOutput - The return type for the calculateContractProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateContractProgressInputSchema = z.object({
  estimations: z.array(
    z.object({
      isCompleted: z.boolean().describe('Whether the estimation is completed or not.'),
    })
  ).describe('A list of estimations for the contract, each with a completion status.'),
});
export type CalculateContractProgressInput = z.infer<typeof CalculateContractProgressInputSchema>;

const CalculateContractProgressOutputSchema = z.object({
  progress: z.number().describe('The overall progress of the contract as a percentage (0-100).'),
  summary: z.string().describe('A short summary of the calculation.'),
  progressSummary: z.string().describe('A short, one-sentence summary of the progress calculation.'),
});
export type CalculateContractProgressOutput = z.infer<typeof CalculateContractProgressOutputSchema>;

export async function calculateContractProgress(input: CalculateContractProgressInput): Promise<CalculateContractProgressOutput> {
  return calculateContractProgressFlow(input);
}

const calculateContractProgressPrompt = ai.definePrompt({
  name: 'calculateContractProgressPrompt',
  input: {schema: CalculateContractProgressInputSchema},
  output: {schema: CalculateContractProgressOutputSchema},
  prompt: `You are an expert contract progress calculator.

  Given a list of estimations for a contract, where each estimation has a boolean field indicating whether it is completed, calculate the overall progress of the contract as a percentage.

  If there are no estimations, the progress is 0.

  Return a JSON object with the progress percentage and a short summary of the calculation.

  Estimations: {{{JSON.stringify estimations}}}
  `,
});

const calculateContractProgressFlow = ai.defineFlow(
  {
    name: 'calculateContractProgressFlow',
    inputSchema: CalculateContractProgressInputSchema,
    outputSchema: CalculateContractProgressOutputSchema,
  },
  async input => {
    const {estimations} = input;

    const totalEstimations = estimations.length;

    if (totalEstimations === 0) {
      return {
        progress: 0,
        summary: 'No estimations found, progress is 0.',
        progressSummary: 'No estimations are available for this contract.',
      };
    }

    const completedEstimations = estimations.filter(estimation => estimation.isCompleted).length;
    const progress = (completedEstimations / totalEstimations) * 100;

    return {
      progress,
      summary: `Calculated progress based on ${totalEstimations} estimations, with ${completedEstimations} completed.`, // Keep summary brief
      progressSummary: `The contract is ${progress.toFixed(2)}% complete based on estimations.`, // Added one-sentence summary here
    };
  }
);
