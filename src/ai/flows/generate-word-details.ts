'use server';

/**
 * @fileOverview A flow that generates details for a given word using AI.
 *
 * - generateWordDetails - A function to get meaning, syllables, and accents for a word.
 * - WordDetailsInput - The input type for the generateWordDetails function.
 * - WordDetailsOutput - The return type for the generateWordDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WordDetailsInputSchema = z.object({
  word: z.string().describe('The word to get details for.'),
});

export type WordDetailsInput = z.infer<typeof WordDetailsInputSchema>;

const WordDetailsOutputSchema = z.object({
  meaning: z.string().describe('The primary definition of the word.'),
  syllables: z.array(z.string()).describe('The word broken down into its syllables.'),
  accent_uk: z.string().describe('The phonetic spelling for the UK accent (IPA).'),
  accent_us: z.string().describe('The phonetic spelling for the US accent (IPA).'),
});

export type WordDetailsOutput = z.infer<typeof WordDetailsOutputSchema>;

export async function generateWordDetails(input: WordDetailsInput): Promise<WordDetailsOutput> {
  return generateWordDetailsFlow(input);
}

const generateDetailsPrompt = ai.definePrompt({
  name: 'generateWordDetailsPrompt',
  input: {schema: WordDetailsInputSchema},
  output: {schema: WordDetailsOutputSchema},
  prompt: `You are a linguistic expert. For the word '{{word}}', provide its primary meaning, its breakdown into syllables, and its IPA phonetic spelling for both UK and US accents.

  Provide the output in a valid JSON format with the following keys: 'meaning', 'syllables', 'accent_uk', 'accent_us'.
  The syllables should be an array of strings.

  Example for the word "serendipity":
  {
    "meaning": "The occurrence and development of events by chance in a happy or beneficial way.",
    "syllables": ["ser", "en", "dip", "i", "ty"],
    "accent_uk": "/ˌser.ənˈdɪp.ə.ti/",
    "accent_us": "/ˌser.ənˈdɪp.ə.t̬i/"
  }`,
});

const generateWordDetailsFlow = ai.defineFlow(
  {
    name: 'generateWordDetailsFlow',
    inputSchema: WordDetailsInputSchema,
    outputSchema: WordDetailsOutputSchema,
  },
  async input => {
    const {output} = await generateDetailsPrompt(input);
    return output!;
  }
);
