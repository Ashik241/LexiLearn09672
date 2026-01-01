'use client';
import { Header } from '@/components/layout/Header';
import { HardestWordsClient } from '@/components/HardestWordsClient';

export default function HardestWordsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow p-4 md:p-8">
                <HardestWordsClient />
            </main>
        </div>
    );
}
