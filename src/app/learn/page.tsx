import { Header } from '@/components/layout/Header';
import { LearningClient } from '@/components/LearningClient';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingFallback() {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardContent className="p-8">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-1/3 mt-6 ml-auto" />
      </CardContent>
    </Card>
  );
}

export default function LearnPage({ searchParams }: { searchParams: { type?: 'mcq' | 'spelling' } }) {
  const testType = searchParams.type;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <Suspense fallback={<LoadingFallback />}>
          <LearningClient forcedTestType={testType} />
        </Suspense>
      </main>
    </div>
  );
}
