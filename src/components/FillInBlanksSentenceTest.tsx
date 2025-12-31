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

const createSentenceWithBlank = (sentences: string[], wordToBlank: string): { sentence: string, original: string } | null => {
  if (!sentences || sentences.length === 0) return null;
  
  const sentence = sentences[Math.floor(Math.random() * sentences.length)];
  const blankedSentence = sentence.replace(new RegExp(`\\b${wordToBlank}\\b`, 'gi'), '_________');
  
  // If no replacement happened, it's not a good test
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

  if (!quizSentence) {
    // This can happen if the sentence doesn't contain the word, which is unlikely but possible.
    // We should probably just show a different test type, but for now, this will do.
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>ত্রুটি</CardTitle>
            </CardHeader>
            <CardContent>
                <p>এই শব্দের জন্য কোনো উপযুক্ত উদাহরণ বাক্য পাওয়া যায়নি।</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">শূন্যস্থান পূরণ করুন</CardTitle>
                <CardDescription>সঠিক শব্দটি দিয়ে নিচের বাক্যটি সম্পূর্ণ করুন।</CardDescription>
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
            <p className="text-center text-muted-foreground">বাক্যের শূন্যস্থানটি সঠিক ইংরেজি শব্দ দিয়ে পূরণ করুন।</p>
          <div>
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="এখানে শব্দটি টাইপ করুন..."
              className="text-center text-lg h-14"
              disabled={isSubmitted}
              aria-label="Your answer"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!answer.trim() || isSubmitted} className="ml-auto">
            জমা দিন
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
