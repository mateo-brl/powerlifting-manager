import { create } from 'zustand';
import { invoke } from '../../../shared/utils/tauriWrapper';
import { Athlete } from '../types';

interface AthleteStore {
  athletes: Athlete[];
  loadAthletes: (competitionId: string) => Promise<void>;
  createAthlete: (data: any) => Promise<Athlete>;
  updateAthlete: (id: string, data: any) => Promise<Athlete>;
  deleteAthlete: (id: string) => Promise<void>;
  getAthletesByCompetition: (competitionId: string) => Athlete[];
}

export const useAthleteStore = create<AthleteStore>((set, get) => ({
  athletes: [],

  loadAthletes: async (competitionId) => {
    const athletes = await invoke<Athlete[]>('get_athletes', { competitionId });
    // Merge with existing athletes from other competitions
    set((state) => {
      const otherAthletes = state.athletes.filter(a => a.competition_id !== competitionId);
      return { athletes: [...otherAthletes, ...athletes] };
    });
  },

  createAthlete: async (data) => {
    const athlete = await invoke<Athlete>('create_athlete', { input: data });
    set((state) => ({
      athletes: [...state.athletes, athlete]
    }));
    return athlete;
  },

  updateAthlete: async (id, data) => {
    const athlete = await invoke<Athlete>('update_athlete', { id, input: data });
    set((state) => ({
      athletes: state.athletes.map(a => a.id === id ? athlete : a)
    }));
    return athlete;
  },

  deleteAthlete: async (id) => {
    await invoke('delete_athlete', { id });
    set((state) => ({
      athletes: state.athletes.filter(a => a.id !== id)
    }));
  },

  getAthletesByCompetition: (competitionId) =>
    get().athletes.filter(a => a.competition_id === competitionId)
}));
