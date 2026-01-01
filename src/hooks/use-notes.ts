'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Note } from '@/types';

interface NotesState {
  notes: Note[];
  isInitialized: boolean;
  init: () => void;
  addNote: (noteData: Omit<Note, 'id' | 'createdAt'>) => boolean;
  addMultipleNotes: (notesData: Omit<Note, 'id' | 'createdAt'>[]) => { addedCount: number; skippedCount: number };
  updateNote: (noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (noteId: string) => void;
  getAllNotes: () => Note[];
}

const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      isInitialized: false,

      init: () => {
        if (get().isInitialized) return;
        set({ isInitialized: true });
      },

      addNote: (noteData) => {
        const noteId = noteData.title.toLowerCase().replace(/\s+/g, '-');
        if (get().notes.some(n => n.id === noteId)) {
          return false; // Already exists
        }
        const now = new Date().toISOString();
        const newNote: Note = {
          id: noteId,
          title: noteData.title,
          content: noteData.content,
          createdAt: now,
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
        return true;
      },
      
      addMultipleNotes: (notesData) => {
        const state = get();
        const existingNoteIds = new Set(state.notes.map(n => n.id));
        let addedCount = 0;
        let skippedCount = 0;
        const now = new Date().toISOString();
      
        const newNotes = notesData.reduce<Note[]>((acc, noteData) => {
          if (noteData && noteData.title && noteData.content) {
            const noteId = noteData.title.toLowerCase().replace(/\s+/g, '-');
            if (!existingNoteIds.has(noteId)) {
              acc.push({
                id: noteId,
                title: noteData.title,
                content: noteData.content,
                createdAt: now,
              });
              existingNoteIds.add(noteId);
              addedCount++;
            } else {
              skippedCount++;
            }
          } else {
            skippedCount++;
          }
          return acc;
        }, []);
      
        if (newNotes.length > 0) {
          set({ notes: [...state.notes, ...newNotes] });
        }
      
        return { addedCount, skippedCount };
      },

      updateNote: (noteId, updates) => {
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id === noteId) {
                // If title is updated, ID might need to change, but for simplicity we keep ID constant.
                return { ...note, ...updates };
            }
            return note;
          }),
        }));
      },

      deleteNote: (noteId) => {
        set((state) => ({
            notes: state.notes.filter((note) => note.id !== noteId),
        }));
      },

      getAllNotes: () => {
        return get().notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
    }),
    {
      name: 'lexilearn-notes',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => {
        return (state) => {
            if (state) {
                state.init();
            }
        }
      },
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);

// Custom hook to initialize the store on client-side
export const useNotes = () => {
  const store = useNotesStore();
  
  if (typeof window !== 'undefined' && !store.isInitialized) {
      store.init();
  }

  // update the return to provide sorted notes
  return {
    ...store,
    notes: store.getAllNotes(),
  };
};
