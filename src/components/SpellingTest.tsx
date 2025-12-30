'use client';

import { useState, useRef, useEffect } from 'react';
import type { Word } from '@/types';
import { Volume2, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface SpellingTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
}

type Accent = 'UK' | 'US';

export default function SpellingTest({ word, onComplete }: SpellingTestProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [accent, setAccent] = useState<Accent>('US');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const speak = (selectedAccent: Accent) => {
    if (typeof window.speechSynthesis === 'undefined') {
      toast({
        variant: 'destructive',
        title: 'TTS Not Supported',
        description: 'Your browser does not support text-to-speech.',
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word.word);
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (selectedAccent === 'UK') {
      selectedVoice = voices.find(voice => voice.lang.includes('en-GB'));
    } else {
      selectedVoice = voices.find(voice => voice.lang.includes('en-US'));
    }
    
    utterance.voice = selectedVoice || voices.find(voice => voice.lang.includes('en')) || voices[0];
    utterance.pitch = 1;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    inputRef.current?.focus();
  };

  useEffect(() => {
    // Preload voices
    window.speechSynthesis.getVoices();
    // Speak word on component mount
    const timeoutId = setTimeout(() => speak('US'), 200);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setIsSubmitted(true);
    const isCorrect = answer.trim().toLowerCase() === word.word.toLowerCase();
    onComplete(isCorrect, answer.trim());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Spelling Test</CardTitle>
                <CardDescription>Listen to the word and type it below.</CardDescription>
            </div>
            <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-card-foreground/5">
            <RadioGroup defaultValue="US" onValueChange={(value: Accent) => setAccent(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="US" id="us-accent" />
                <Label htmlFor="us-accent">US Accent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="UK" id="uk-accent" />
                <Label htmlFor="uk-accent">UK Accent</Label>
              </div>
            </RadioGroup>
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => speak(accent)}
                aria-label="Listen to word"
                >
                <Volume2 className="h-6 w-6" />
            </Button>
          </div>
          <div>
            <Input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type the word you hear..."
              className="text-center text-lg h-14"
              disabled={isSubmitted}
              aria-label="Your answer"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!answer.trim() || isSubmitted} className="ml-auto">
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
