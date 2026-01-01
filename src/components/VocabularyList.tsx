'use client';

import { useMemo, MouseEvent, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Word, WordDifficulty, TestType } from '@/types';
import { Button, buttonVariants } from './ui/button';
import Link from 'next/link';
import { Trash2, Search, MoreHorizontal, Pencil, ChevronDown, Filter, CalendarPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddWordDialog } from './AddWordDialog';


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

const examTypes: { value: TestType; label: string }[] = [
    { value: 'dynamic', label: 'Dynamic Revision' },
    { value: 'mcq', label: 'MCQ (Eng to Ban)' },
    { value: 'bengali-to-english', label: 'MCQ (Ban to Eng)' },
    { value: 'spelling_meaning', label: 'Spelling (from Meaning)' },
    { value: 'spelling_listen', label: 'Spelling (from Listening)' },
    { value: 'fill_blank_word', label: 'Fill in the Blanks (Word)' },
    { value: 'fill_blank_sentence', label: 'Fill in the Blanks (Sentence)' },
    { value: 'verb_form', label: 'Verb Form Test' },
    { value: 'synonym-antonym', label: 'Synonym/Antonym Test' },
];


export function VocabularyList() {
    const { getAllWords, isInitialized, deleteWord } = useVocabulary();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [posFilter, setPosFilter] = useState('all');
    const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
    const [wordToEdit, setWordToEdit] = useState<Word | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


    const difficultyFilter = searchParams.get('difficulty') as WordDifficulty | null;
    const dateFilter = searchParams.get('date');
    const learnedFilter = searchParams.get('learned');
    const hasFilter = difficultyFilter || dateFilter || learnedFilter;
    
    const allPos = useMemo(() => {
        if (!isInitialized) return [];
        const words = getAllWords();
        const posSet = new Set(words.map(w => w.parts_of_speech).filter(Boolean));
        return Array.from(posSet);
    }, [isInitialized, getAllWords]);

    const words = useMemo(() => {
        let allWords = getAllWords();
        if (difficultyFilter) {
            allWords = allWords.filter(word => word.difficulty_level === difficultyFilter);
        }
        if (dateFilter) {
            allWords = allWords.filter(word => word.createdAt && word.createdAt.startsWith(dateFilter));
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
                (word.synonyms && word.synonyms.some(s => s && s.word && s.word.toLowerCase().includes(lowercasedQuery))) ||
                (word.antonyms && word.antonyms.some(a => a && a.word && a.word.toLowerCase().includes(lowercasedQuery))) ||
                (word.verb_forms && (
                    (word.verb_forms.v1_present.word && word.verb_forms.v1_present.word.toLowerCase().includes(lowercasedQuery)) ||
                    (word.verb_forms.v2_past.word && word.verb_forms.v2_past.word.toLowerCase().includes(lowercasedQuery)) ||
                    (word.verb_forms.v3_past_participle.word && word.verb_forms.v3_past_participle.word.toLowerCase().includes(lowercasedQuery))
                ))
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
    
    if (words.length === 0 && !searchQuery && posFilter === 'all' && !hasFilter) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        এখনও কোনো শব্দ যোগ করা হয়নি।
                    </p>
                </CardContent>
            </Card>
        );
    }

    const handleRowClick = (wordId: string) => {
        router.push(`${pathname}?word=${encodeURIComponent(wordId)}`);
    };

    const confirmDelete = () => {
        if (wordToDelete) {
            deleteWord(wordToDelete.id);
            toast({
                title: "শব্দ মুছে ফেলা হয়েছে",
                description: `"${wordToDelete.word}" আপনার তালিকা থেকে মুছে ফেলা হয়েছে।`,
            });
            setWordToDelete(null);
        }
    };
    
    const handleEditClick = (e: MouseEvent<HTMLDivElement>, word: Word) => {
        e.stopPropagation();
        setWordToEdit(word);
        setIsEditDialogOpen(true);
    }

    const handleEditDialogChange = (open: boolean) => {
        setIsEditDialogOpen(open);
        if (!open) {
            setWordToEdit(null);
        }
    }
    
    const handleStartExam = (type: TestType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', type);
        router.push(`/learn?${params.toString()}`);
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="font-headline whitespace-nowrap">{title} ({words.length})</CardTitle>
                    <div className="flex w-full flex-wrap md:w-auto md:justify-end gap-2">
                        <div className="relative flex-grow md:flex-grow-0 w-full md:w-48">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Search words..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                           />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                    <span className="sr-only">Filter by POS</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Part of Speech</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={posFilter} onValueChange={setPosFilter}>
                                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                                    {allPos.map(pos => (
                                        <DropdownMenuRadioItem key={pos} value={pos}>{pos}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         {hasFilter && words.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        Start Exam
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Select Exam Type</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {examTypes.map((exam) => (
                                        <DropdownMenuItem key={exam.value} onClick={() => handleStartExam(exam.value)}>
                                            {exam.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {words.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">আপনার সার্চ বা ফিল্টারের সাথে মেলে এমন কোনো শব্দ পাওয়া যায়নি।</p>
                            { (difficultyFilter || dateFilter || learnedFilter || searchQuery || posFilter !== 'all') && (
                                 <Button asChild variant="outline" className="mt-4">
                                    <Link href="/vocabulary" onClick={() => { setSearchQuery(''); setPosFilter('all'); }}>Clear Filters & Search</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>শব্দ</TableHead>
                                        <TableHead>অর্থ</TableHead>
                                        <TableHead>পদ</TableHead>
                                        <TableHead className="text-center">স্তর</TableHead>
                                        <TableHead className="text-right w-[80px]">সম্পাদনা</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {words.map((word) => (
                                        <TableRow key={word.id} onClick={() => handleRowClick(word.id)} className="cursor-pointer">
                                            <TableCell className="font-medium font-code break-words">{word.word}</TableCell>
                                            <TableCell className="break-words">{word.meaning}</TableCell>
                                            <TableCell className="break-words">{word.parts_of_speech}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge 
                                                    variant={difficultyVariant[word.difficulty_level]}
                                                    className={cn('font-bold', difficultyClass[word.difficulty_level])}
                                                >
                                                    {word.difficulty_level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenuItem onClick={(e) => handleEditClick(e, word)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Edit</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setWordToDelete(word)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
            <AlertDialog open={!!wordToDelete} onOpenChange={(open) => !open && setWordToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the word "{wordToDelete?.word}" from your vocabulary.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setWordToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AddWordDialog
                isOpen={isEditDialogOpen}
                onOpenChange={handleEditDialogChange}
                wordToEdit={wordToEdit}
            />
        </>
    );
}
