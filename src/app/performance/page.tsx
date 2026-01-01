'use client';

import { Header } from '@/components/layout/Header';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">পারফরম্যান্স ড্যাশবোর্ড</h1>
                <p className="text-muted-foreground">আপনার ভুলের ধরন বিশ্লেষণ করুন এবং দুর্বলতা খুঁজে বের করুন।</p>
            </div>
            <PerformanceDashboard />
        </div>
      </main>
    </div>
  );
}
