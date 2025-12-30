'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck, Target, Percent, HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function DashboardStats() {
  const { stats, isInitialized } = useVocabulary();

  const statItems = [
    {
      title: 'মোট শব্দ',
      value: stats.totalWords,
      icon: Target,
      description: 'আপনার শব্দভান্ডারে থাকা মোট শব্দ।',
    },
    {
      title: 'শেখা হয়েছে',
      value: stats.wordsMastered,
      icon: BookCheck,
      description: "আপনার শেখা 'Easy' ক্যাটেগরির শব্দ।",
    },
    {
      title: 'সামগ্রিক নির্ভুলতা',
      value: `${stats.accuracy.toFixed(1)}%`,
      icon: Percent,
      description: 'সব সেশনে আপনার উত্তরের নির্ভুলতার হার।',
    },
    {
      title: 'কঠিন',
      value: stats.hardWords,
      icon: ShieldAlert,
      description: "'Hard' ক্যাটেগরিতে থাকা শব্দের সংখ্যা।",
      className: 'text-red-500'
    },
    {
      title: 'Medium',
      value: stats.mediumWords,
      icon: HelpCircle,
      description: "'Medium' ক্যাটেগরিতে থাকা শব্দের সংখ্যা।",
       className: 'text-yellow-500'
    },
    {
      title: 'সহজ',
      value: stats.easyWords,
      icon: Check,
      description: "'Easy' ক্যাটেগরিতে থাকা শব্দের সংখ্যা।",
      className: 'text-green-500'
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
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.className || ''}`}>{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
