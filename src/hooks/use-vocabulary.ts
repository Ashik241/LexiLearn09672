'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Word, WordDifficulty } from '@/types';
import { initialWordsData } from '@/lib/data';

interface VocabularyState {
  words: Word[];
  stats: {
    wordsMastered: number;
    totalWords: number;
    accuracy: number;
  };
  isInitialized: boolean;
  init: () => void;
  addWord: (wordData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>) => boolean;
  updateWord: (wordId: string, updates: Partial<Word>) => void;
  getWordForSession: () => Word | null;
  calculateStats: () => void;
}

const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      words: [],
      stats: {
        wordsMastered: 0,
        totalWords: 0,
        accuracy: 100,
      },
      isInitialized: false,

      init: () => {
        if (get().isInitialized) return;

        const initialWords: Word[] = initialWordsData.map((word) => ({
          ...word,
          id: word.word.toLowerCase(),
          difficulty_level: 'New',
          is_learned: false,
          times_correct: 0,
          times_incorrect: 0,
          last_reviewed: null,
        }));

        set({ words: initialWords, isInitialized: true });
        get().calculateStats();
      },

      addWord: (wordData) => {
        const wordId = wordData.word.toLowerCase();
        if (get().words.some(w => w.id === wordId)) {
          return false; // Word already exists
        }
        const newWord: Word = {
          ...wordData,
          id: wordId,
          difficulty_level: 'New',
          is_learned: false,
          times_correct: 0,
          times_incorrect: 0,
          last_reviewed: null,
        };
        set((state) => ({ words: [...state.words, newWord] }));
        get().calculateStats();
        return true;
      },

      updateWord: (wordId, updates) => {
        set((state) => ({
          words: state.words.map((word) =>
            word.id === wordId ? { ...word, ...updates, last_reviewed: new Date().toISOString() } : word
          ),
        }));
        get().calculateStats();
      },

      getWordForSession: () => {
        const words = get().words.filter(w => !w.is_learned);
        if (words.length === 0) return null;

        const priorityOrder: WordDifficulty[] = ['Hard', 'Medium', 'New', 'Easy'];
        
        for (const difficulty of priorityOrder) {
            const priorityWords = words.filter(w => w.difficulty_level === difficulty);
            if (priorityWords.length > 0) {
                // Sort by last reviewed date (oldest first), nulls first
                priorityWords.sort((a, b) => {
                    if (a.last_reviewed === b.last_reviewed) return 0;
                    if (a.last_reviewed === null) return -1;
                    if (b.last_reviewed === null) return 1;
                    return new Date(a.last_reviewed).getTime() - new Date(b.last_reviewed).getTime();
                });
                return priorityWords[0];
            }
        }
        
        return words[Math.floor(Math.random() * words.length)];
      },
      
      calculateStats: () => {
        const words = get().words;
        const totalWords = words.length;
        const wordsMastered = words.filter(w => w.difficulty_level === 'Easy' && w.is_learned).length;
        
        const totalAttempts = words.reduce((sum, w) => sum + w.times_correct + w.times_incorrect, 0);
        const totalCorrect = words.reduce((sum, w) => sum + w.times_correct, 0);
        const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 100;

        set({ stats: { wordsMastered, totalWords, accuracy } });
      },
    }),
    {
      name: 'lexilearn-vocabulary',
      storage: createJSONStorage(() => localStorage),
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
