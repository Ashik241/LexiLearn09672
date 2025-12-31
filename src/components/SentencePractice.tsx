'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { checkSentence, SentenceCheckerOutput } from '@/ai/flows/sentence-checker';
import type { Word } from '@/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface SentencePracticeProps {
  word: Word;
}

export function SentencePractice({ word }: SentencePracticeProps) {
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<SentenceCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentence.trim()) {
      toast({
        variant: 'destructive',
        title: 'খালি বাক্য',
        description: 'অনুগ্রহ করে একটি বাক্য লিখুন।',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const aiResult = await checkSentence({ word: word.word, sentence });
      setResult(aiResult);
    } catch (error) {
      console.error('AI sentence check failed:', error);
      toast({
        variant: 'destructive',
        title: 'একটি ত্রুটি ঘটেছে',
        description: 'AI ফিডব্যাক পেতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSentence('');
    setResult(null);
    setIsLoading(false);
  }

  return (
    <Card className="bg-card-foreground/5 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-yellow-400" />
          <div>
            <CardTitle className="font-headline">বাক্য তৈরি করে অনুশীলন করুন</CardTitle>
            <CardDescription>"{word.word}" শব্দটি ব্যবহার করে একটি অর্থপূর্ণ বাক্য লিখুন।</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder={`e.g., The quick brown fox jumps over the lazy dog.`}
            className="text-base"
            rows={3}
            disabled={isLoading || !!result}
          />

          {isLoading && (
            <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>আপনার বাক্য বিশ্লেষণ করা হচ্ছে...</span>
            </div>
          )}

          {result && (
            <Alert className={cn("mt-4", result.is_correct ? "border-green-500/50" : "border-red-500/50")}>
              {result.is_correct ? (
                <CheckCircle2 className="h-4 w-4" color="hsl(var(--primary))" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <AlertTitle className={cn(result.is_correct ? "text-primary" : "text-destructive")}>
                {result.is_correct ? 'চমৎকার!' : 'আরও চেষ্টা করুন'}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{result.feedback}</p>
                {result.corrected_sentence && (
                    <div>
                        <p className="font-semibold">সংশোধিত বাক্য:</p>
                        <p className="italic">"{result.corrected_sentence}"</p>
                    </div>
                )}
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="justify-end gap-2">
            {result ? (
                <Button type="button" variant="outline" onClick={handleReset}>আবার চেষ্টা করুন</Button>
            ) : (
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    জমা দিন
                </Button>
            )}
        </CardFooter>
      </form>
    </Card>
  );
}
