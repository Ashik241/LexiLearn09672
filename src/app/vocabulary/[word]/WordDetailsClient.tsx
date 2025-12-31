'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Word, VerbFormDetail } from '@/types';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Accent = 'UK' | 'US';

const VerbFormRow = ({ formName, form, onSpeak }: { formName: string; form: VerbFormDetail; onSpeak: (text: string) => void; }) => (
    <TableRow>
        <TableCell className="font-semibold">{formName}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                <span className="font-code">{form.word}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onSpeak(form.word)}><Volume2 className="h-4 w-4"/></Button>
            </div>
             <p className="text-sm text-muted-foreground">{form.pronunciation}</p>
        </TableCell>
        <TableCell>{form.bangla_meaning}</TableCell>
        <TableCell className="text-sm text-muted-foreground">{form.usage_timing}</TableCell>
    </TableRow>
);


export function WordDetailsClient({ wordId }: { wordId: string }) {
  const { getWordById, isInitialized } = useVocabulary();
  const [rate, setRate] = useState([0.9]);
  const [volume, setVolume] = useState([1]);
  const [accent, setAccent] = useState<Accent>('US');
  const [word, setWord] = useState<Word | null>(null);

  useEffect(() => {
    if (isInitialized && wordId) {
      const foundWord = getWordById(wordId);
      setWord(foundWord || { id: wordId, word: wordId, meaning: '', parts_of_speech: '' } as Word);
    }
  }, [isInitialized, wordId, getWordById]);


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

  if (!isInitialized || !word) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-grow container mx-auto p-4 md:p-8">
            <Card>
              <CardHeader>
                <CardTitle>শব্দ লোড হচ্ছে...</CardTitle>
              </CardHeader>
              <CardContent>
                <p>অনুগ্রহ করে অপেক্ষা করুন...</p>
              </CardContent>
            </Card>
          </main>
        </div>
      );
  }

  // A "real" word has a meaning. The placeholder from the logic above won't.
  if (!word.meaning) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle>শব্দ পাওয়া যায়নি</CardTitle>
            </CardHeader>
            <CardContent>
              <p>দুঃখিত, এই শব্দটি ("{word?.word}") আপনার শব্দভান্ডারে পাওয়া যায়নি।</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isVerb = word.parts_of_speech.toLowerCase().includes('verb');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-4xl font-bold font-code text-primary flex items-center gap-4 break-words">
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
              <p className="text-muted-foreground break-words">{word.meaning}</p>
            </div>
            
            {word.meaning_explanation && (
              <div className="bg-card-foreground/5 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">অর্থের ব্যাখ্যা</h3>
                <p className="text-muted-foreground italic break-words">"{word.meaning_explanation}"</p>
              </div>
            )}
            
            {word.usage_distinction && (
                <div className="bg-card-foreground/5 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">ব্যবহারের পার্থক্য</h3>
                    <p className="text-muted-foreground italic break-words">"{word.usage_distinction}"</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold mb-2">সিলেবল</h3>
                    <p className="text-muted-foreground font-code break-words">{word.syllables?.join(' · ')}</p>
                </div>
            </div>

            
            {!isVerb && (
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
                    <li key={i} className="break-words">"{sentence}"</li>
                  ))}
                </ul>
              </div>
            )}

            {isVerb && word.verb_forms && (
                <div>
                    <Separator className="my-6" />
                    <h3 className="text-2xl font-bold font-headline mb-4">Verb Forms (ক্রিয়ার রূপ)</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Form</TableHead>
                                    <TableHead>Word & Pronunciation</TableHead>
                                    <TableHead>Bengali Meaning</TableHead>
                                    <TableHead>Usage Timing</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <VerbFormRow formName="Present (V1)" form={word.verb_forms.v1_present} onSpeak={speak} />
                                <VerbFormRow formName="Past (V2)" form={word.verb_forms.v2_past} onSpeak={speak} />
                                <VerbFormRow formName="Past Participle (V3)" form={word.verb_forms.v3_past_participle} onSpeak={speak} />
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-6 space-y-4">
                        <h4 className="text-lg font-semibold">Form Examples</h4>
                        <div className="text-muted-foreground">
                            <p><strong className='text-foreground'>V1:</strong> "{word.verb_forms.form_examples.v1}"</p>
                            <p><strong className='text-foreground'>V2:</strong> "{word.verb_forms.form_examples.v2}"</p>
                            <p><strong className='text-foreground'>V3:</strong> "{word.verb_forms.form_examples.v3}"</p>
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
