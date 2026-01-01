'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck, Target, Percent, HelpCircle, ShieldAlert, Check, FilePlus, CalendarPlus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

export function DashboardStats() {
  const { stats, isInitialized } = useVocabulary();

  const statItems = [
    {
      title: 'Total Words',
      value: stats.totalWords,
      icon: Target,
      description: 'The total number of words in your vocabulary.',
      link: '/vocabulary',
    },
    {
      title: 'Learned Words',
      value: stats.wordsMastered,
      icon: BookCheck,
      description: "Words you've marked as 'Easy'.",
      link: '/vocabulary?learned=true',
    },
    {
      title: 'Overall Accuracy',
      value: `${stats.accuracy.toFixed(1)}%`,
      icon: Percent,
      description: 'Your accuracy across all sessions.',
      link: '#',
    },
    {
      title: 'Hard',
      value: stats.hardWords,
      icon: ShieldAlert,
      description: "Number of words in the 'Hard' category.",
      className: 'text-red-500',
      link: '/vocabulary?difficulty=Hard',
    },
    {
      title: 'Medium',
      value: stats.mediumWords,
      icon: HelpCircle,
      description: "Number of words in the 'Medium' category.",
      className: 'text-yellow-500',
      link: '/vocabulary?difficulty=Medium',
    },
    {
      title: 'Easy',
      value: stats.easyWords,
      icon: Check,
      description: "Number of words in the 'Easy' category.",
      className: 'text-green-500',
      link: '/vocabulary?difficulty=Easy',
    },
     {
      title: "Today's Words",
      value: stats.todayWords,
      icon: CalendarPlus,
      description: "Number of new words added today.",
      className: 'text-blue-500',
      link: `/vocabulary?date=${new Date().toISOString().split('T')[0]}`,
    },
  ];

  if (!isInitialized) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {statItems.map((item) => (
        <Link
          href={item.link || '#'}
          key={item.title}
          className="flex"
        >
          <Card className="h-full w-full flex flex-col hover:bg-card-foreground/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className={`text-2xl font-bold ${item.className || ''}`}>{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
