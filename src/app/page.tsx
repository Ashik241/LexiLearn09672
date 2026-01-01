'use client';

import { Header } from '@/components/layout/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { Button } from '@/components/ui/button';
import { FilePlus, BookOpenCheck, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { AddWordDialog } from '@/components/AddWordDialog';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVocabulary } from '@/hooks/use-vocabulary';

function QuickActions() {
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const { words } = useVocabulary();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:bg-card-foreground/5 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePlus className="text-primary" />
              <span>নতুন শব্দ যোগ করুন</span>
            </CardTitle>
            <CardDescription>আপনার শব্দভান্ডারে একটি বা একাধিক নতুন শব্দ যোগ করুন।</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddWordOpen(true)}>শব্দ যোগ করুন</Button>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-card-foreground/5 transition-colors">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-primary" />
                <span>রিভিশন শুরু করুন</span>
                </CardTitle>
                <CardDescription>আপনার কঠিন এবং মাঝারি শব্দগুলো ঝালিয়ে নিন।</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild disabled={words.filter(w => ['Hard', 'Medium'].includes(w.difficulty_level)).length === 0}>
                    <Link href="/learn">রিভিশন করুন</Link>
                </Button>
            </CardContent>
        </Card>

        <Card className="hover:bg-card-foreground/5 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="text-primary" />
              <span>সম্পূর্ণ তালিকা দেখুন</span>
            </CardTitle>
            <CardDescription>আপনার শব্দভান্ডারে থাকা সমস্ত শব্দ ব্রাউজ করুন।</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/vocabulary">শব্দভান্ডার দেখুন</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <AddWordDialog isOpen={isAddWordOpen} onOpenChange={setIsAddWordOpen} />
    </>
  );
}


export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">ড্যাশবোর্ড</h1>
                <p className="text-muted-foreground">আপনার শেখার অগ্রগতি এবং পরিসংখ্যান এক নজরে দেখুন।</p>
            </div>
            <DashboardStats />
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight font-headline">দ্রুত কার্যক্রম</h2>
                <p className="text-muted-foreground">এখান থেকে দ্রুত আপনার প্রয়োজনীয় কাজগুলো শুরু করুন।</p>
            </div>
            <QuickActions />
        </div>
      </main>
    </div>
  );
}
