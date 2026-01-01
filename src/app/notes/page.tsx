'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Notebook } from 'lucide-react';

export default function NotesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                    <Notebook className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="mt-4">নোট</CardTitle>
                <CardDescription>
                    এই ফিচারটি শীঘ্রই আসছে। এখানে আপনি আপনার নিজস্ব নোট সংরক্ষণ করতে পারবেন।
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">নির্মাণাধীন...</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
