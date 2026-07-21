import { createContext, FC, useContext } from 'react';

import { useNotes } from '~/hooks/notes/useNotes';

const NoteContext = createContext<ReturnType<typeof useNotes>>({
  notes: [],
  hasMore: false,
  loadMore: async () => Promise.resolve(undefined),
  isLoading: false,
  create: () => Promise.resolve(),
  remove: () => Promise.resolve(),
  update: (id: number, text: string) => Promise.resolve(),
});

export const NoteProvider: FC = ({ children }) => {
  const notes = useNotes('');

  return <NoteContext.Provider value={notes}>{children}</NoteContext.Provider>;
};

export const useNotesContext = () => useContext(NoteContext);
