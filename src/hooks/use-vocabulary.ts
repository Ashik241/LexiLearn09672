'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Word, WordDifficulty } from '@/types';
import { initialWordsData } from '@/lib/data';
import { bulkWordsData } from '@/lib/bulk-words';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, writeBatch, getFirestore, onSnapshot } from 'firebase/firestore';
import { app } from '@/firebase/config';

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
  isSyncing: boolean;
  init: (user: User | null) => void;
  addWord: (wordData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>) => boolean;
  addMultipleWords: (wordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[]) => { addedCount: number; skippedCount: number };
  updateWord: (wordId: string, updates: Partial<Word>) => void;
  deleteWord: (wordId: string) => void;
  getWordForSession: (difficulties?: WordDifficulty[], filter?: (word: Word) => boolean) => Word | null;
  calculateStats: () => void;
  getAllWords: () => Word[];
  getWordById: (id: string) => Word | undefined;
  loadInitialData: () => void;
}

let firestoreUnsubscribe: (() => void) | null = null;
const db = getFirestore(app);

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
      isSyncing: true,

      loadInitialData: () => {
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
        set({ words: initialData, isInitialized: true, isSyncing: false });
        get().calculateStats();
      },

      init: (user: User | null) => {
        if (firestoreUnsubscribe) {
          firestoreUnsubscribe();
          firestoreUnsubscribe = null;
        }

        if (user) {
          set({ isSyncing: true });
          const userWordsCol = collection(db, 'users', user.uid, 'words');
          
          firestoreUnsubscribe = onSnapshot(userWordsCol, (snapshot) => {
            const serverWords = snapshot.docs.map(doc => doc.data() as Word);
            const localWords = get().words;
            const wordsMap = new Map(localWords.map(w => [w.id, w]));

            serverWords.forEach(serverWord => {
              wordsMap.set(serverWord.id, serverWord);
            });
            
            const mergedWords = Array.from(wordsMap.values());
            set({ words: mergedWords, isInitialized: true, isSyncing: false });
            get().calculateStats();
          }, (error) => {
            console.error("Firestore snapshot error:", error);
            set({ isInitialized: true, isSyncing: false });
          });
        } else {
          // Not logged in, use local data only
          get().loadInitialData();
        }
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
        let words = get().words.filter(w => !w.is_learned);
        
        if (difficulties) {
            words = words.filter(w => difficulties.includes(w.difficulty_level));
        }

        if (filter) {
            words = words.filter(filter);
        }

        if (words.length === 0) return null;

        const priorityOrder: WordDifficulty[] = ['Hard', 'Medium', 'New', 'Easy'];
        
        const neverReviewed = words.filter(w => w.last_reviewed === null);
        if (neverReviewed.length > 0) {
            for (const difficulty of priorityOrder) {
                const priorityWords = neverReviewed.filter(w => w.difficulty_level === difficulty);
                if (priorityWords.length > 0) {
                    return priorityWords[Math.floor(Math.random() * priorityWords.length)];
                }
            }
        }
        
        for (const difficulty of priorityOrder) {
            const priorityWords = words.filter(w => w.difficulty_level === difficulty);
            if (priorityWords.length > 0) {
                priorityWords.sort((a, b) => {
                    if (!a.last_reviewed) return -1;
                    if (!b.last_reviewed) return 1;
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
      },

      getWordById: (id: string) => {
        return get().words.find(w => w.id === id);
      }
    }),
    {
      name: 'lexilearn-vocabulary',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.error('An error happened during storage rehydration', error)
          } else {
            // This is called when rehydration is done.
            // We can now listen to auth changes.
            const auth = getAuth(app);
            onAuthStateChanged(auth, (user) => {
              useVocabularyStore.getState().init(user);
            });
          }
        }
      },
      partialize: (state) => ({ words: state.words }),
    }
  )
);

let isStoreInitialized = false;

// Custom hook to initialize the store on client-side
export const useVocabulary = () => {
  const store = useVocabularyStore();

  if (typeof window !== 'undefined' && !isStoreInitialized) {
     const auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        store.init(user);
      });
    isStoreInitialized = true;
  }
  
  // Sync local changes to Firestore
  if (typeof window !== 'undefined') {
    useVocabularyStore.subscribe(
      (currentState, prevState) => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user && !currentState.isSyncing) {
          const changedWords = currentState.words.filter(currentWord => {
            const prevWord = prevState.words.find(p => p.id === currentWord.id);
            return !prevWord || JSON.stringify(currentWord) !== JSON.stringify(prevWord);
          });

          const deletedWordIds = prevState.words
            .filter(p => !currentState.words.some(c => c.id === p.id))
            .map(p => p.id);

          if (changedWords.length > 0 || deletedWordIds.length > 0) {
            const batch = writeBatch(db);
            changedWords.forEach(word => {
              const docRef = doc(db, 'users', user.uid, 'words', word.id);
              batch.set(docRef, word);
            });
            deletedWordIds.forEach(wordId => {
              const docRef = doc(db, 'users', user.uid, 'words', wordId);
              batch.delete(docRef);
            });
            batch.commit().catch(console.error);
          }
        }
      }
    );
  }

  return store;
};
