'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Word } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pilcrow } from 'lucide-react';

interface FillInBlanksSentenceTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
}

export const createSentenceWithBlank = (sentences: string[] | undefined, wordToBlank: string): { sentence: string, original: string } | null => {
  if (!sentences || sentences.length === 0) return null;
  
  const suitableSentences = sentences.filter(s => new RegExp(`\\b${wordToBlank}\\b`, 'i').test(s));

  if (suitableSentences.length === 0) return null;

  const sentence = suitableSentences[Math.floor(Math.random() * suitableSentences.length)];
  const blankedSentence = sentence.replace(new RegExp(`\\b${wordToBlank}\\b`, 'gi'), '_________');
  
  // This check is redundant now but kept for safety
  if (sentence === blankedSentence) return null;

  return { sentence: blankedSentence, original: sentence };
}

export default function FillInBlanksSentenceTest({ word, onComplete }: FillInBlanksSentenceTestProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const quizSentence = useMemo(() => createSentenceWithBlank(word.example_sentences || [], word.word), [word]);

  useEffect(() => {
    setAnswer('');
    setIsSubmitted(false);
  }, [word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setIsSubmitted(true);
    const isCorrect = answer.trim().toLowerCase() === word.word.toLowerCase();
    onComplete(isCorrect, answer.trim());
  };

  // This should theoretically not be reached anymore due to the fallback in LearningClient
  if (!quizSentence) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>No suitable example sentence found for this word.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Fill in the Blank</CardTitle>
                <CardDescription>Complete the sentence with the correct word.</CardDescription>
            </div>
            <Pilcrow className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
            <div className="p-8 rounded-lg bg-card-foreground/10 text-center">
                <p className="text-xl md:text-2xl font-semibold leading-relaxed text-foreground">
                    "{quizSentence.sentence}"
                </p>
            </div>
            <p className="text-center text-muted-foreground">Fill in the blank with the correct English word.</p>
          <div>
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type the word here..."
              className="text-center text-lg h-14"
              disabled={isSubmitted}
              aria-label="Your answer"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!answer.trim() || isSubmitted} className="ml-auto">
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
