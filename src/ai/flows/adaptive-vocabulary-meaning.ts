'use server';

/**
 * @fileOverview A flow that generates multiple-choice questions for vocabulary learning.
 *
 * - generateMeaningQuiz - A function to generate a multiple-choice quiz for a given word and target language.
 * - MeaningQuizInput - The input type for the generateMeaningQuiz function.
 * - MeaningQuizOutput - The return type for the generateMeaningQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeaningQuizInputSchema = z.object({
  word: z.string().describe('The word to generate a quiz for.'),
  targetLanguage: z.string().describe('The target language for the quiz (e.g., Sylheti).'),
  optionsCount: z.number().int().min(2).max(5).default(4).describe('The number of multiple-choice options to generate.'),
  knownMeanings: z.array(z.string()).describe('Known meanings of the word in the target language to avoid duplication.')
});

export type MeaningQuizInput = z.infer<typeof MeaningQuizInputSchema>;

const MeaningQuizOutputSchema = z.object({
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).describe('The multiple-choice options, including the correct answer.'),
  correctAnswerIndex: z.number().int().min(0).describe('The index of the correct answer in the options array.'),
});

export type MeaningQuizOutput = z.infer<typeof MeaningQuizOutputSchema>;

export async function generateMeaningQuiz(input: MeaningQuizInput): Promise<MeaningQuizOutput> {
  return meaningQuizFlow(input);
}

const meaningQuizPrompt = ai.definePrompt({
  name: 'meaningQuizPrompt',
  input: {schema: MeaningQuizInputSchema},
  output: {schema: MeaningQuizOutputSchema},
  prompt: `You are a quiz generator for language learning.

  Generate a multiple-choice question to test the user's understanding of the word '{{word}}' in {{targetLanguage}}.

  Provide {{optionsCount}} options, including one correct translation of the word and several incorrect but plausible translations.
  Do not use any of these meanings as options: {{knownMeanings}}.
  Ensure that only one answer is correct. Output the question, the options as a JSON array, and the index of correct option.

  The question should be phrased as: 'Which of the following is the correct translation of "{{word}}" in {{targetLanguage}}?'

  Make sure that the output is valid JSON. The keys MUST be named 'question', 'options', and 'correctAnswerIndex'.
  The options MUST be strings.

  Example output:
  {
    "question": "Which of the following is the correct translation of \"apple\" in Spanish?",
    "options": ["Manzana", "Banana", "Naranja", "Uva"],
    "correctAnswerIndex": 0
  }`,
});

const meaningQuizFlow = ai.defineFlow(
  {
    name: 'meaningQuizFlow',
    inputSchema: MeaningQuizInputSchema,
    outputSchema: MeaningQuizOutputSchema,
  },
  async input => {
    const {output} = await meaningQuizPrompt(input);
    return output!;
  }
);
