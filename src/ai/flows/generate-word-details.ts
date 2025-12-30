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
import type { SynonymAntonym } from '@/types';

const WordDetailsInputSchema = z.object({
  word: z.string().describe('The word to get details for.'),
});

export type WordDetailsInput = z.infer<typeof WordDetailsInputSchema>;

const VerbFormsSchema = z.object({
  present: z.string().describe('The present form of the verb (e.g., go).'),
  past: z.string().describe('The past form of the verb (e.g., went).'),
  past_participle: z.string().describe('The past participle form of the verb (e.g., gone).'),
  present_pronunciation: z.string().describe('The IPA phonetic spelling for the present form.'),
  past_pronunciation: z.string().describe('The IPA phonetic spelling for the past form.'),
  past_participle_pronunciation: z.string().describe('The IPA phonetic spelling for the past participle form.'),
  form_examples: z.object({
      present: z.string().describe('An example sentence using the present form.'),
      past: z.string().describe('An example sentence using the past form.'),
      past_participle: z.string().describe('An example sentence using the past participle form.'),
  }).describe('Example sentences for each verb form.')
});

const SynonymAntonymSchema = z.object({
    word: z.string().describe('The synonym or antonym word.'),
    meaning: z.string().describe('The Bengali meaning of the word.'),
});

const WordDetailsOutputSchema = z.object({
  meaning: z.string().describe('The primary definition of the word in Bengali (বাংলা).'),
  parts_of_speech: z.string().describe('The part of speech of the word (e.g., Noun, Verb, Adjective).'),
  synonyms: z.array(SynonymAntonymSchema).optional().describe("A list of synonym objects, each with a 'word' and its Bengali 'meaning'. Provide only if it is NOT a verb."),
  antonyms: z.array(SynonymAntonymSchema).optional().describe("A list of antonym objects, each with a 'word' and its Bengali 'meaning'. Provide only if it is NOT a verb."),
  syllables: z.array(z.string()).describe('The word broken down into its syllables.'),
  example_sentences: z
    .array(z.string())
    .describe('Two or three example sentences using the word.'),
  verb_forms: VerbFormsSchema.optional().describe('The three forms of the verb, their pronunciations, and examples. Provide only if the word is a verb.'),
});

export type WordDetailsOutput = z.infer<typeof WordDetailsOutputSchema>;

export async function generateWordDetails(input: WordDetailsInput): Promise<WordDetailsOutput> {
  return generateWordDetailsFlow(input);
}

const generateDetailsPrompt = ai.definePrompt({
  name: 'generateWordDetailsPrompt',
  input: {schema: WordDetailsInputSchema},
  output: {schema: WordDetailsOutputSchema},
  prompt: `You are a linguistic expert. For the English word '{{word}}', provide a detailed analysis in valid JSON format.

  First, identify the primary part of speech for the word.

  Your JSON output must include:
  1.  'meaning': Its primary meaning, explained in simple Bengali (বাংলা).
  2.  'parts_of_speech': The grammatical part of speech (e.g., Noun, Verb, Adjective, Preposition).
  3.  'syllables': The word broken down into its syllables as an array of strings.
  4.  'example_sentences': Two or three general example sentences.

  Conditional fields based on part of speech:
  - If the 'parts_of_speech' is 'Verb':
    - Include a 'verb_forms' object containing:
      - 'present', 'past', and 'past_participle' forms.
      - 'present_pronunciation', 'past_pronunciation', 'past_participle_pronunciation' (IPA).
      - 'form_examples': an object with example sentences for 'present', 'past', and 'past_participle' forms.
    - DO NOT include 'synonyms' or 'antonyms' for verbs.

  - If the 'parts_of_speech' is NOT a 'Verb' (e.g., Noun, Adjective):
    - Include 'synonyms': A list of 2-3 objects, each containing a common synonym 'word' and its Bengali 'meaning'.
    - Include 'antonyms': A list of 2-3 objects, each containing a common antonym 'word' and its Bengali 'meaning'.
    - DO NOT include the 'verb_forms' object.

  Example for a Noun "serendipity":
  {
    "meaning": "কোনো কিছু অপ্রত্যাশিতভাবে খুঁজে পাওয়ার সৌভাগ্য, যা আনন্দদায়ক বা উপকারী।",
    "parts_of_speech": "Noun",
    "synonyms": [
      {"word": "chance", "meaning": "সুযোগ"},
      {"word": "fluke", "meaning": "আকস্মিক সৌভাগ্য"},
      {"word": "happy accident", "meaning": "আনন্দের দুর্ঘটনা"}
    ],
    "antonyms": [
      {"word": "misfortune", "meaning": "দুর্ভাগ্য"},
      {"word": "bad luck", "meaning": "খারাপ ভাগ্য"}
    ],
    "syllables": ["ser", "en", "dip", "i", "ty"],
    "example_sentences": [
      "Finding a twenty-dollar bill in my old coat was a moment of serendipity.",
      "Their meeting was pure serendipity, happening by chance at a crowded station."
    ]
  }

  Example for a Verb "eat":
  {
    "meaning": "খাবার গ্রহণ করা বা খাওয়া।",
    "parts_of_speech": "Verb",
    "syllables": ["eat"],
    "example_sentences": [
      "I need to eat something before I leave.",
      "We usually eat dinner at 7 PM."
    ],
    "verb_forms": {
      "present": "eat",
      "past": "ate",
      "past_participle": "eaten",
      "present_pronunciation": "/iːt/",
      "past_pronunciation": "/eɪt/",
      "past_participle_pronunciation": "/ˈiː.tən/",
      "form_examples": {
        "present": "Birds eat seeds and insects.",
        "past": "I ate a large pizza yesterday.",
        "past_participle": "Have you eaten breakfast yet?"
      }
    }
  }`,
});

const generateDetailsFlow = ai.defineFlow(
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
