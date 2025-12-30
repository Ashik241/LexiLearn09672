'use server';

/**
 * @fileOverview A flow that generates details for a given word using AI.
 *
 * - generateWordDetails - A function to get meaning, syllables, accents, and example sentences for a word.
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
  meaning: z.string().describe('The primary definition of the word in Bengali (বাংলা).'),
  parts_of_speech: z.string().describe('The part of speech of the word (e.g., Noun, Verb, Adjective).'),
  synonyms: z.array(z.string()).describe('A list of synonyms for the word.'),
  antonyms: z.array(z.string()).describe('A list of antonyms for the word.'),
  syllables: z.array(z.string()).describe('The word broken down into its syllables.'),
  accent_uk: z.string().describe('The phonetic spelling for the UK accent (IPA).'),
  accent_us: z.string().describe('The phonetic spelling for the US accent (IPA).'),
  example_sentences: z
    .array(z.string())
    .describe('Two or three example sentences using the word.'),
});

export type WordDetailsOutput = z.infer<typeof WordDetailsOutputSchema>;

export async function generateWordDetails(input: WordDetailsInput): Promise<WordDetailsOutput> {
  return generateWordDetailsFlow(input);
}

const generateDetailsPrompt = ai.definePrompt({
  name: 'generateWordDetailsPrompt',
  input: {schema: WordDetailsInputSchema},
  output: {schema: WordDetailsOutputSchema},
  prompt: `You are a linguistic expert. For the English word '{{word}}', provide the following in a valid JSON format:
  1.  'meaning': Its primary meaning, explained in simple Bengali (বাংলা).
  2.  'parts_of_speech': The grammatical part of speech of the word (e.g., Noun, Verb, Adjective).
  3.  'synonyms': A list of 2-3 common synonyms.
  4.  'antonyms': A list of 2-3 common antonyms.
  5.  'syllables': The word broken down into its syllables as an array of strings.
  6.  'accent_uk': Its IPA phonetic spelling for the UK accent.
  7.  'accent_us': Its IPA phonetic spelling for the US accent.
  8.  'example_sentences': Two or three example sentences that clearly demonstrate the word's usage.

  Example for the word "serendipity":
  {
    "meaning": "কোনো কিছু অপ্রত্যাশিতভাবে খুঁজে পাওয়ার সৌভাগ্য, যা আনন্দদায়ক বা উপকারী।",
    "parts_of_speech": "Noun",
    "synonyms": ["chance", "fluke", "happy accident"],
    "antonyms": ["misfortune", "bad luck"],
    "syllables": ["ser", "en", "dip", "i", "ty"],
    "accent_uk": "/ˌser.ənˈdɪp.ə.ti/",
    "accent_us": "/ˌser.ənˈdɪp.ə.t̬i/",
    "example_sentences": [
      "Finding a twenty-dollar bill in my old coat was a moment of serendipity.",
      "Their meeting was pure serendipity, happening by chance at a crowded station.",
      "The discovery of penicillin is a famous example of serendipity in science."
    ]
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
