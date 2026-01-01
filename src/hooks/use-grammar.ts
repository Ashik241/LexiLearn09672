'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GrammarTopic, GrammarNote } from '@/types';
import { initialGrammarData } from '@/lib/grammarData';

interface GrammarState {
  topics: GrammarTopic[];
  notes: Record<string, GrammarNote>;
  bookmarks: Set<string>;
  isInitialized: boolean;
  init: () => void;
  addNote: (topicId: string, content: string) => void;
  toggleBookmark: (topicId: string) => void;
}

const useGrammarStore = create<GrammarState>()(
  persist(
    (set, get) => ({
      topics: [],
      notes: {},
      bookmarks: new Set(),
      isInitialized: false,

      init: () => {
        if (get().isInitialized) return;
        set({
          topics: initialGrammarData,
          isInitialized: true,
        });
      },

      addNote: (topicId, content) => {
        const newNote: GrammarNote = {
          id: topicId,
          topicId,
          content,
          lastUpdated: new Date().toISOString(),
        };
        set((state) => ({
          notes: {
            ...state.notes,
            [topicId]: newNote,
          },
        }));
      },

      toggleBookmark: (topicId) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          if (newBookmarks.has(topicId)) {
            newBookmarks.delete(topicId);
          } else {
            newBookmarks.add(topicId);
          }
          return { bookmarks: newBookmarks };
        });
      },
    }),
    {
      name: 'grammar-handbook-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist notes and bookmarks, topics are loaded from JSON
        notes: state.notes,
        bookmarks: state.bookmarks,
      }),
       onRehydrateStorage: () => {
        return (state) => {
            if (state) {
                // Manually re-initialize non-persisted state
                state.init();
            }
        }
      },
    }
  )
);

export const useGrammar = () => {
  const store = useGrammarStore();
  
  if (typeof window !== 'undefined' && !store.isInitialized) {
    store.init();
  }

  return store;
};
