'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Word } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { useVocabulary } from '@/hooks/use-vocabulary';

interface McqTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
}

interface Quiz {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function McqTest({ word, onComplete }: McqTestProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { getAllWords } = useVocabulary();

  useEffect(() => {
    setLoading(true);
    const allWords = getAllWords();
    
    // Find 3 incorrect options
    const incorrectOptions = allWords
      .filter(w => w.id !== word.id) // Exclude the correct word
      .sort(() => 0.5 - Math.random()) // Shuffle to get random words
      .slice(0, 3)
      .map(w => w.meaning);

    // If there aren't enough words for incorrect options, we can't make a quiz
    if (incorrectOptions.length < 3) {
       // Fallback or show an error. For now, let's just use what we have.
       while(incorrectOptions.length < 3) {
         incorrectOptions.push(`ভুল উত্তর ${incorrectOptions.length + 1}`);
       }
    }
    
    const options = [word.meaning, ...incorrectOptions];
    const shuffledOptions = shuffleArray(options);
    const correctIndex = shuffledOptions.findIndex(opt => opt === word.meaning);

    setQuiz({
      question: `Which of the following is the correct translation of "${word.word}" in Bengali?`,
      options: shuffledOptions,
      correctAnswerIndex: correctIndex,
    });
    
    setLoading(false);
    // Reset component state for the new word
    setSelectedOption(null);
    setIsSubmitted(false);

  }, [word, getAllWords]);

  const handleSubmit = () => {
    if (selectedOption === null || quiz === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption === quiz.correctAnswerIndex;
    onComplete(isCorrect, quiz.options[selectedOption] || '');
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
