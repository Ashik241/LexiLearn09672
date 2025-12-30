'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useVocabulary } from '@/hooks/use-vocabulary';
import type { Word, WordDifficulty } from '@/types';
import McqTest from '@/components/McqTest';
import SpellingTest from '@/components/SpellingTest';
import FeedbackScreen from './FeedbackScreen';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type TestType = 'mcq' | 'spelling' | 'bengali-to-english' | 'synonym-antonym';
type SessionState = 'loading' | 'testing' | 'feedback' | 'finished';

interface LearningClientProps {
  forcedTestType?: TestType;
}

const getRandomTestType = (): TestType => {
    const types: TestType[] = ['mcq', 'spelling', 'bengali-to-english', 'synonym-antonym'];
    return types[Math.floor(Math.random() * types.length)];
}

export function LearningClient({ forcedTestType }: LearningClientProps) {
  const { getWordForSession, updateWord, isInitialized } = useVocabulary();
  const searchParams = useSearchParams();
  const difficultyFilter = searchParams.get('difficulty') as WordDifficulty | null;
  const dateFilter = searchParams.get('date');
  
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [testType, setTestType] = useState<TestType>('mcq');
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const loadNextWord = useCallback(() => {
    setIsLoadingNext(true);

    const difficulties = difficultyFilter ? [difficultyFilter] : undefined;
    let effectiveTestType = forcedTestType || getRandomTestType();

    const baseFilter = dateFilter 
        ? (word: Word) => !!word.last_reviewed && word.last_reviewed.startsWith(dateFilter) 
        : undefined;
    
    let filter = baseFilter;

    if (effectiveTestType === 'synonym-antonym') {
        const synonymAntonymFilter = (w: Word) => (w.synonyms && w.synonyms.length > 0) || (w.antonyms && w.antonyms.length > 0);
        filter = baseFilter 
            ? (w: Word) => baseFilter(w) && synonymAntonymFilter(w) 
            : synonymAntonymFilter;
    }
    
    let word = getWordForSession(difficulties, filter);

    // If a random test was chosen and no suitable word was found, try another test type.
    if (!word && !forcedTestType && effectiveTestType === 'synonym-antonym') {
        effectiveTestType = 'mcq'; // Fallback
        word = getWordForSession(difficulties, baseFilter);
    }
    
    setCurrentWord(word);

    if (word) {
      setTestType(effectiveTestType);
      setSessionState('testing');
    } else {
      setSessionState('finished');
    }
    setIsLoadingNext(false);
  }, [getWordForSession, forcedTestType, difficultyFilter, dateFilter]);

  useEffect(() => {
    if (isInitialized) {
      loadNextWord();
    }
  }, [isInitialized, loadNextWord]);

  const handleTestComplete = (correct: boolean, answer: string) => {
    if (!currentWord) return;

    setIsCorrect(correct);
    setUserAnswer(answer);
    setSessionState('feedback');

    // --- Difficulty Adjustment Logic (Local) ---
    const currentDifficulty = currentWord.difficulty_level;
    let newDifficulty: WordDifficulty = currentDifficulty;

    if (correct) {
        if (currentDifficulty === 'Hard') newDifficulty = 'Medium';
        else if (currentDifficulty === 'Medium') newDifficulty = 'Easy';
        else if (currentDifficulty === 'New') newDifficulty = 'Medium';
    } else {
        if (currentDifficulty === 'Easy') newDifficulty = 'Medium';
        else if (currentDifficulty === 'Medium') newDifficulty = 'Hard';
        else if (currentDifficulty === 'New') newDifficulty = 'Hard';
    }
    
    // --- Update Word Stats ---
    const newTimesCorrect = currentWord.times_correct + (correct ? 1 : 0);
    const newTimesIncorrect = currentWord.times_incorrect + (correct ? 0 : 1);
    
    let isLearned = currentWord.is_learned;
    if (correct && newDifficulty === 'Easy' && currentWord.difficulty_level !== 'Easy') {
      isLearned = true;
    } else if (!correct) {
      isLearned = false;
    }

    updateWord(currentWord.id, {
      difficulty_level: newDifficulty,
      is_learned: isLearned,
      times_correct: newTimesCorrect,
      times_incorrect: newTimesIncorrect,
    });
  };

  const TestComponent = useMemo(() => {
    if (!currentWord) return null;

    switch (testType) {
        case 'mcq':
            return <McqTest word={currentWord} onComplete={handleTestComplete} testType="english-to-bengali" />;
        case 'bengali-to-english':
            return <McqTest word={currentWord} onComplete={handleTestComplete} testType="bengali-to-english" />;
        case 'synonym-antonym':
            return <McqTest word={currentWord} onComplete={handleTestComplete} testType="synonym-antonym" />;
        case 'spelling':
            return <SpellingTest word={currentWord} onComplete={handleTestComplete} />;
        default:
            return <McqTest word={currentWord} onComplete={handleTestComplete} testType="english-to-bengali" />;
    }
  }, [currentWord, testType]);

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle>শব্দভান্ডার লোড হচ্ছে...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>আপনার শেখার সেশন প্রস্তুত করার সময় দয়া করে অপেক্ষা করুন।</p>
        </CardContent>
      </Card>
    );
  }

  if (sessionState === 'finished') {
    return (
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle>সেশন সম্পন্ন!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">আপনি এখনকার জন্য উপলব্ধ সমস্ত শব্দ পর্যালোচনা করেছেন। সাবাশ!</p>
          <Link href="/" passHref>
            <Button>ড্যাশবোর্ডে ফিরে যান</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {sessionState === 'testing' && TestComponent}
      {sessionState === 'loading' && ( 
        <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <CardTitle>আপনার উত্তর বিশ্লেষণ করা হচ্ছে...</CardTitle>
            </CardHeader>
            <CardContent>
                <p>অনুগ্রহ করে অপেক্ষা করুন...</p>
                <div className="flex justify-center items-center p-8">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </CardContent>
        </Card>
      )}
      {sessionState === 'feedback' && currentWord && (
        <FeedbackScreen
          isCorrect={isCorrect}
          word={currentWord}
          userAnswer={userAnswer}
          onNext={loadNextWord}
          isLoading={isLoadingNext}
        />
      )}
    </div>
  );
}
