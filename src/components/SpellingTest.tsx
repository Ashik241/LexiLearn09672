'use client';

import { useState, useRef, useEffect } from 'react';
import type { Word } from '@/types';
import { Volume2, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';

type SpellingMode = 'listen' | 'meaning';

interface SpellingTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
  mode: SpellingMode;
}


type Accent = 'UK' | 'US';

export default function SpellingTest({ word, onComplete, mode: initialMode }: SpellingTestProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [accent, setAccent] = useState<Accent>('US');
  const [rate] = useState([0.9]);
  const [volume] = useState([1]);
  const [mode, setMode] = useState<SpellingMode>(initialMode);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSpokenRef = useRef(false);

  const speak = (selectedAccent: Accent) => {
    if (typeof window.speechSynthesis === 'undefined') {
      toast({
        variant: 'destructive',
        title: 'TTS Not Supported',
        description: 'Your browser does not support text-to-speech.',
      });
      return;
    }

    window.speechSynthesis.cancel();
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
    utterance.rate = rate[0];
    utterance.volume = volume[0];
    window.speechSynthesis.speak(utterance);
    inputRef.current?.focus();
  };

  useEffect(() => {
    setAnswer('');
    setIsSubmitted(false);
    hasSpokenRef.current = false;
    setMode(initialMode);

    if (initialMode === 'listen') {
      const speakOnLoad = () => {
        if (window.speechSynthesis.getVoices().length > 0) {
            if (!hasSpokenRef.current) {
                speak(accent);
                hasSpokenRef.current = true;
            }
        }
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speakOnLoad();
      } else {
        window.speechSynthesis.onvoiceschanged = speakOnLoad;
      }
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, initialMode]);

  useEffect(() => {
    if (mode === 'listen' && !hasSpokenRef.current) {
        speak(accent);
        hasSpokenRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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
                <CardDescription>Select your preferred mode and provide the answer.</CardDescription>
            </div>
            <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <RadioGroup value={mode} onValueChange={(v: SpellingMode) => {
              hasSpokenRef.current = false;
              setMode(v);
            }} className="flex justify-center gap-4 p-4 rounded-lg bg-card-foreground/5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="meaning" id="mode-meaning" />
                <Label htmlFor="mode-meaning">Write from Meaning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="listen" id="mode-listen" />
                <Label htmlFor="mode-listen">Write from Listening</Label>
              </div>
            </RadioGroup>

          {mode === 'listen' ? (
            <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-card-foreground/10">
                <RadioGroup value={accent} onValueChange={(value: Accent) => setAccent(value)} className="flex gap-4">
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
                    aria-label="Listen to the word"
                    >
                    <Volume2 className="h-6 w-6" />
                </Button>
            </div>
          ) : (
            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-card-foreground/10 text-center">
                    <p className="text-sm text-muted-foreground">Write the English word for this meaning:</p>
                    <p className="text-xl font-semibold text-primary mt-1">"{word.meaning}"</p>
                </div>
                {word.meaning_explanation && (
                     <div className="p-4 rounded-lg bg-card-foreground/5 text-sm text-muted-foreground text-left space-y-3">
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">Meaning Explanation</h4>
                            <p className="italic">"{word.meaning_explanation}"</p>
                        </div>
                    </div>
                )}
            </div>
          )}

          <div>
            <Input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type the word here..."
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
