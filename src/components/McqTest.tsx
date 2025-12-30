'use client';

import { useState, useEffect } from 'react';
import type { Word } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { useVocabulary } from '@/hooks/use-vocabulary';

type McqTestType = 'english-to-bengali' | 'bengali-to-english' | 'synonym-antonym';

interface McqTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
  testType: McqTestType;
}

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateQuiz = (word: Word, allWords: Word[], testType: McqTestType): Quiz | null => {
    let question = '';
    let options: string[] = [];
    let correctAnswer = '';

    const getIncorrectOptions = (correctValue: string, valueField: 'meaning' | 'word', count = 3) => {
        return allWords
            .filter(w => w.id !== word.id && w[valueField] !== correctValue)
            .sort(() => 0.5 - Math.random())
            .slice(0, count)
            .map(w => w[valueField]);
    };

    if (testType === 'english-to-bengali') {
        question = `Which of the following is the correct translation of "${word.word}" in Bengali?`;
        correctAnswer = word.meaning;
        const incorrectOptions = getIncorrectOptions(correctAnswer, 'meaning');
        if (incorrectOptions.length < 3) return null;
        options = shuffleArray([correctAnswer, ...incorrectOptions]);
    } else if (testType === 'bengali-to-english') {
        question = `"${word.meaning}" is the meaning of which English word?`;
        correctAnswer = word.word;
        const incorrectOptions = getIncorrectOptions(correctAnswer, 'word');
        if (incorrectOptions.length < 3) return null;
        options = shuffleArray([correctAnswer, ...incorrectOptions]);
    } else if (testType === 'synonym-antonym') {
        const isSynonymTest = Math.random() > 0.5;
        const targetArray = isSynonymTest ? word.synonyms : word.antonyms;
        
        if (!targetArray || targetArray.length === 0) {
            // Fallback if no synonyms/antonyms
            return generateQuiz(word, allWords, 'english-to-bengali');
        }

        const correctRelation = targetArray[Math.floor(Math.random() * targetArray.length)];
        correctAnswer = correctRelation.word;
        
        question = `Which of the following is a ${isSynonymTest ? 'synonym' : 'antonym'} of "${word.word}"?`;

        const incorrectOptions = allWords
            .filter(w => 
                w.id !== word.id && 
                !word.synonyms.some(s => s.word === w.word) && 
                !word.antonyms.some(a => a.word === w.word)
            )
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.word);

        if (incorrectOptions.length < 3) return null;
        options = shuffleArray([correctAnswer, ...incorrectOptions]);
    }

    return { question, options, correctAnswer };
}


export default function McqTest({ word, onComplete, testType }: McqTestProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { getAllWords } = useVocabulary();

  useEffect(() => {
    setLoading(true);
    const allWords = getAllWords();
    
    const newQuiz = generateQuiz(word, allWords, testType);

    if (newQuiz) {
        setQuiz(newQuiz);
    } else {
        // Fallback if quiz generation fails
        const fallbackQuiz = generateQuiz(word, allWords, 'english-to-bengali');
        setQuiz(fallbackQuiz);
    }
    
    setLoading(false);
    setSelectedOption(null);
    setIsSubmitted(false);

  }, [word, getAllWords, testType]);

  const handleSubmit = () => {
    if (selectedOption === null || quiz === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption === quiz.correctAnswer;
    onComplete(isCorrect, selectedOption || '');
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
        <CardDescription>সঠিক উত্তরটি নির্বাচন করুন।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quiz.options.map((option, index) => (
          <Button
            key={option}
            variant="outline"
            size="lg"
            className={cn(
              'w-full justify-start h-auto py-3 text-left',
              selectedOption === option && 'ring-2 ring-primary border-primary'
            )}
            onClick={() => setSelectedOption(option)}
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
