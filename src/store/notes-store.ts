import { create } from 'zustand';

import { getDatabase } from '@/db';
import { noteSchema } from '@/schemas/note';
import type { Note } from '@/types';

type NotesState = {
  notes: Note[];
  isHydrated: boolean;
  loadNotes: () => Promise<void>;
};

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  isHydrated: false,
  loadNotes: async () => {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM notes ORDER BY created_at DESC');
    set({ notes: rows.map((row) => noteSchema.parse(row)), isHydrated: true });
  },
}));
