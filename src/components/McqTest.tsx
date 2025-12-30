'use client';

import { useState, useEffect } from 'react';
import type { Word } from '@/types';
import { generateMeaningQuiz, MeaningQuizOutput } from '@/ai/flows/adaptive-vocabulary-meaning';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface McqTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
}

export default function McqTest({ word, onComplete }: McqTestProps) {
  const [quiz, setQuiz] = useState<MeaningQuizOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isCancelled = false;
    async function fetchQuiz() {
      setLoading(true);
      try {
        const result = await generateMeaningQuiz({
          word: word.word,
          targetLanguage: 'Bengali',
          optionsCount: 4,
          knownMeanings: [],
        });
        if (!isCancelled) {
          setQuiz(result);
        }
      } catch (error) {
        console.error("Failed to generate MCQ:", error);
        toast({
          variant: 'destructive',
          title: 'AI Error',
          description: 'Could not generate a quiz. Please try again later.'
        });
        // A fallback could be implemented here, e.g. switching to spelling test
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    fetchQuiz();
    return () => { isCancelled = true; };
  }, [word, toast]);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption === quiz?.correctAnswerIndex;
    onComplete(isCorrect, quiz?.options[selectedOption] || '');
  };

  if (loading || !quiz) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-24 ml-auto"/>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{quiz.question}</CardTitle>
        <CardDescription>সঠিক অর্থটি নির্বাচন করুন।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quiz.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            size="lg"
            className={cn(
              'w-full justify-start h-auto py-3 text-left',
              selectedOption === index && 'ring-2 ring-primary border-primary'
            )}
            onClick={() => setSelectedOption(index)}
            disabled={isSubmitted}
          >
            <span className="mr-4 font-bold">{String.fromCharCode(65 + index)}</span>
            <span>{option}</span>
          </Button>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={selectedOption === null || isSubmitted} className="ml-auto">
          জমা দিন
        </Button>
      </CardFooter>
    </Card>
  );
}
