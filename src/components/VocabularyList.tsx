'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WordDifficulty } from '@/types';
import { Button } from './ui/button';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const difficultyVariant: Record<WordDifficulty, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Easy': 'default',
    'Medium': 'secondary',
    'Hard': 'destructive',
    'New': 'outline',
};

const difficultyClass: Record<WordDifficulty, string> = {
    'Easy': 'bg-green-500/20 text-green-300 border-green-500/50',
    'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    'Hard': 'bg-red-500/20 text-red-300 border-red-500/50',
    'New': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
}

export function VocabularyList() {
    const { getAllWords, isInitialized, deleteWord } = useVocabulary();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const difficultyFilter = searchParams.get('difficulty') as WordDifficulty | null;

    const words = useMemo(() => {
        const allWords = getAllWords();
        if (difficultyFilter) {
            return allWords.filter(word => word.difficulty_level === difficultyFilter);
        }
        return allWords;
    }, [getAllWords, isInitialized, difficultyFilter]);

    const title = difficultyFilter ? `${difficultyFilter} Words` : 'আপনার শব্দভান্ডার';

    const handleDelete = useCallback((e: React.MouseEvent, wordId: string, word: string) => {
        e.stopPropagation();
        deleteWord(wordId);
        toast({
            title: 'শব্দ মুছে ফেলা হয়েছে',
            description: `"${word}" আপনার শব্দভান্ডার থেকে মুছে ফেলা হয়েছে।`,
        });
    }, [deleteWord, toast]);


    if (!isInitialized) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>লোড হচ্ছে...</p>
                </CardContent>
            </Card>
        );
    }
    
    if (words.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        {difficultyFilter 
                            ? `এই ক্যাটেগরিতে কোনো শব্দ পাওয়া যায়নি।`
                            : 'এখনও কোনো শব্দ যোগ করা হয়নি।'
                        }
                    </p>
                    {difficultyFilter && (
                         <Link href="/vocabulary" passHref>
                            <Button variant="outline">সব শব্দ দেখুন</Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        );
    }

    const handleRowClick = (wordId: string) => {
        router.push(`/vocabulary/${wordId}`);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="font-headline">{title}</CardTitle>
                {difficultyFilter && (
                    <Link href={`/learn?type=mcq`} passHref>
                        <Button>Start Exam</Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>শব্দ</TableHead>
                            <TableHead>অর্থ</TableHead>
                            <TableHead className="text-center">স্তর</TableHead>
                            <TableHead className="text-right">মুছুন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {words.map((word) => (
                            <TableRow key={word.id} onClick={() => handleRowClick(word.id)} className="cursor-pointer">
                                <TableCell className="font-medium font-code">{word.word}</TableCell>
                                <TableCell>{word.meaning}</TableCell>
                                <TableCell className="text-center">
                                    <Badge 
                                        variant={difficultyVariant[word.difficulty_level]}
                                        className={cn('font-bold', difficultyClass[word.difficulty_level])}
                                    >
                                        {word.difficulty_level}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    এই পদক্ষেপটি необратиযোগ্য। এটি আপনার শব্দভান্ডার থেকে "{word.word}" শব্দটি স্থায়ীভাবে মুছে ফেলবে।
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                                <AlertDialogAction onClick={(e) => handleDelete(e, word.id, word.word)}>
                                                    মুছে ফেলুন
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
