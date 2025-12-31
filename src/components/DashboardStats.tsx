'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck, Target, Percent, HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

export function DashboardStats() {
  const { stats, isInitialized } = useVocabulary();

  const statItems = [
    {
      title: 'Total Words',
      value: stats.totalWords,
      icon: Target,
      description: 'আপনার শব্দভান্ডারে থাকা মোট শব্দ।',
      link: '/vocabulary',
    },
    {
      title: 'Learned Words',
      value: stats.wordsMastered,
      icon: BookCheck,
      description: "আপনার শেখা 'Easy' ক্যাটেগরির শব্দ।",
      link: '/vocabulary?learned=true',
    },
    {
      title: 'সামগ্রিক নির্ভুলতা',
      value: `${stats.accuracy.toFixed(1)}%`,
      icon: Percent,
      description: 'সব সেশনে আপনার উত্তরের নির্ভুলতার হার।',
      link: '#',
    },
    {
      title: 'Hard',
      value: stats.hardWords,
      icon: ShieldAlert,
      description: "'Hard' ক্যাটেগরিতে থাকা শব্দের সংখ্যা।",
      className: 'text-red-500',
      link: '/vocabulary?difficulty=Hard',
    },
    {
      title: 'Medium',
      value: stats.mediumWords,
      icon: HelpCircle,
      description: "'Medium' ক্যাটেগরিতে থাকা শব্দের সংখ্যা।",
      className: 'text-yellow-500',
      link: '/vocabulary?difficulty=Medium',
    },
    {
      title: 'Easy',
      value: stats.easyWords,
      icon: Check,
      description: "'Easy' ক্যাটেগরিতে থাকা শব্দের সংখ্যা।",
      className: 'text-green-500',
      link: '/vocabulary?difficulty=Easy',
    },
  ];

  if (!isInitialized) {
    return (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {statItems.map((item) => (
        <Link href={item.link || '#'} key={item.title} passHref legacyBehavior>
          <a className="flex">
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
          </a>
        </Link>
      ))}
    </div>
  );
}
