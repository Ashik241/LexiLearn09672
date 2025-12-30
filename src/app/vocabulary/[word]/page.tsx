'use client';

import { useParams } from 'next/navigation';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function WordDetailsPage() {
  const params = useParams();
  const { getWordById, isInitialized } = useVocabulary();
  const wordId = Array.isArray(params.word) ? params.word[0] : params.word;
  const word = getWordById(wordId);

  const speak = (text: string, lang: string = 'en-US') => {
    if (typeof window.speechSynthesis === 'undefined') return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang)) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = 1;
    utterance.rate = 0.9;
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
                   <Button variant="outline" size="icon" onClick={() => speak(word.word, 'en-US')}><Volume2 className="h-5 w-5"/></Button>
                </CardTitle>
                <CardDescription className="text-lg mt-2">{word.parts_of_speech}</CardDescription>
              </div>
              <Badge className="text-lg">{word.difficulty_level}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">অর্থ (বাংলা)</h3>
              <p className="text-muted-foreground">{word.meaning}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold mb-2">উচ্চারণ</h3>
                    <div className="space-y-1 text-muted-foreground font-code">
                        <p><strong>UK:</strong> {word.accent_uk}</p>
                        <p><strong>US:</strong> {word.accent_us}</p>
                    </div>
                </div>
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
                              {word.synonyms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                          </div>
                      </div>
                  }
                  {word.antonyms && word.antonyms.length > 0 &&
                      <div>
                          <h3 className="text-xl font-semibold mb-2">Antonyms (বিপরীতার্থক শব্দ)</h3>
                          <div className="flex flex-wrap gap-2">
                              {word.antonyms.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
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
                                <span>{word.verb_forms.present_pronunciation}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => speak(word.verb_forms.present)}><Volume2 className="h-4 w-4"/></Button>
                            </div>
                            <p className="mt-1 italic">"{word.verb_forms.form_examples.present}"</p>
                        </div>
                        {/* Past Form */}
                        <div>
                            <h4 className="text-lg font-semibold text-primary">Past: {word.verb_forms.past}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-code">
                                <span>{word.verb_forms.past_pronunciation}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => speak(word.verb_forms.past)}><Volume2 className="h-4 w-4"/></Button>
                            </div>
                            <p className="mt-1 italic">"{word.verb_forms.form_examples.past}"</p>
                        </div>
                        {/* Past Participle Form */}
                        <div>
                            <h4 className="text-lg font-semibold text-primary">Past Participle: {word.verb_forms.past_participle}</h4>
                             <div className="flex items-center gap-4 text-sm text-muted-foreground font-code">
                                <span>{word.verb_forms.past_participle_pronunciation}</span>
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
