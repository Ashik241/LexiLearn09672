'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Word, WordDifficulty } from '@/types';
import { initialWordsData } from '@/lib/data';
import { bulkWordsData } from '@/lib/bulk-words';

interface VocabularyState {
  words: Word[];
  stats: {
    wordsMastered: number;
    totalWords: number;
    accuracy: number;
    easyWords: number;
    mediumWords: number;
    hardWords: number;
    newWords: number;
  };
  isInitialized: boolean;
  init: () => void;
  addWord: (wordData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>) => boolean;
  addMultipleWords: (wordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[]) => { addedCount: number; skippedCount: number };
  updateWord: (wordId: string, updates: Partial<Word>) => void;
  deleteWord: (wordId: string) => void;
  getWordForSession: (difficulties?: WordDifficulty[], filter?: (word: Word) => boolean) => Word | null;
  calculateStats: () => void;
  getAllWords: () => Word[];
  getWordById: (id: string) => Word | undefined;
}

const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      words: [],
      stats: {
        wordsMastered: 0,
        totalWords: 0,
        accuracy: 100,
        easyWords: 0,
        mediumWords: 0,
        hardWords: 0,
        newWords: 0,
      },
      isInitialized: false,

      init: () => {
        if (get().isInitialized) return;

        const wordsMap = new Map<string, Word>();
        const allWordsToProcess = [...initialWordsData, ...bulkWordsData];

        allWordsToProcess.forEach((word) => {
          const id = word.word.toLowerCase();
          if (!wordsMap.has(id)) {
            wordsMap.set(id, {
              ...word,
              id: id,
              difficulty_level: 'New',
              is_learned: false,
              times_correct: 0,
              times_incorrect: 0,
              last_reviewed: null,
            });
          }
        });
        const initialData = Array.from(wordsMap.values());
        
        const currentState = get();
        if (currentState.words.length === 0) {
            set({ words: initialData, isInitialized: true });
        } else {
            set({ isInitialized: true });
        }
        
        get().calculateStats();
      },

      addWord: (wordData) => {
        const wordId = wordData.word.toLowerCase();
        if (get().words.some(w => w.id === wordId)) {
          return false;
        }
        const newWord: Word = {
          ...wordData,
          id: wordId,
          difficulty_level: 'New',
          is_learned: false,
          times_correct: 0,
          times_incorrect: 0,
          last_reviewed: new Date().toISOString(),
          syllables: wordData.syllables || [],
          synonyms: wordData.synonyms || [],
          antonyms: wordData.antonyms || [],
          example_sentences: wordData.example_sentences || [],
        };
        set((state) => ({ words: [...state.words, newWord] }));
        get().calculateStats();
        return true;
      },
      
      addMultipleWords: (wordsData) => {
        const currentWords = get().words;
        const existingWordIds = new Set(currentWords.map(w => w.id));
        let addedCount = 0;
        let skippedCount = 0;

        const newWords = wordsData.reduce((acc: Word[], wordData) => {
          const wordId = wordData.word.toLowerCase();
          if (!existingWordIds.has(wordId)) {
            acc.push({
              ...wordData,
              id: wordId,
              difficulty_level: 'New',
              is_learned: false,
              times_correct: 0,
              times_incorrect: 0,
              last_reviewed: new Date().toISOString(),
              syllables: wordData.syllables || [],
              synonyms: wordData.synonyms || [],
              antonyms: wordData.antonyms || [],
              example_sentences: wordData.example_sentences || [],
            });
            existingWordIds.add(wordId);
            addedCount++;
          } else {
            skippedCount++;
          }
          return acc;
        }, []);

        if (newWords.length > 0) {
            set((state) => ({ words: [...state.words, ...newWords] }));
            get().calculateStats();
        }
        
        return { addedCount, skippedCount };
      },

      updateWord: (wordId, updates) => {
        set((state) => ({
          words: state.words.map((word) =>
            word.id === wordId ? { ...word, ...updates, last_reviewed: new Date().toISOString() } : word
          ),
        }));
        get().calculateStats();
      },

      deleteWord: (wordId) => {
        set((state) => ({
            words: state.words.filter((word) => word.id !== wordId),
        }));
        get().calculateStats();
      },

      getWordForSession: (difficulties, filter) => {
        let potentialWords = get().words;

        // Apply custom filter first (e.g., for date, learned status, etc.)
        if (filter) {
            potentialWords = potentialWords.filter(filter);
        }

        // Then, if specific difficulties are provided, filter by them.
        if (difficulties && difficulties.length > 0) {
            potentialWords = potentialWords.filter(w => difficulties.includes(w.difficulty_level));
        }

        if (potentialWords.length === 0) return null;

        // Priority order for picking a word
        const priorityOrder: WordDifficulty[] = ['Hard', 'Medium', 'New', 'Easy'];
        
        for (const difficulty of priorityOrder) {
            // Find words of the current priority that haven't been reviewed or were reviewed the longest ago
            const priorityWords = potentialWords.filter(w => w.difficulty_level === difficulty);
            if (priorityWords.length > 0) {
                // Sort by last_reviewed date, nulls first (never reviewed)
                priorityWords.sort((a, b) => {
                    if (!a.last_reviewed) return -1; // a comes first
                    if (!b.last_reviewed) return 1;  // b comes first
                    return new Date(a.last_reviewed).getTime() - new Date(b.last_reviewed).getTime();
                });
                // Return the word that was reviewed the longest ago (or never)
                return priorityWords[0];
            }
        }
        
        // Fallback in case something goes wrong with the priority logic
        return potentialWords[Math.floor(Math.random() * potentialWords.length)];
      },
      
      calculateStats: () => {
        const words = get().words;
        const totalWords = words.length;
        const wordsMastered = words.filter(w => w.difficulty_level === 'Easy' && w.times_correct > 0).length; // Adjusted this logic
        
        const totalAttempts = words.reduce((sum, w) => sum + w.times_correct + w.times_incorrect, 0);
        const totalCorrect = words.reduce((sum, w) => sum + w.times_correct, 0);
        const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

        const easyWords = words.filter(w => w.difficulty_level === 'Easy').length;
        const mediumWords = words.filter(w => w.difficulty_level === 'Medium').length;
        const hardWords = words.filter(w => w.difficulty_level === 'Hard').length;
        const newWords = words.filter(w => w.difficulty_level === 'New').length;

        set({ stats: { wordsMastered, totalWords, accuracy, easyWords, mediumWords, hardWords, newWords } });
      },

      getAllWords: () => {
        return get().words.sort((a, b) => a.word.localeCompare(b.word));
      },

      getWordById: (id: string) => {
        return get().words.find(w => w.id === id);
      }
    }),
    {
      name: 'lexilearn-vocabulary',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => {
        return (state) => {
            if (state) {
                state.init();
            }
        }
      },
      partialize: (state) => ({ words: state.words }),
    }
  )
);


// Custom hook to initialize the store on client-side
export const useVocabulary = () => {
  const store = useVocabularyStore();
  
  if (typeof window !== 'undefined' && !store.isInitialized) {
      store.init();
  }

  return store;
};
