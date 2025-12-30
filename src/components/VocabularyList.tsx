'use client';

import { useMemo, MouseEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WordDifficulty } from '@/types';
import { Button } from './ui/button';
import Link from 'next/link';
import { Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [posFilter, setPosFilter] = useState('all');

    const difficultyFilter = searchParams.get('difficulty') as WordDifficulty | null;
    const dateFilter = searchParams.get('date');
    const learnedFilter = searchParams.get('learned');
    
    const allPos = useMemo(() => {
        if (!isInitialized) return [];
        const words = getAllWords();
        const posSet = new Set(words.map(w => w.parts_of_speech));
        return Array.from(posSet);
    }, [isInitialized, getAllWords]);

    const words = useMemo(() => {
        let allWords = getAllWords();
        if (difficultyFilter) {
            allWords = allWords.filter(word => word.difficulty_level === difficultyFilter);
        }
        if (dateFilter) {
            allWords = allWords.filter(word => word.last_reviewed && word.last_reviewed.startsWith(dateFilter));
        }
        if (learnedFilter === 'true') {
            allWords = allWords.filter(word => word.is_learned);
        }
        if (posFilter && posFilter !== 'all') {
            allWords = allWords.filter(word => word.parts_of_speech === posFilter);
        }
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            allWords = allWords.filter(word => 
                word.word.toLowerCase().includes(lowercasedQuery) ||
                word.meaning.toLowerCase().includes(lowercasedQuery) ||
                (word.synonyms && word.synonyms.some(s => s.word.toLowerCase().includes(lowercasedQuery))) ||
                (word.antonyms && word.antonyms.some(a => a.word.toLowerCase().includes(lowercasedQuery)))
            );
        }
        return allWords;
    }, [getAllWords, difficultyFilter, dateFilter, learnedFilter, posFilter, searchQuery]);

    const title = useMemo(() => {
        if (difficultyFilter) return `${difficultyFilter} Words`;
        if (dateFilter) {
            const today = new Date().toISOString().split('T')[0];
            if (dateFilter === today) {
                return "Today's Words";
            }
            try {
                const date = new Date(dateFilter);
                return `Words from ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
            } catch {
                return 'Words from selected date';
            }
        }
        if (learnedFilter === 'true') {
            return 'Learned Words';
        }
        return 'আপনার শব্দভান্ডার';
    }, [difficultyFilter, dateFilter, learnedFilter]);
    
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
    
    if (words.length === 0 && !searchQuery && posFilter === 'all') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        {difficultyFilter || dateFilter || learnedFilter
                            ? `এই ক্যাটেগরিতে কোনো শব্দ পাওয়া যায়নি।`
                            : 'এখনও কোনো শব্দ যোগ করা হয়নি।'
                        }
                    </p>
                    { (difficultyFilter || dateFilter || learnedFilter) && (
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

    const handleDelete = (e: MouseEvent<HTMLButtonElement>, wordId: string, word: string) => {
        e.stopPropagation();
        deleteWord(wordId);
        toast({
            title: "শব্দ মুছে ফেলা হয়েছে",
            description: `"${word}" আপনার তালিকা থেকে মুছে ফেলা হয়েছে।`,
        })
    }

    const hasFilter = difficultyFilter || dateFilter || learnedFilter;

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="font-headline whitespace-nowrap">{title}</CardTitle>
                <div className="flex w-full md:w-auto md:justify-end gap-2">
                    <div className="relative w-full md:w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input 
                            placeholder="Search words..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                       />
                    </div>
                    <Select value={posFilter} onValueChange={setPosFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Parts of Speech" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Parts of Speech</SelectItem>
                            {allPos.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     {hasFilter && (
                        <Link href={`/learn?type=mcq${difficultyFilter ? `&difficulty=${difficultyFilter}` : ''}${dateFilter ? `&date=${dateFilter}` : ''}${learnedFilter ? '&learned=true' : ''}`} passHref>
                            <Button>Start Exam</Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {words.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">আপনার সার্চের সাথে মেলে এমন কোনো শব্দ পাওয়া যায়নি।</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>শব্দ</TableHead>
                                <TableHead>অর্থ</TableHead>
                                <TableHead className="text-center">স্তর</TableHead>
                                <TableHead className="text-right">সম্পাদনা</TableHead>
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
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={(e) => handleDelete(e, word.id, word.word)}
                                            aria-label="Delete word"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
