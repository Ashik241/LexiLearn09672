'use client';

import { WordDetailsClient } from './WordDetailsClient';
import type { Word } from '@/types';
import { useParams } from 'next/navigation';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { useEffect, useState } from 'react';

// generateStaticParams is removed to handle all routes dynamically on the client.

export default function WordDetailsPage() {
  const params = useParams();
  const { getWordById, isInitialized } = useVocabulary();
  const [wordData, setWordData] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const wordId = typeof params.word === 'string' ? decodeURIComponent(params.word) : '';

  useEffect(() => {
    if (isInitialized && wordId) {
      const foundWord = getWordById(wordId);
      if (foundWord) {
        setWordData(foundWord);
      } else {
        // Create a placeholder for WordDetailsClient to handle the 'not found' case
        setWordData({ id: wordId, word: wordId, meaning: '', parts_of_speech: '' } as Word);
      }
      setIsLoading(false);
    }
  }, [isInitialized, wordId, getWordById]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
          <div className="flex-grow container mx-auto p-4 md:p-8">
            <p>Loading word details...</p>
          </div>
      </div>
    );
  }

  return <WordDetailsClient word={wordData} />;
}
