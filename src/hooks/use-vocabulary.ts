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
    easyWords: number;
    mediumWords: number;
    hardWords: number;
    newWords: number;
  };
  isInitialized: boolean;
  init: () => void;
  addWord: (wordData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>) => boolean;
  updateWord: (wordId: string, updates: Partial<Word>) => void;
  getWordForSession: (type?: 'mcq' | 'spelling') => Word | null;
  calculateStats: () => void;
  getAllWords: () => Word[];
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
        
        // Add initial data first
        initialWordsData.forEach((word) => {
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

        // If there is existing persisted data, merge it
        const existingWords = get().words;
        if (existingWords.length > 0) {
            existingWords.forEach(word => {
                wordsMap.set(word.id, word);
            });
        }
        
        const mergedWords = Array.from(wordsMap.values());

        set({ words: mergedWords, isInitialized: true });
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
        
        // Give priority to words that have never been reviewed
        const neverReviewed = words.filter(w => w.last_reviewed === null);
        if (neverReviewed.length > 0) {
            // Among never-reviewed, still use priority, but they come first
            for (const difficulty of priorityOrder) {
                const priorityWords = neverReviewed.filter(w => w.difficulty_level === difficulty);
                if (priorityWords.length > 0) {
                    return priorityWords[Math.floor(Math.random() * priorityWords.length)];
                }
            }
        }
        
        // If all words have been reviewed at least once, sort by oldest review
        for (const difficulty of priorityOrder) {
            const priorityWords = words.filter(w => w.difficulty_level === difficulty);
            if (priorityWords.length > 0) {
                priorityWords.sort((a, b) => {
                    // This should not happen if neverReviewed is handled, but as a fallback
                    if (a.last_reviewed === null) return -1;
                    if (b.last_reviewed === null) return 1;
                    return new Date(a.last_reviewed).getTime() - new Date(b.last_reviewed).getTime();
                });
                return priorityWords[0];
            }
        }
        
        // Fallback, should ideally not be reached if logic is correct
        return words[Math.floor(Math.random() * words.length)];
      },
      
      calculateStats: () => {
        const words = get().words;
        const totalWords = words.length;
        const wordsMastered = words.filter(w => w.is_learned).length;
        
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
      }
    }),
    {
      name: 'lexilearn-vocabulary',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Custom hook to initialize the store on client-side
let isInitialized = false;
export const useVocabulary = () => {
  const store = useVocabularyStore();

  if (typeof window !== 'undefined' && !isInitialized) {
    store.init();
    isInitialized = true;
  }

  return store;
};
