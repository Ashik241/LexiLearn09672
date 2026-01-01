'use client';

import { Header } from '@/components/layout/Header';
import { LearningClient } from '@/components/LearningClient';
import { Suspense } from 'react';
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
import type { TestType } from '@/types';

function LoadingFallback() {
  return (
    <Card className="w-full mx-auto mt-8">
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

const examTypes: { value: TestType; label: string }[] = [
    { value: 'dynamic', label: 'Dynamic Revision' },
    { value: 'mcq', label: 'MCQ (Eng to Ban)' },
    { value: 'bengali-to-english', label: 'MCQ (Ban to Eng)' },
    { value: 'spelling_meaning', label: 'Spelling (from Meaning)' },
    { value: 'spelling_listen', label: 'Spelling (from Listening)' },
    { value: 'fill_blank_word', label: 'Fill in the Blanks (Word)' },
    { value: 'fill_blank_sentence', label: 'Fill in the Blanks (Sentence)' },
    { value: 'verb_form', label: 'Verb Form Test' },
    { value: 'synonym-antonym', label: 'Synonym/Antonym Test' },
];

function FilterControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const getCurrentDifficultyFilter = () => {
    const difficulty = searchParams.get('difficulty');
    const date = searchParams.get('date');
    if (difficulty) return difficulty;
    if (date === new Date().toISOString().split('T')[0]) return 'today';
    return 'all';
  };
  const currentDifficultyFilter = getCurrentDifficultyFilter();
  const currentTestTypeFilter = searchParams.get('type') || 'dynamic';

  const handleDifficultyFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('difficulty');
    newParams.delete('date');

    if (value === 'all') {
      // no params needed
    } else if (value === 'today') {
      newParams.set('date', new Date().toISOString().split('T')[0]);
    } else if (['Hard', 'Medium', 'Easy'].includes(value)) {
      newParams.set('difficulty', value);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const handleTestTypeFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === 'dynamic') {
      newParams.delete('type');
    } else {
      newParams.set('type', value);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="w-full mx-auto mb-4 flex flex-col md:flex-row gap-2">
      <Select onValueChange={handleDifficultyFilterChange} value={currentDifficultyFilter}>
        <SelectTrigger className="w-full md:w-[280px]">
          <SelectValue placeholder="Filter words by difficulty..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Words (Default)</SelectItem>
          <SelectItem value="today">Today's Words</SelectItem>
          <SelectItem value="Hard">Hard Words</SelectItem>
          <SelectItem value="Medium">Medium Words</SelectItem>
          <SelectItem value="Easy">Easy Words</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={handleTestTypeFilterChange} value={currentTestTypeFilter}>
        <SelectTrigger className="w-full md:w-[280px]">
          <SelectValue placeholder="Select Exam Type..." />
        </SelectTrigger>
        <SelectContent>
            {examTypes.map((exam) => (
                <SelectItem key={exam.value} value={exam.value}>
                    {exam.label}
                </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}


export default function LearnPage() {
  return (
    <main className="flex-1 flex flex-col">
      <Header />
      <div className="flex-grow p-4 md:p-8 flex flex-col items-center">
        <Suspense fallback={<LoadingFallback />}>
          <FilterControls />
          <LearningClient />
        </Suspense>
      </div>
    </main>
  );
}
