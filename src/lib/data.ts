import type { Word } from '@/types';

// This is a sample of words to seed the local storage on first load.
export const initialWordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[] = [];
