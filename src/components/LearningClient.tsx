'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { adjustDifficulty } from '@/ai/flows/automated-difficulty-adjustment';
import type { Word } from '@/types';
import McqTest from '@/components/McqTest';
import SpellingTest from '@/components/SpellingTest';
import FeedbackScreen from './FeedbackScreen';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

type TestType = 'mcq' | 'spelling';
type SessionState = 'loading' | 'testing' | 'feedback' | 'finished';

interface LearningClientProps {
  forcedTestType?: TestType;
}

export function LearningClient({ forcedTestType }: LearningClientProps) {
  const { getWordForSession, updateWord, isInitialized } = useVocabulary();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [testType, setTestType] = useState<TestType>('mcq');
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const loadNextWord = useCallback(() => {
    setIsLoadingNext(true);
    const word = getWordForSession();
    setCurrentWord(word);
    if (word) {
      setTestType(forcedTestType || (Math.random() > 0.5 ? 'mcq' : 'spelling'));
      setSessionState('testing');
    } else {
      setSessionState('finished');
    }
    setIsLoadingNext(false);
  }, [getWordForSession, forcedTestType]);

  useEffect(() => {
    if (isInitialized) {
      loadNextWord();
    }
  }, [isInitialized, loadNextWord]);

  const handleTestComplete = async (correct: boolean, answer: string) => {
    if (!currentWord) return;

    setIsCorrect(correct);
    setUserAnswer(answer);
    setSessionState('loading'); // Show loading while AI processes

    try {
      const difficultyResult = await adjustDifficulty({
        word: currentWord.word,
        userAnswer: answer,
        correctAnswer: testType === 'spelling' ? currentWord.word : currentWord.meaning,
        currentDifficulty: currentWord.difficulty_level,
        isMCQ: testType === 'mcq',
      });
      
      const newTimesCorrect = currentWord.times_correct + (correct ? 1 : 0);
      const newTimesIncorrect = currentWord.times_incorrect + (correct ? 0 : 1);
      
      let isLearned = currentWord.is_learned;
      if (correct && difficultyResult.newDifficulty === 'Easy' && currentWord.difficulty_level !== 'Easy') {
        isLearned = true;
      } else if (!correct) {
        isLearned = false;
      }

      updateWord(currentWord.id, {
        difficulty_level: difficultyResult.newDifficulty,
        is_learned: isLearned,
        times_correct: newTimesCorrect,
        times_incorrect: newTimesIncorrect,
      });

    } catch (error) {
      console.error("AI difficulty adjustment failed:", error);
      // Fallback logic if AI fails
      const newDifficulty = correct ? (currentWord.difficulty_level === 'Hard' ? 'Medium' : 'Easy') : 'Hard';
      updateWord(currentWord.id, { difficulty_level: newDifficulty });
    } finally {
      setSessionState('feedback');
    }
  };

  const TestComponent = useMemo(() => {
    if (!currentWord) return null;

    if (testType === 'mcq') {
      return <McqTest word={currentWord} onComplete={handleTestComplete} />;
    }
    return <SpellingTest word={currentWord} onComplete={handleTestComplete} />;
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
                <p>অনুগ্রহ করে অপেক্ষা করুন, AI শব্দের অসুবিধা স্তর সামঞ্জস্য করছে।</p>
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
