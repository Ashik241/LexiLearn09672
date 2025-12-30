'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/DashboardStats';
import { AddWordDialog } from '@/components/AddWordDialog';

export default function Home() {
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
              Welcome to LexiLearn
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your personal offline vocabulary builder.
            </p>
          </div>
          <Link href="/learn" passHref>
            <Button size="lg" className="font-bold text-lg">
              Start Learning Session
            </Button>
          </Link>
        </div>

        <DashboardStats />
        
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>1. Start a learning session to review words using spaced repetition.</p>
              <p>2. Test your knowledge with spelling tests and multiple-choice questions.</p>
              <p>3. Incorrect answers move words to a 'Hard' category for more frequent review.</p>
              <p>4. Add your own words to customize your learning journey.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="fixed bottom-8 right-8">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setIsAddWordOpen(true)}
          aria-label="Add new word"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      <AddWordDialog isOpen={isAddWordOpen} onOpenChange={setIsAddWordOpen} />
    </div>
  );
}
