'use server';

/**
 * @fileOverview Automatically adjusts the difficulty level of words based on user performance.
 *
 * - adjustDifficulty - A function to categorize words into Easy, Medium, and Hard based on user responses.
 * - AdjustDifficultyInput - The input type for the adjustDifficulty function.
 * - AdjustDifficultyOutput - The return type for the adjustDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDifficultyInputSchema = z.object({
  word: z.string().describe('The word that the user was tested on.'),
  userAnswer: z.string().describe('The user\u0027s answer to the test.'),
  correctAnswer: z.string().describe('The correct answer to the test.'),
  currentDifficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The current difficulty level of the word.'),
  isMCQ: z.boolean().describe('Whether the question was a multiple choice question.'),
  translationLanguage: z.string().optional().describe('Target translation language if the test question was a translation'),
});
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;

const AdjustDifficultyOutputSchema = z.object({
  newDifficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The new difficulty level of the word based on user performance.'),
  reason: z.string().describe('Explanation for the difficulty adjustment.'),
});
export type AdjustDifficultyOutput = z.infer<typeof AdjustDifficultyOutputSchema>;

export async function adjustDifficulty(input: AdjustDifficultyInput): Promise<AdjustDifficultyOutput> {
  return adjustDifficultyFlow(input);
}

const adjustDifficultyPrompt = ai.definePrompt({
  name: 'adjustDifficultyPrompt',
  input: {schema: AdjustDifficultyInputSchema},
  output: {schema: AdjustDifficultyOutputSchema},
  prompt: `You are an AI that categorizes the difficulty of a vocabulary word for a user based on their performance.

  Here are the details of the user\'s performance:
  - Word: {{{word}}}
  - User\'s Answer: {{{userAnswer}}}
  - Correct Answer: {{{correctAnswer}}}
  - Current Difficulty: {{{currentDifficulty}}}
  - Multiple Choice Question: {{{isMCQ}}}
  {{#if translationLanguage}}
  - Translation Language: {{{translationLanguage}}}
  {{/if}}

  Analyze the user\'s performance and determine the new difficulty level for the word. Consider these factors:
    - If the user answered incorrectly, move the word to a higher difficulty level (e.g., Easy -> Medium, Medium -> Hard). Prioritize moving to \"Hard\" if the answer was very wrong.
    - If the user answered correctly, but the current difficulty is Hard, move the word to Medium.
    - If the user answered correctly and the current difficulty is Medium, move the word to Easy.
    - If the user answered correctly and the current difficulty is Easy, keep the word at Easy.
    - If the question was a multiple choice question, and the user was incorrect, the word should be moved to \"Hard\".

  Provide a brief reason for the adjustment. Focus on if the answer was incorrect or correct, and the prior difficulty.

  New Difficulty (Easy, Medium, or Hard):`,
});

const adjustDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyFlow',
    inputSchema: AdjustDifficultyInputSchema,
    outputSchema: AdjustDifficultyOutputSchema,
  },
  async input => {
    const {output} = await adjustDifficultyPrompt(input);
    return output!;
  }
);
