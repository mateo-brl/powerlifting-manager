import { create } from 'zustand';
import { invoke } from '../../../shared/utils/tauriWrapper';
import { Competition } from '../types';

interface CompetitionStore {
  competitions: Competition[];
  activeCompetition: Competition | null;
  setActiveCompetition: (competition: Competition | null) => void;
  loadCompetitions: () => Promise<void>;
  createCompetition: (data: {
    name: string;
    date: string;
    location?: string;
    federation: string;
    format?: 'full_power' | 'bench_only';
  }) => Promise<Competition>;
  updateCompetition: (id: string, data: Partial<Competition>) => Promise<Competition>;
  deleteCompetition: (id: string) => Promise<void>;
}

export const useCompetitionStore = create<CompetitionStore>((set) => ({
  competitions: [],
  activeCompetition: null,

  setActiveCompetition: (competition) => set({ activeCompetition: competition }),

  loadCompetitions: async () => {
    const competitions = await invoke<Competition[]>('get_competitions');
    set({ competitions });
  },

  createCompetition: async (data) => {
    const input = {
      ...data,
      location: data.location || null,
      format: data.format || 'full_power',
    };
    const competition = await invoke<Competition>('create_competition', { input });
    set((state) => ({
      competitions: [...state.competitions, competition]
    }));
    return competition;
  },

  updateCompetition: async (id, data) => {
    const competition = await invoke<Competition>('update_competition', { id, input: data });
    set((state) => ({
      competitions: state.competitions.map(c => c.id === id ? competition : c),
      activeCompetition: state.activeCompetition?.id === id ? competition : state.activeCompetition
    }));
    return competition;
  },

  deleteCompetition: async (id) => {
    await invoke('delete_competition', { id });
    set((state) => ({
      competitions: state.competitions.filter(c => c.id !== id),
      activeCompetition: state.activeCompetition?.id === id ? null : state.activeCompetition
    }));
  }
}));
