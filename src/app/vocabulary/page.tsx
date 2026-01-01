'use client';

import { Header } from '@/components/layout/Header';
import { VocabularyList } from '@/components/VocabularyList';
import { WordDetailsClient } from './WordDetailsClient';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function Loading() {
    return (
        <div className="flex justify-center items-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

function VocabularyPageContent() {
  const searchParams = useSearchParams();
  const wordId = searchParams.get('word');

  if (wordId) {
    return <WordDetailsClient wordId={wordId} />;
  }

  return <VocabularyList />;
}

export default function VocabularyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <Suspense fallback={<Loading />}>
          <VocabularyPageContent />
        </Suspense>
      </main>
    </div>
  );
}
