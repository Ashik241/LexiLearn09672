'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useVocabulary } from '@/hooks/use-vocabulary';
import type { Word, WordDifficulty, TestType, ErrorType } from '@/types';
import McqTest from '@/components/McqTest';
import SpellingTest from '@/components/SpellingTest';
import FillInBlanksWordTest from '@/components/FillInBlanksWordTest';
import FillInBlanksSentenceTest, { createSentenceWithBlank } from '@/components/FillInBlanksSentenceTest';
import VerbFormTest from '@/components/VerbFormTest';
import FeedbackScreen from './FeedbackScreen';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type SessionState = 'loading' | 'testing' | 'feedback' | 'finished';

const getErrorTypeForTest = (testType: Exclude<TestType, 'dynamic'>): ErrorType => {
    switch (testType) {
        case 'spelling_listen':
        case 'spelling_meaning':
        case 'fill_blank_word':
            return 'spelling_error';
        case 'mcq':
        case 'bengali-to-english':
        case 'synonym-antonym':
            return 'meaning_error';
        case 'verb_form':
        case 'fill_blank_sentence':
            return 'grammar_error';
        default:
            return 'meaning_error';
    }
}

const getRandomTestTypeForWord = (word: Word): Exclude<TestType, 'dynamic'> => {
    // Weighted Practice Algorithm - prioritize spelling test for words with high spelling error count
    if (word.spelling_error >= 3) {
      const spellingTests: Extract<TestType, 'spelling_listen' | 'spelling_meaning' | 'fill_blank_word'>[] = ['spelling_listen', 'spelling_meaning'];
      if(word.word.length > 3) spellingTests.push('fill_blank_word');
      return spellingTests[Math.floor(Math.random() * spellingTests.length)];
    }

    const types: Exclude<TestType, 'dynamic' | 'synonym-antonym'>[] = ['mcq', 'spelling_meaning', 'spelling_listen', 'bengali-to-english'];
    
    if ((word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0)) {
        // types.push('synonym-antonym'); // This test type is not fully implemented
    }
    if (word.word.length > 3) {
        types.push('fill_blank_word');
    }
    if (word.example_sentences && word.example_sentences.length > 0 && createSentenceWithBlank(word.example_sentences, word.word)) {
        types.push('fill_blank_sentence');
    }
    if (word.verb_forms) {
        types.push('verb_form');
    }

    return types[Math.floor(Math.random() * types.length)];
}

function LearningClientInternal() {
  const { getWordForSession, updateWord, isInitialized, resetSession } = useVocabulary();
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

  const getSessionFilter = useCallback((): ((word: Word) => boolean) => {
    let filter: ((word: Word) => boolean);
    
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
      filter = (word: Word) => !!((word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0));
    } else if (forcedTestType === 'verb_form') {
        filter = (word: Word) => !!word.verb_forms;
    } else if (forcedTestType === 'fill_blank_sentence') {
        filter = (word: Word) => !!word.example_sentences && word.example_sentences.length > 0 && !!createSentenceWithBlank(word.example_sentences, word.word);
    } else {
      filter = () => true; // Default filter that includes all words
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

      // Fallback logic
      if (effectiveTestType === 'synonym-antonym' && (!word.synonyms || word.synonyms.length === 0) && (!word.antonyms || word.antonyms.length === 0)) {
           effectiveTestType = 'mcq';
      }
      if (effectiveTestType === 'verb_form' && !word.verb_forms) {
          effectiveTestType = 'mcq';
      }
      if (effectiveTestType === 'fill_blank_sentence' && (!word.example_sentences || word.example_sentences.length === 0 || !createSentenceWithBlank(word.example_sentences, word.word))) {
          effectiveTestType = 'mcq';
      }
      if (effectiveTestType === 'fill_blank_word' && word.word.length <= 3) {
          effectiveTestType = 'spelling_meaning';
      }

      // If user has many spelling errors, force a spelling test
      if (word.spelling_error >= 3) {
          const spellingTests: Extract<TestType, 'spelling_listen' | 'spelling_meaning' | 'fill_blank_word'>[] = ['spelling_listen', 'spelling_meaning'];
          if(word.word.length > 3) spellingTests.push('fill_blank_word');
          effectiveTestType = spellingTests[Math.floor(Math.random() * spellingTests.length)];
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
    if (!currentWord || !testType) return;

    setIsCorrect(correct);
    setUserAnswer(answer);
    setSessionState('feedback');

    let newDifficulty: WordDifficulty;
    let updates: Partial<Word> = {};

    if (correct) {
      switch (currentWord.difficulty_level) {
        case 'Hard': newDifficulty = 'Medium'; break;
        case 'Medium': newDifficulty = 'Easy'; break;
        case 'New': newDifficulty = 'Medium'; break;
        default: newDifficulty = 'Easy'; break;
      }
      updates.times_correct = currentWord.times_correct + 1;
      
      const errorType = getErrorTypeForTest(testType);
      if (errorType === 'spelling_error' && currentWord.spelling_error > 0) {
        updates.spelling_error = 0; // Reset spelling error count on correct spelling
        toast({ title: "বানান সঠিক!", description: `"${currentWord.word}" শব্দের জন্য ভুলের সংখ্যা রিসেট করা হয়েছে।` });
      }

    } else {
      newDifficulty = 'Hard';
      updates.times_incorrect = currentWord.times_incorrect + 1;
      const errorType = getErrorTypeForTest(testType);
      updates[errorType] = (currentWord[errorType] || 0) + 1;
    }
    
    updates.difficulty_level = newDifficulty;
    
    if (correct && newDifficulty === 'Easy') {
      updates.is_learned = true;
    } else if (!correct) {
      updates.is_learned = false;
    }

    updateWord(currentWord.id, updates);
  };

  const handleRestart = () => {
    resetSession();
    loadNextWord();
  }

  const TestComponent = useMemo(() => {
    if (!currentWord || !testType) return null;

    const onComplete = (isCorrect: boolean, answer: string) => {
      handleTestComplete(isCorrect, answer);
    }

    switch (testType) {
        case 'mcq':
            return <McqTest word={currentWord} onComplete={onComplete} testType="english-to-bengali" />;
        case 'bengali-to-english':
            return <McqTest word={currentWord} onComplete={onComplete} testType="bengali-to-english" />;
        case 'synonym-antonym':
            return <McqTest word={currentWord} onComplete={onComplete} testType="synonym-antonym" />;
        case 'spelling_listen':
        case 'spelling_meaning':
             return <SpellingTest word={currentWord} onComplete={onComplete} mode={testType === 'spelling_listen' ? 'listen' : 'meaning'} />;
        case 'fill_blank_word':
            return <FillInBlanksWordTest word={currentWord} onComplete={onComplete} />;
        case 'fill_blank_sentence':
            return <FillInBlanksSentenceTest word={currentWord} onComplete={onComplete} />;
        case 'verb_form':
            return <VerbFormTest word={currentWord} onComplete={onComplete} />;
        default:
            return <McqTest word={currentWord} onComplete={onComplete} testType="english-to-bengali" />;
    }
  }, [currentWord, testType]);

  if (!isInitialized) {
    return (
      <Card className="w-full text-center">
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
       <Card className="w-full text-center">
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
       <Card className="w-full text-center">
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
    <div className="w-full">
      {sessionState === 'testing' && TestComponent}
      {sessionState === 'loading' && ( 
        <Card className="w-full text-center">
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

    