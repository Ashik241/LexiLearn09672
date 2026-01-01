'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Word } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BrainCircuit } from 'lucide-react';

interface FillInBlanksWordTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
}

const createBlankedWord = (wordStr: string): string => {
  if (wordStr.length <= 3) return wordStr;
  
  let blankedWord = wordStr.split('');
  const len = blankedWord.length;
  const charsToBlank = Math.floor(len / 2.5); // Blank roughly 40% of chars
  
  let blankedIndices = new Set<number>();
  
  // Don't blank first and last letters
  while (blankedIndices.size < charsToBlank) {
    const randomIndex = Math.floor(Math.random() * (len - 2)) + 1; // 1 to len-2
    blankedIndices.add(randomIndex);
  }
  
  blankedIndices.forEach(i => {
    blankedWord[i] = '_';
  });
  
  return blankedWord.join('');
}


export default function FillInBlanksWordTest({ word, onComplete }: FillInBlanksWordTestProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const blankedWord = useMemo(() => createBlankedWord(word.word), [word]);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Complete the Word</CardTitle>
                <CardDescription>Fill in the blanks to write the correct word.</CardDescription>
            </div>
            <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
            <div className="p-8 rounded-lg bg-card-foreground/10 text-center">
                <p className="text-3xl font-bold font-code tracking-widest text-primary">{blankedWord}</p>
            </div>
            <p className="text-center text-muted-foreground">Complete the word above.</p>
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
