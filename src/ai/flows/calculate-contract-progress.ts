
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
});
export type CalculateContractProgressOutput = z.infer<typeof CalculateContractProgressOutputSchema>;

export async function calculateContractProgress(input: CalculateContractProgressInput): Promise<CalculateContractProgressOutput> {
  return calculateContractProgressFlow(input);
}

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
      };
    }

    const completedEstimations = estimations.filter(estimation => estimation.isCompleted).length;
    const progress = (completedEstimations / totalEstimations) * 100;

    return {
      progress,
    };
  }
);
