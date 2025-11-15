import { create } from 'zustand';
import { Athlete } from '@/shared/types';

interface AthleteStore {
  athletes: Athlete[];
  addAthlete: (athlete: Athlete) => void;
  updateAthlete: (id: string, data: Partial<Athlete>) => void;
  deleteAthlete: (id: string) => void;
  getAthletesByCompetition: (competitionId: string) => Athlete[];
}

export const useAthleteStore = create<AthleteStore>((set, get) => ({
  athletes: [],

  addAthlete: (athlete) =>
    set((state) => ({
      athletes: [...state.athletes, athlete]
    })),

  updateAthlete: (id, data) =>
    set((state) => ({
      athletes: state.athletes.map(a =>
        a.id === id ? { ...a, ...data } : a
      )
    })),

  deleteAthlete: (id) =>
    set((state) => ({
      athletes: state.athletes.filter(a => a.id !== id)
    })),

  getAthletesByCompetition: (competitionId) =>
    get().athletes.filter(a => a.competition_id === competitionId)
}));
