'use client';

import { useParams } from 'next/navigation';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { initialWordsData } from '@/lib/data';
import { bulkWordsData } from '@/lib/bulk-words';

export async function generateStaticParams() {
  const allWordsToProcess = [...initialWordsData, ...bulkWordsData];
  const wordsMap = new Map();
  allWordsToProcess.forEach((word) => {
      const id = word.word.toLowerCase();
      if (!wordsMap.has(id)) {
          wordsMap.set(id, { params: { word: id } });
      }
  });

  const allWords = Array.from(wordsMap.values());
  const paths = allWords.map(word => ({
    word: word.params.word,
  }));
 
  return paths;
}


type Accent = 'UK' | 'US';


export default function WordDetailsPage() {
  const params = useParams();
  const { getWordById, isInitialized } = useVocabulary();
  const wordId = Array.isArray(params.word) ? params.word[0] : params.word;
  const word = getWordById(wordId);
  const [rate, setRate] = useState([0.9]);
  const [volume, setVolume] = useState([1]);
  const [accent, setAccent] = useState<Accent>('US');

  const speak = (text: string, selectedAccent: Accent = accent) => {
    if (typeof window.speechSynthesis === 'undefined') return;
    window.speechSynthesis.cancel(); // Cancel any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let voice;
    if (selectedAccent === 'UK') {
      voice = voices.find(v => v.lang.startsWith('en-GB')) || voices.find(v => v.lang.startsWith('en'));
    } else {
      voice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
    }

    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = 1;
    utterance.rate = rate[0];
    utterance.volume = volume[0];
    window.speechSynthesis.speak(utterance);
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle>শব্দ পাওয়া যায়নি</CardTitle>
            </CardHeader>
            <CardContent>
              <p>দুঃখিত, এই শব্দটি আপনার শব্দভান্ডারে পাওয়া যায়নি।</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-4xl font-bold font-code text-primary flex items-center gap-4">
                  {word.word}
                </CardTitle>
                <CardDescription className="text-lg mt-2">{word.parts_of_speech}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => speak(word.word)}><Volume2 className="h-5 w-5"/></Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon"><Settings className="h-5 w-5"/></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">উচ্চারণ নিয়ন্ত্রণ</h4>
                          <p className="text-sm text-muted-foreground">অ্যাক্সেন্ট, গতি এবং ভলিউম সামঞ্জস্য করুন।</p>
                        </div>
                        <div className="grid gap-2">
                            <RadioGroup value={accent} onValueChange={(value: Accent) => setAccent(value)} className="flex gap-4 pt-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="US" id="us-accent-radio" />
                                <Label htmlFor="us-accent-radio">US</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="UK" id="uk-accent-radio" />
                                <Label htmlFor="uk-accent-radio">UK</Label>
                              </div>
                            </RadioGroup>
                            <Separator className="my-2" />
                            <div>
                                <Label htmlFor="rate-slider">গতি</Label>
                                <Slider id="rate-slider" min={0.5} max={2} step={0.1} value={rate} onValueChange={setRate} />
                            </div>
                            <div>
                                <Label htmlFor="volume-slider">ভলিউম</Label>
                                <Slider id="volume-slider" min={0} max={1} step={0.1} value={volume} onValueChange={setVolume} />
                            </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Badge className="text-lg">{word.difficulty_level}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">অর্থ (বাংলা)</h3>
              <p className="text-muted-foreground">{word.meaning}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold mb-2">সিলেবল</h3>
                    <p className="text-muted-foreground font-code">{word.syllables.join(' · ')}</p>
                </div>
            </div>

            {word.parts_of_speech !== 'Verb' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {word.synonyms && word.synonyms.length > 0 &&
                      <div>
                          <h3 className="text-xl font-semibold mb-2">Synonyms (সমার্থক শব্দ)</h3>
                          <div className="flex flex-wrap gap-2">
                              {word.synonyms.map((s, i) => (
                                <Badge key={`${s.word}-${i}`} variant="secondary" className="cursor-pointer flex-col items-start h-auto p-2" onClick={() => speak(s.word)}>
                                    <span className="font-semibold text-sm">{s.word}</span>
                                    <span className="font-normal text-xs text-muted-foreground">{s.meaning}</span>
                                </Badge>
                              ))}
                          </div>
                      </div>
                  }
                  {word.antonyms && word.antonyms.length > 0 &&
                      <div>
                          <h3 className="text-xl font-semibold mb-2">Antonyms (বিপরীতার্থক শব্দ)</h3>
                          <div className="flex flex-wrap gap-2">
                              {word.antonyms.map((a, i) => (
                                <Badge key={`${a.word}-${i}`} variant="outline" className="cursor-pointer flex-col items-start h-auto p-2" onClick={() => speak(a.word)}>
                                    <span className="font-semibold text-sm">{a.word}</span>
                                    <span className="font-normal text-xs text-muted-foreground">{a.meaning}</span>
                                </Badge>
                              ))}
                          </div>
                      </div>
                  }
              </div>
            )}

            {word.example_sentences && word.example_sentences.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">সাধারণ উদাহরণ</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {word.example_sentences.map((sentence, i) => (
                    <li key={i}>"{sentence}"</li>
                  ))}
                </ul>
              </div>
            )}

            {word.verb_forms && (
                <div>
                    <Separator className="my-6" />
                    <h3 className="text-2xl font-bold font-headline mb-4">Verb Forms (ক্রিয়ার রূপ)</h3>
                    <div className="space-y-6">
                        {/* Present Form */}
                        <div>
                            <h4 className="text-lg font-semibold text-primary">Present: {word.verb_forms.present}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-code">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => speak(word.verb_forms.present)}><Volume2 className="h-4 w-4"/></Button>
                            </div>
                            <p className="mt-1 italic">"{word.verb_forms.form_examples.present}"</p>
                        </div>
                        {/* Past Form */}
                        <div>
                            <h4 className="text-lg font-semibold text-primary">Past: {word.verb_forms.past}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-code">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => speak(word.verb_forms.past)}><Volume2 className="h-4 w-4"/></Button>
                            </div>
                            <p className="mt-1 italic">"{word.verb_forms.form_examples.past}"</p>
                        </div>
                        {/* Past Participle Form */}
                        <div>
                            <h4 className="text-lg font-semibold text-primary">Past Participle: {word.verb_forms.past_participle}</h4>
                             <div className="flex items-center gap-4 text-sm text-muted-foreground font-code">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => speak(word.verb_forms.past_participle)}><Volume2 className="h-4 w-4"/></Button>
                            </div>
                            <p className="mt-1 italic">"{word.verb_forms.form_examples.past_participle}"</p>
                        </div>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
