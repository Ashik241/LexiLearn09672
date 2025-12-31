'use client';

import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { Word, VerbFormDetail } from '@/types';
import { Separator } from './ui/separator';

interface FeedbackScreenProps {
  isCorrect: boolean;
  word: Word;
  userAnswer: string;
  onNext: () => void;
  isLoading: boolean;
}

const VerbFormFeedback = ({ formName, form }: { formName: string; form: VerbFormDetail }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-foreground">{formName} ({form.word})</span>
        <span className="text-muted-foreground">{form.bangla_meaning}</span>
    </div>
);


export default function FeedbackScreen({ isCorrect, word, userAnswer, onNext, isLoading }: FeedbackScreenProps) {
  const isVerb = word.parts_of_speech.toLowerCase().includes('verb') && word.verb_forms;
    
  return (
    <Card
      className={cn(
        'w-full border-2',
        isCorrect ? 'border-green-500' : 'border-red-500'
      )}
    >
      <CardHeader className="items-center">
        {isCorrect ? (
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500" />
        )}
        <h2 className="text-3xl font-bold font-headline mt-4">
          {isCorrect ? 'সঠিক!' : 'ভুল'}
        </h2>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-card-foreground/5 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">শব্দটি ছিল:</p>
          <p className="text-2xl font-bold font-code text-primary break-words">{word.word}</p>
          <p className="text-lg text-foreground mt-1 break-words">"{word.meaning}"</p>
        </div>
        {!isCorrect && (
          <div className="bg-destructive/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">আপনার উত্তর:</p>
            <p className="text-xl font-code text-destructive-foreground line-through break-words">{userAnswer}</p>
          </div>
        )}

        {isVerb && (
             <Card>
                <CardHeader>
                    <CardTitle className='text-lg font-semibold'>Verb Forms (ক্রিয়ার রূপ)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-left">
                    <VerbFormFeedback formName="Present (V1)" form={word.verb_forms!.v1_present} />
                    <Separator />
                    <VerbFormFeedback formName="Past (V2)" form={word.verb_forms!.v2_past} />
                    <Separator />
                    <VerbFormFeedback formName="Past Participle (V3)" form={word.verb_forms!.v3_past_participle} />
                </CardContent>
            </Card>
        )}

         {word.example_sentences && word.example_sentences.length > 0 && (
          <div className="bg-card-foreground/5 p-4 rounded-lg text-left">
            <p className="text-sm text-muted-foreground mb-2">উদাহরণ:</p>
            <ul className="list-disc list-inside space-y-1 text-foreground">
              {word.example_sentences.map((sentence, i) => (
                <li key={i} className="break-words">"{sentence}"</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onNext} className="w-full md:w-auto md:ml-auto" size="lg" disabled={isLoading}>
          {isLoading ? 'লোড হচ্ছে...' : 'পরবর্তী শব্দ'}
          {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
