'use server';
/**
 * @fileOverview An AI flow to check if a user's sentence correctly uses a given word.
 *
 * - checkSentence - A function that handles the sentence analysis.
 * - SentenceCheckerInput - The input type for the checkSentence function.
 * - SentenceCheckerOutput - The return type for the checkSentence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SentenceCheckerInputSchema = z.object({
  word: z.string().describe('The vocabulary word that should be used.'),
  sentence: z.string().describe("The user's sentence that attempts to use the word."),
});
export type SentenceCheckerInput = z.infer<typeof SentenceCheckerInputSchema>;

export const SentenceCheckerOutputSchema = z.object({
  is_correct: z.boolean().describe('Whether the sentence is grammatically correct and uses the word appropriately.'),
  feedback: z
    .string()
    .describe('A detailed explanation of why the sentence is correct or incorrect. Provide suggestions for improvement if needed.'),
  corrected_sentence: z
    .string()
    .optional()
    .describe('If the sentence is incorrect, provide a corrected version.'),
});
export type SentenceCheckerOutput = z.infer<typeof SentenceCheckerOutputSchema>;

export async function checkSentence(input: SentenceCheckerInput): Promise<SentenceCheckerOutput> {
  return checkSentenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentenceCheckerPrompt',
  input: {schema: SentenceCheckerInputSchema},
  output: {schema: SentenceCheckerOutputSchema},
  prompt: `You are an English language expert. Analyze the user's sentence and determine if it's grammatically correct and uses the provided vocabulary word correctly.

Word: {{{word}}}
User's Sentence: "{{{sentence}}}"

Your tasks:
1.  Check for grammatical errors.
2.  Verify that the word '{{word}}' is used in a contextually and semantically correct way.
3.  Set 'is_correct' to true if the sentence is perfect, otherwise set it to false.
4s.  Provide clear, constructive feedback. If the sentence is correct, praise the user. If it's incorrect, explain the mistake (grammatical or contextual) and suggest how to fix it.
5.  If the sentence is incorrect, provide a corrected version in 'corrected_sentence'.
`,
});

const checkSentenceFlow = ai.defineFlow(
  {
    name: 'checkSentenceFlow',
    inputSchema: SentenceCheckerInputSchema,
    outputSchema: SentenceCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
