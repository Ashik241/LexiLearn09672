'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, BookCheck } from 'lucide-react';
import Link from 'next/link';

export function HardestWordsClient() {
    const { getAllWords, isInitialized } = useVocabulary();
    const router = useRouter();

    const hardestWords = useMemo(() => {
        if (!isInitialized) return [];
        const words = getAllWords();
        return words
            .map(w => ({...w, totalErrors: (w.spelling_error || 0) + (w.meaning_error || 0) + (w.grammar_error || 0) }))
            .filter(w => w.totalErrors > 0)
            .sort((a, b) => b.totalErrors - a.totalErrors);
    }, [isInitialized, getAllWords]);

    const handleRowClick = (wordId: string) => {
        router.push(`/vocabulary?word=${encodeURIComponent(wordId)}`);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">Hardest Words</CardTitle>
                <CardDescription>এখানে আপনার সবচেয়ে বেশি ভুল হওয়া শব্দগুলো দেখানো হচ্ছে।</CardDescription>
            </CardHeader>
            <CardContent>
                {hardestWords.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">এখনও কোনো কঠিন শব্দ নেই। চালিয়ে যান!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Word</TableHead>
                                    <TableHead>Part of Speech</TableHead>
                                    <TableHead className="text-right">Total Errors</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hardestWords.map(word => (
                                    <TableRow key={word.id} onClick={() => handleRowClick(word.id)} className="cursor-pointer">
                                        <TableCell className="font-medium font-code">{word.word}</TableCell>
                                        <TableCell>{word.parts_of_speech}</TableCell>
                                        <TableCell className="text-right font-bold">{word.totalErrors}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            <CardFooter className='flex-col sm:flex-row gap-2'>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
                {hardestWords.length > 0 && (
                     <Button asChild className="w-full sm:w-auto">
                        <Link href="/learn?difficulty=Hard">
                            <BookCheck className="mr-2 h-4 w-4" />
                            Exam on these words
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
