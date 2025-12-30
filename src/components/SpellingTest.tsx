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
import { Slider } from './ui/slider';

interface SpellingTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
}

type Accent = 'UK' | 'US';

export default function SpellingTest({ word, onComplete }: SpellingTestProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [accent, setAccent] = useState<Accent>('US');
  const [rate, setRate] = useState([0.9]);
  const [volume, setVolume] = useState([1]);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const speak = (selectedAccent: Accent) => {
    if (typeof window.speechSynthesis === 'undefined') {
      toast({
        variant: 'destructive',
        title: 'TTS সমর্থিত নয়',
        description: 'আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না।',
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
    utterance.rate = rate[0];
    utterance.volume = volume[0];
    window.speechSynthesis.speak(utterance);
    inputRef.current?.focus();
  };

  useEffect(() => {
    // Preload voices
    const handleVoicesChanged = () => {
      // Speak after voices are loaded
      const timeoutId = setTimeout(() => speak('US'), 200);
      return () => clearTimeout(timeoutId);
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged(); // Also call it in case voices are already loaded

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
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
                <CardTitle className="font-headline text-2xl">বানান পরীক্ষা</CardTitle>
                <CardDescription>শব্দটি শুনুন এবং নীচে টাইপ করুন।</CardDescription>
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
                aria-label="শব্দটি শুনুন"
                >
                <Volume2 className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-4 pt-4">
              <div>
                  <Label htmlFor="rate-slider">গতি</Label>
                  <Slider id="rate-slider" min={0.5} max={2} step={0.1} value={rate} onValueChange={setRate} />
              </div>
              <div>
                  <Label htmlFor="volume-slider">ভলিউম</Label>
                  <Slider id="volume-slider" min={0} max={1} step={0.1} value={volume} onValueChange={setVolume} />
              </div>
          </div>

          <div>
            <Input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="এখানে শব্দটি টাইপ করুন..."
              className="text-center text-lg h-14"
              disabled={isSubmitted}
              aria-label="Your answer"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!answer.trim() || isSubmitted} className="ml-auto">
            জমা দিন
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
