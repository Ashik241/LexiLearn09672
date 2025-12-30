'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, SpellCheck, FileQuestion } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
              LexiLearn-এ স্বাগতম
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              আপনার ব্যক্তিগত শব্দভান্ডার তৈরির সহকারী।
            </p>
          </div>
        </div>

        <DashboardStats />

        <div className="mt-12">
          <h2 className="text-2xl font-bold font-headline mb-4">লার্নিং সেশন শুরু করুন</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/learn" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">দৈনিক রিভিশন</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>আপনার 'Hard' এবং 'Medium' শব্দগুলো রিভাইস করুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
             <Link href="/learn?type=mcq" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <FileQuestion className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">MCQ টেস্ট</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>একাধিক পছন্দের প্রশ্নের মাধ্যমে অনুশীলন করুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
             <Link href="/learn?type=spelling" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <SpellCheck className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">বানান পরীক্ষা</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>বানান অনুশীলনের মাধ্যমে আপনার দক্ষতা বাড়ান।</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
        
      </main>

      <div className="fixed bottom-8 right-8 z-20">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setIsAddWordOpen(true)}
          aria-label="নতুন শব্দ যোগ করুন"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      <AddWordDialog isOpen={isAddWordOpen} onOpenChange={setIsAddWordOpen} />
    </div>
  );
}
