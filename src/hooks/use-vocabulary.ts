'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Word, WordDifficulty } from '@/types';

type UpdatePayload = Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'createdAt'>;

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
  session: {
    reviewedIds: Set<string>;
  };
  isInitialized: boolean;
  init: () => void;
  addWord: (wordData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'createdAt'>) => boolean;
  addMultipleWords: (wordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'createdAt'>[]) => { addedCount: number; skippedCount: number };
  updateWord: (wordId: string, updates: Partial<Word> | UpdatePayload) => void;
  deleteWord: (wordId: string) => void;
  deleteAllWords: () => void;
  getWordForSession: (difficulties: WordDifficulty[], filter?: ((word: Word) => boolean) | undefined) => Word | null;
  calculateStats: () => void;
  getAllWords: () => Word[];
  getWordById: (id: string) => Word | undefined;
  resetSession: () => void;
  getSessionProgress: (difficulties: WordDifficulty[], filter?: (word: Word) => boolean) => { reviewed: number, total: number };
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
      session: {
        reviewedIds: new Set(),
      },
      isInitialized: false,

      init: () => {
        if (get().isInitialized) return;
        set({ isInitialized: true });
        get().calculateStats();
      },

      addWord: (wordData) => {
        const wordId = wordData.word.toLowerCase();
        if (get().words.some(w => w.id === wordId)) {
          return false;
        }
        const now = new Date().toISOString();
        const newWord: Word = {
          id: wordId,
          word: wordData.word,
          meaning: wordData.meaning,
          parts_of_speech: wordData.parts_of_speech,
          difficulty_level: 'New',
          is_learned: false,
          times_correct: 0,
          times_incorrect: 0,
          last_reviewed: now,
          createdAt: now,
          meaning_explanation: wordData.meaning_explanation || '',
          usage_distinction: wordData.usage_distinction || '',
          syllables: wordData.syllables || [],
          synonyms: wordData.synonyms || [],
          antonyms: wordData.antonyms || [],
          example_sentences: wordData.example_sentences || [],
          verb_forms: wordData.verb_forms,
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
        const now = new Date().toISOString();

        const newWords = wordsData.reduce((acc: Word[], wordData) => {
          const wordId = wordData.word.toLowerCase();
          if (!existingWordIds.has(wordId)) {
            acc.push({
              id: wordId,
              word: wordData.word,
              meaning: wordData.meaning,
              parts_of_speech: wordData.parts_of_speech,
              difficulty_level: 'New',
              is_learned: false,
              times_correct: 0,
              times_incorrect: 0,
              last_reviewed: now,
              createdAt: now,
              meaning_explanation: wordData.meaning_explanation || '',
              usage_distinction: wordData.usage_distinction || '',
              syllables: wordData.syllables || [],
              synonyms: wordData.synonyms || [],
              antonyms: wordData.antonyms || [],
              example_sentences: wordData.example_sentences || [],
              verb_forms: wordData.verb_forms,
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
      
      deleteAllWords: () => {
        set({ words: [] });
        get().calculateStats();
      },

      getWordForSession: (difficulties, filter) => {
        const { session } = get();
        let potentialWords = get().words.filter(w => !session.reviewedIds.has(w.id));

        if (filter) {
            potentialWords = potentialWords.filter(filter);
        }

        if (difficulties && difficulties.length > 0) {
            potentialWords = potentialWords.filter(w => difficulties.includes(w.difficulty_level));
        }

        if (potentialWords.length === 0) return null;

        const priorityOrder: WordDifficulty[] = ['Hard', 'Medium', 'New', 'Easy'];
        
        for (const difficulty of priorityOrder) {
            const priorityWords = potentialWords.filter(w => w.difficulty_level === difficulty);
            if (priorityWords.length > 0) {
                priorityWords.sort((a, b) => {
                    if (!a.last_reviewed) return -1;
                    if (!b.last_reviewed) return 1;
                    return new Date(a.last_reviewed).getTime() - new Date(b.last_reviewed).getTime();
                });
                const selectedWord = priorityWords[0];
                session.reviewedIds.add(selectedWord.id);
                set({ session: { reviewedIds: new Set(session.reviewedIds) } });
                return selectedWord;
            }
        }
        
        const fallbackWord = potentialWords[Math.floor(Math.random() * potentialWords.length)];
        if (fallbackWord) {
             session.reviewedIds.add(fallbackWord.id);
             set({ session: { reviewedIds: new Set(session.reviewedIds) } });
             return fallbackWord;
        }
       return null;
      },
      
      calculateStats: () => {
        const words = get().words;
        const totalWords = words.length;
        const wordsMastered = words.filter(w => w.difficulty_level === 'Easy' && w.times_correct > 0).length;
        
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
      },

      resetSession: () => {
        set({ session: { reviewedIds: new Set() } });
      },

      getSessionProgress: (difficulties, filter) => {
        const { session, words } = get();
        let potentialWords = words;
        if (filter) {
            potentialWords = potentialWords.filter(filter);
        }
        if (difficulties && difficulties.length > 0) {
            potentialWords = potentialWords.filter(w => difficulties.includes(w.difficulty_level));
        }

        return {
            reviewed: session.reviewedIds.size,
            total: potentialWords.length,
        }
      }
    }),
    {
      name: 'lexilearn-vocabulary',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => {
        return (state) => {
            if (state) {
                // Ensure session is fresh on rehydration
                state.session = { reviewedIds: new Set() };
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
