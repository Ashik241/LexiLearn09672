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
import { useToast } from '@/hooks/use-toast';

type TestType = 'mcq' | 'spelling' | 'bengali-to-english' | 'synonym-antonym' | 'dynamic';
type SessionState = 'loading' | 'testing' | 'feedback' | 'finished';

const getRandomTestTypeForWord = (word: Word): Exclude<TestType, 'dynamic'> => {
    const types: Exclude<TestType, 'dynamic' | 'synonym-antonym'>[] = ['mcq', 'spelling', 'bengali-to-english'];
    const hasSynAnt = (word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0);
    if (hasSynAnt) {
        types.push('synonym-antonym' as any);
    }
    return types[Math.floor(Math.random() * types.length)];
}

function LearningClientInternal() {
  const { getWordForSession, updateWord, isInitialized, resetSession, getSessionProgress } = useVocabulary();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const forcedTestType = searchParams.get('type') as TestType | null;
  const difficultyFilter = searchParams.get('difficulty') as WordDifficulty | null;
  const dateFilter = searchParams.get('date');
  const learnedFilter = searchParams.get('learned') === 'true';

  const [currentWord, setCurrentWord, ] = useState<Word | null>(null);
  const [testType, setTestType] = useState<Exclude<TestType, 'dynamic'> | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  
  const getDifficultyFromFilter = (): WordDifficulty[] | undefined => {
    if (difficultyFilter) return [difficultyFilter];
    return undefined;
  }

  const getSessionFilter = useCallback(() => {
    let filter: ((word: Word) => boolean) | undefined = undefined;
    
    if (dateFilter) {
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === today) {
        filter = (word: Word) => word.createdAt.split('T')[0] === today;
      } else {
        filter = (word: Word) => word.createdAt.split('T')[0] === dateFilter;
      }
    } else if (learnedFilter) {
      filter = (word: Word) => word.is_learned;
    } else if (forcedTestType === 'synonym-antonym') {
      filter = (word: Word) => (word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0);
    }
    return filter;
  }, [dateFilter, learnedFilter, forcedTestType]);


  const loadNextWord = useCallback(() => {
    setIsLoadingNext(true);
    setSessionState('loading');

    let difficulties: WordDifficulty[] = ['New', 'Hard', 'Medium', 'Easy'];
    
    if (difficultyFilter) {
        difficulties = [difficultyFilter];
    } else if (!forcedTestType && !dateFilter) { // Default daily revision
        difficulties = ['Hard', 'Medium'];
    }

    const sessionFilter = getSessionFilter();
    let word = getWordForSession(difficulties, sessionFilter);

    if (word) {
      let effectiveTestType: Exclude<TestType, 'dynamic'>;
      if (forcedTestType === 'dynamic' || dateFilter || (!forcedTestType && !difficultyFilter) ) {
          effectiveTestType = getRandomTestTypeForWord(word);
      } else {
          effectiveTestType = forcedTestType || 'mcq';
      }

      if (effectiveTestType === 'synonym-antonym' && (!word.synonyms || word.synonyms.length === 0) && (!word.antonyms || word.antonyms.length === 0)) {
           effectiveTestType = 'mcq';
      }

      setCurrentWord(word);
      setTestType(effectiveTestType);
      setSessionState('testing');
    } else {
       setCurrentWord(null);
       setTestType(null);
       setSessionState('finished'); 
       toast({ title: "সেশন সম্পন্ন!", description: "এই তালিকার সব শব্দ পর্যালোচনা করা হয়েছে।" });
    }
    setIsLoadingNext(false);
  }, [getWordForSession, difficultyFilter, forcedTestType, dateFilter, toast, getSessionFilter]);

  useEffect(() => {
    if (isInitialized) {
      resetSession();
      loadNextWord();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, searchParams]); // Re-run when searchParams change

  const handleTestComplete = async (correct: boolean, answer: string) => {
    if (!currentWord) return;

    setIsCorrect(correct);
    setUserAnswer(answer);
    setSessionState('feedback');

    let newDifficulty: WordDifficulty;

    if (correct) {
      switch (currentWord.difficulty_level) {
        case 'Hard': newDifficulty = 'Medium'; break;
        case 'Medium': newDifficulty = 'Easy'; break;
        case 'New': newDifficulty = 'Medium'; break;
        default: newDifficulty = 'Easy'; break;
      }
    } else {
      newDifficulty = 'Hard';
    }

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

  const handleRestart = () => {
    resetSession();
    loadNextWord();
  }

  const TestComponent = useMemo(() => {
    if (!currentWord || !testType) return null;

    const onComplete = (isCorrect: boolean, answer: string, isMCQ: boolean, correctAnswer: string) => {
      handleTestComplete(isCorrect, answer);
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
          <p className="mb-4">আপনি এই তালিকার সমস্ত শব্দ পর্যালোচনা করেছেন। চালিয়ে যেতে চান?</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart}>আবার শুরু করুন</Button>
            <Link href="/" passHref>
              <Button variant="outline">ড্যাশবোর্ডে ফিরে যান</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sessionState === 'loading' && !currentWord) {
     return (
       <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle>সেশন সম্পন্ন!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">এই ফিল্টারে কোনো শব্দ পাওয়া যায়নি।</p>
          <div className="flex gap-4 justify-center">
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
