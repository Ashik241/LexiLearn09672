'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Word, WordDifficulty, VerbForms, SynonymAntonym } from '@/types';

type UpdatePayload = Partial<Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'createdAt' | 'spelling_error' | 'meaning_error' | 'grammar_error'>>;

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
    errorStats: {
      spelling: number;
      meaning: number;
      grammar: number;
    }
  };
  session: {
    reviewedIds: Set<string>;
  };
  isInitialized: boolean;
  init: () => void;
  addWord: (wordData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'createdAt' | 'spelling_error' | 'meaning_error' | 'grammar_error'>) => boolean;
  addMultipleWords: (wordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'createdAt' | 'spelling_error' | 'meaning_error' | 'grammar_error'>[]) => { addedCount: number; skippedCount: number };
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
        errorStats: { spelling: 0, meaning: 0, grammar: 0 },
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
          spelling_error: 0,
          meaning_error: 0,
          grammar_error: 0,
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
        const state = get();
        const existingWordIds = new Set(state.words.map(w => w.id));
        let addedCount = 0;
        let skippedCount = 0;
        const now = new Date().toISOString();
      
        const newWords = wordsData.reduce<Word[]>((acc, wordData) => {
          if (wordData && wordData.word) {
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
                spelling_error: 0,
                meaning_error: 0,
                grammar_error: 0,
                last_reviewed: now,
                createdAt: now,
                meaning_explanation: wordData.meaning_explanation || undefined,
                usage_distinction: wordData.usage_distinction || undefined,
                syllables: wordData.syllables || [],
                synonyms: wordData.synonyms || [],
                antonyms: wordData.antonyms || [],
                example_sentences: wordData.example_sentences || [],
                verb_forms: wordData.verb_forms || undefined,
              });
              existingWordIds.add(wordId);
              addedCount++;
            } else {
              skippedCount++;
            }
          } else {
            skippedCount++;
          }
          return acc;
        }, []);
      
        if (newWords.length > 0) {
          set({ words: [...state.words, ...newWords] });
          state.calculateStats();
        }
      
        return { addedCount, skippedCount };
      },

      updateWord: (wordId, updates) => {
        set((state) => ({
          words: state.words.map((word) => {
            if (word.id === wordId) {
                const updatedWord = { ...word, ...updates, last_reviewed: new Date().toISOString() };
                
                // Ensure complex objects are fully replaced, not merged shallowly
                if ('verb_forms' in updates) {
                    updatedWord.verb_forms = updates.verb_forms;
                }
                if ('synonyms' in updates) {
                    updatedWord.synonyms = updates.synonyms;
                }
                if ('antonyms' in updates) {
                    updatedWord.antonyms = updates.antonyms;
                }
                if ('example_sentences' in updates) {
                    updatedWord.example_sentences = updates.example_sentences;
                }
                 if ('syllables' in updates) {
                    updatedWord.syllables = updates.syllables;
                }

                return updatedWord;
            }
            return word;
          }),
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
        
        let difficultyFilteredWords = potentialWords;
        if (difficulties && difficulties.length > 0) {
            difficultyFilteredWords = potentialWords.filter(w => difficulties.includes(w.difficulty_level));
        }

        // Weighted Practice Algorithm
        const spellingErrorWords = difficultyFilteredWords.filter(w => w.spelling_error >= 3);
        if(spellingErrorWords.length > 0){
             spellingErrorWords.sort((a,b) => b.spelling_error - a.spelling_error);
             const selectedWord = spellingErrorWords[0];
             session.reviewedIds.add(selectedWord.id);
             set({ session: { reviewedIds: new Set(session.reviewedIds) } });
             return selectedWord;
        }


        if (potentialWords.length === 0) return null;

        const priorityOrder: WordDifficulty[] = ['Hard', 'Medium', 'New', 'Easy'];
        
        for (const difficulty of priorityOrder) {
            const priorityWords = difficultyFilteredWords.filter(w => w.difficulty_level === difficulty);
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
        
        // Fallback to any word if difficulty filtering yields nothing but potential words exist
        const fallbackWords = potentialWords.length > 0 ? potentialWords : get().words;
        if(fallbackWords.length === 0) return null;

        const fallbackWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
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
        
        const spelling = words.reduce((sum, w) => sum + (w.spelling_error || 0), 0);
        const meaning = words.reduce((sum, w) => sum + (w.meaning_error || 0), 0);
        const grammar = words.reduce((sum, w) => sum + (w.grammar_error || 0), 0);

        set({ stats: { wordsMastered, totalWords, accuracy, easyWords, mediumWords, hardWords, newWords, errorStats: { spelling, meaning, grammar } } });
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
      partialize: (state) => ({ 
          words: state.words.map(w => ({
              ...w,
              spelling_error: w.spelling_error || 0,
              meaning_error: w.meaning_error || 0,
              grammar_error: w.grammar_error || 0,
          })) 
      }),
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
