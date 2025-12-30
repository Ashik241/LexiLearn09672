'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useVocabulary } from '@/hooks/use-vocabulary';
import type { Word, WordDifficulty } from '@/types';
import McqTest from '@/components/McqTest';
import SpellingTest from '@/components/SpellingTest';
import FeedbackScreen from './FeedbackScreen';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { adjustDifficulty } from '@/ai/flows/automated-difficulty-adjustment';
import { useToast } from '@/hooks/use-toast';

type TestType = 'mcq' | 'spelling' | 'bengali-to-english' | 'synonym-antonym';
type SessionState = 'loading' | 'testing' | 'feedback' | 'finished';

const getRandomTestType = (): TestType => {
    const types: TestType[] = ['mcq', 'spelling', 'bengali-to-english', 'synonym-antonym'];
    return types[Math.floor(Math.random() * types.length)];
}

function LearningClientInternal() {
  const { getWordForSession, updateWord, isInitialized } = useVocabulary();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // URL-based filters
  const forcedTestType = searchParams.get('type') as TestType | null;
  const difficultyFilter = searchParams.get('difficulty') as WordDifficulty | null;
  const dateFilter = searchParams.get('date');
  const learnedFilter = searchParams.get('learned') === 'true';

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [testType, setTestType] = useState<TestType | null>(forcedTestType);
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  
  const isEndlessSession = !forcedTestType;

  const loadNextWord = useCallback(() => {
    setIsLoadingNext(true);

    let effectiveTestType = forcedTestType || getRandomTestType();
    
    // Determine the difficulties array based on filters or lack thereof.
    const hasSpecificFilters = !!difficultyFilter || !!dateFilter || !!learnedFilter;
    let difficulties: WordDifficulty[] = ['Hard', 'Medium']; // Default for daily revision
    if (difficultyFilter) {
        difficulties = [difficultyFilter];
    } else if (dateFilter) {
        difficulties = ['New', 'Hard', 'Medium', 'Easy']; // For "Today's Words", test all levels
    } else if (forcedTestType) {
        // For general test types from dashboard, test everything not learned
        difficulties = ['New', 'Hard', 'Medium', 'Easy'];
    }

    const filter = (word: Word) => {
        if (dateFilter && (!word.last_reviewed || word.last_reviewed.split('T')[0] !== dateFilter)) {
            return false;
        }
        if (learnedFilter && !word.is_learned) {
            return false;
        }
        // For general sessions (not specifically filtered), don't show learned words
        if (!hasSpecificFilters && !dateFilter && word.is_learned) {
            return false;
        }
        if (effectiveTestType === 'synonym-antonym' && (!word.synonyms || word.synonyms.length === 0) && (!word.antonyms || word.antonyms.length === 0)) {
            return false;
        }
        return true;
    };
    
    let word = getWordForSession(difficulties, filter);

    if (!word && !forcedTestType && effectiveTestType === 'synonym-antonym') {
        effectiveTestType = 'mcq';
        word = getWordForSession(difficulties, (w: Word) => {
             if (dateFilter && (!w.last_reviewed || w.last_reviewed.split('T')[0] !== dateFilter)) return false;
             if (learnedFilter && !w.is_learned) return false;
             if (!hasSpecificFilters && !dateFilter && w.is_learned) return false;
             return true;
        });
    }
    
    setCurrentWord(word);

    if (word) {
      setTestType(effectiveTestType);
      setSessionState('testing');
    } else {
      setSessionState('finished');
    }
    setIsLoadingNext(false);
  }, [getWordForSession, forcedTestType, difficultyFilter, dateFilter, learnedFilter]);

  useEffect(() => {
    if (isInitialized) {
      loadNextWord();
    }
  }, [isInitialized, loadNextWord]);

  const handleTestComplete = async (correct: boolean, answer: string, testMeta: { isMCQ: boolean, correctAnswer: string }) => {
    if (!currentWord) return;

    setIsCorrect(correct);
    setUserAnswer(answer);
    setSessionState('feedback');

    const { newDifficulty, reason } = await adjustDifficulty({
      word: currentWord.word,
      userAnswer: answer,
      correctAnswer: testMeta.correctAnswer,
      currentDifficulty: currentWord.difficulty_level,
      isMCQ: testMeta.isMCQ,
      translationLanguage: 'Bengali'
    });
    
    toast({
        title: `Difficulty changed to ${newDifficulty}`,
        description: reason,
    });

    const newTimesCorrect = currentWord.times_correct + (correct ? 1 : 0);
    const newTimesIncorrect = currentWord.times_incorrect + (correct ? 0 : 1);
    
    let isLearned = currentWord.is_learned;
    if (correct && newDifficulty === 'Easy') {
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
    if (!currentWord || !testType) return null;

    const onComplete = (isCorrect: boolean, answer: string, isMCQ: boolean, correctAnswer: string) => {
      handleTestComplete(isCorrect, answer, { isMCQ, correctAnswer });
    }

    switch (testType) {
        case 'mcq':
            return <McqTest word={currentWord} onComplete={onComplete} testType="english-to-bengali" />;
        case 'bengali-to-english':
            return <McqTest word={currentWord} onComplete={onComplete} testType="bengali-to-english" />;
        case 'synonym-antonym':
            return <McqTest word={currentWord} onComplete={onComplete} testType="synonym-antonym" />;
        case 'spelling':
            return <SpellingTest word={currentWord} onComplete={onComplete} />;
        default:
            return <McqTest word={currentWord} onComplete={onComplete} testType="english-to-bengali" />;
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
          <p className="mb-4">আপনি এই তালিকার সমস্ত শব্দ পর্যালোচনা করেছেন। চালিয়ে যেতে চান?</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={loadNextWord}>আবার শুরু করুন</Button>
            <Link href="/" passHref>
              <Button variant="outline">ড্যাশবোর্ডে ফিরে যান</Button>
            </Link>
          </div>
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
                <CardTitle>পরবর্তী শব্দের জন্য প্রস্তুত হচ্ছে...</CardTitle>
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

export function LearningClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LearningClientInternal />
    </Suspense>
  )
}
