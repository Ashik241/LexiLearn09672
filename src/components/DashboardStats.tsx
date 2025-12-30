'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck, Target, Percent } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function DashboardStats() {
  const { stats, isInitialized } = useVocabulary();

  const statItems = [
    {
      title: 'Words Mastered',
      value: stats.wordsMastered,
      icon: BookCheck,
      description: "Words in the 'Easy' category that you've learned.",
    },
    {
      title: 'Total Vocabulary',
      value: stats.totalWords,
      icon: Target,
      description: 'The total number of words in your learning list.',
    },
    {
      title: 'Overall Accuracy',
      value: `${stats.accuracy.toFixed(1)}%`,
      icon: Percent,
      description: 'Your accuracy across all learning sessions.',
    },
  ];

  if (!isInitialized) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
