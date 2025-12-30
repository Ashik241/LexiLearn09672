import { initialWordsData } from '@/lib/data';
import { bulkWordsData } from '@/lib/bulk-words';
import { Header } from '@/components/layout/Header';
import { WordDetailsClient } from './WordDetailsClient';
import type { Word } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateStaticParams() {
  const allWordsToProcess = [...initialWordsData, ...bulkWordsData];
  const wordsMap = new Map();
  allWordsToProcess.forEach((word) => {
      const id = word.word.toLowerCase();
      if (!wordsMap.has(id)) {
          // Add default fields for static generation if missing
          wordsMap.set(id, {
            ...word,
            id: id,
            difficulty_level: 'New',
            is_learned: false,
            times_correct: 0,
            times_incorrect: 0,
            last_reviewed: null,
            createdAt: new Date().toISOString(),
          });
      }
  });

  const allWords = Array.from(wordsMap.values());
  const paths = allWords.map((word: any) => ({
    word: word.id,
  }));
 
  return paths;
}

// This function can be defined here as it's not a hook
const getWordById = (id: string): Word | undefined => {
    const allWordsToProcess = [...initialWordsData, ...bulkWordsData];
    const baseWord = allWordsToProcess.find(w => w.word.toLowerCase() === id);
    if (!baseWord) return undefined;
    
    // Simulate the fully formed Word object as it would be in the client state
    return {
        id: baseWord.word.toLowerCase(),
        difficulty_level: 'New',
        is_learned: false,
        times_correct: 0,
        times_incorrect: 0,
        last_reviewed: null,
        createdAt: new Date(0).toISOString(),
        ...baseWord,
        syllables: baseWord.syllables || [],
        synonyms: baseWord.synonyms || [],
        antonyms: baseWord.antonyms || [],
        example_sentences: baseWord.example_sentences || [],
    };
};


export default function WordDetailsPage({ params }: { params: { word: string } }) {
  const wordId = decodeURIComponent(params.word);
  const word = getWordById(wordId);

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

  return <WordDetailsClient word={word} />;
}
