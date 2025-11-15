import { create } from 'zustand';
import { Competition } from '@/shared/types';

interface CompetitionStore {
  competitions: Competition[];
  activeCompetition: Competition | null;
  setActiveCompetition: (competition: Competition | null) => void;
  addCompetition: (competition: Competition) => void;
  updateCompetition: (id: string, data: Partial<Competition>) => void;
  deleteCompetition: (id: string) => void;
}

export const useCompetitionStore = create<CompetitionStore>((set) => ({
  competitions: [],
  activeCompetition: null,

  setActiveCompetition: (competition) => set({ activeCompetition: competition }),

  addCompetition: (competition) =>
    set((state) => ({
      competitions: [...state.competitions, competition]
    })),

  updateCompetition: (id, data) =>
    set((state) => ({
      competitions: state.competitions.map(c =>
        c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
      ),
      activeCompetition: state.activeCompetition?.id === id
        ? { ...state.activeCompetition, ...data, updated_at: new Date().toISOString() }
        : state.activeCompetition
    })),

  deleteCompetition: (id) =>
    set((state) => ({
      competitions: state.competitions.filter(c => c.id !== id),
      activeCompetition: state.activeCompetition?.id === id ? null : state.activeCompetition
    }))
}));
