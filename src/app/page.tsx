'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, SpellCheck, FileQuestion, Languages, Repeat, CalendarClock, Zap, Mic, Text } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/DashboardStats';
import { AddWordDialog } from '@/components/AddWordDialog';

export default function Home() {
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/learn" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">দৈনিক রিভিশন</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>আপনার 'Hard' এবং 'Medium' শব্দগুলো রিভাইস করুন। (MCQ)</CardDescription>
                </CardContent>
              </Card>
            </Link>
             <Link href="/learn?type=dynamic" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Zap className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">ডাইনামিক রিভিশন</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>বিভিন্ন ধরণের প্রশ্ন (বানান, MCQ) দিয়ে 'Hard' ও 'Medium' শব্দ রিভাইস করুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
             <Link href="/learn?type=mcq" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <FileQuestion className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">MCQ (Eng to Ban)</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>সম্পূর্ণ শব্দভান্ডার থেকে ইংরেজি শব্দের সঠিক বাংলা অর্থ বাছাই করুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/learn?type=bengali-to-english" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Languages className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">MCQ (Ban to Eng)</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>সম্পূর্ণ শব্দভান্ডার থেকে বাংলা অর্থের সঠিক ইংরেজি শব্দ বাছাই করুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/learn?type=spelling_meaning" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Text className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">বানান পরীক্ষা (অর্থ দেখে)</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>বাংলা অর্থ দেখে সঠিক ইংরেজি বানান লিখুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
             <Link href="/learn?type=spelling_listen" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Mic className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">বানান পরীক্ষা (শুনে)</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>ইংরেজি উচ্চারণ শুনে সঠিক বানানটি লিখুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/learn?type=synonym-antonym" passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Repeat className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">Synonym/Antonym Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>সমার্থক ও বিপরীতার্থক শব্দ পরীক্ষা করুন।</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/learn?date=${today}`} passHref>
              <Card className="hover:bg-card-foreground/5 transition-colors h-full">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <CalendarClock className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">আজকের শব্দ</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>আজ যোগ করা শব্দগুলো দেখুন ও এলোমেলো পরীক্ষা দিন।</CardDescription>
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
