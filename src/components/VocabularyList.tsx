'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WordDifficulty } from '@/types';

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
    const { getAllWords, isInitialized } = useVocabulary();
    const router = useRouter();
    const words = useMemo(() => getAllWords(), [getAllWords, isInitialized]);

    if (!isInitialized) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">আপনার শব্দভান্ডার</CardTitle>
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
                    <CardTitle className="font-headline">আপনার শব্দভান্ডার</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>এখনও কোনো শব্দ যোগ করা হয়নি।</p>
                </CardContent>
            </Card>
        );
    }

    const handleRowClick = (wordId: string) => {
        router.push(`/vocabulary/${wordId}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">আপনার শব্দভান্ডার</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>শব্দ</TableHead>
                            <TableHead>অর্থ</TableHead>
                            <TableHead className="text-right">স্তর</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {words.map((word) => (
                            <TableRow key={word.id} onClick={() => handleRowClick(word.id)} className="cursor-pointer">
                                <TableCell className="font-medium font-code">{word.word}</TableCell>
                                <TableCell>{word.meaning}</TableCell>
                                <TableCell className="text-right">
                                    <Badge 
                                        variant={difficultyVariant[word.difficulty_level]}
                                        className={cn('font-bold', difficultyClass[word.difficulty_level])}
                                    >
                                        {word.difficulty_level}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
