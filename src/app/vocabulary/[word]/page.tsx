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
          wordsMap.set(id, { ...word, id });
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

  // For static export, we might not find dynamically added words here.
  // The WordDetailsClient will handle fetching it from the client-side store.
  // We still need to handle the case where the word is not in the build-time data at all.
  const initialData = word || { id: wordId, word: wordId, meaning: '', parts_of_speech: '' };


  return <WordDetailsClient initialWord={initialData as Word} />;
}
