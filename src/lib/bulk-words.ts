import type { Word, SynonymAntonym } from '@/types';

// Data provided by the user to be bulk-imported.
export const bulkWordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[] = [];
