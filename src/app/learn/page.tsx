'use client';

import { Header } from '@/components/layout/Header';
import { LearningClient } from '@/components/LearningClient';
import { Suspense, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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

function FilterControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentDifficulty = searchParams.get('difficulty') || 'all';

  const handleFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      newParams.delete('difficulty');
    } else {
      newParams.set('difficulty', value);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <Select onValueChange={handleFilterChange} defaultValue={currentDifficulty}>
        <SelectTrigger className="w-full md:w-[280px]">
          <SelectValue placeholder="Filter words by difficulty..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Words (Default)</SelectItem>
          <SelectItem value="Hard">Hard Words</SelectItem>
          <SelectItem value="Medium">Medium Words</SelectItem>
          <SelectItem value="Easy">Easy Words</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}


export default function LearnPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <Suspense fallback={<LoadingFallback />}>
          <FilterControls />
          <LearningClient />
        </Suspense>
      </main>
    </div>
  );
}
