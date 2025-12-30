import { Header } from '@/components/layout/Header';
import { VocabularyList } from '@/components/VocabularyList';
import { Suspense } from 'react';

function Loading() {
    return <div>Loading vocabulary...</div>
}

export default function VocabularyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Suspense fallback={<Loading />}>
            <VocabularyList />
        </Suspense>
      </main>
    </div>
  );
}
