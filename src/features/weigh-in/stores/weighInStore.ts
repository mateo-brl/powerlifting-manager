import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { WeighIn, CreateWeighInInput } from '../types';

interface WeighInStore {
  weighIns: WeighIn[];
  loadWeighIns: (competitionId: string) => Promise<void>;
  createWeighIn: (data: CreateWeighInInput) => Promise<WeighIn>;
  deleteWeighIn: (id: string) => Promise<void>;
  getWeighInByAthlete: (athleteId: string) => WeighIn | undefined;
}

export const useWeighInStore = create<WeighInStore>((set, get) => ({
  weighIns: [],

  loadWeighIns: async (competitionId) => {
    const weighIns = await invoke<WeighIn[]>('get_weigh_ins', { competitionId });
    set((state) => {
      const otherWeighIns = state.weighIns.filter(w => w.competition_id !== competitionId);
      return { weighIns: [...otherWeighIns, ...weighIns] };
    });
  },

  createWeighIn: async (data) => {
    const weighIn = await invoke<WeighIn>('create_weigh_in', { input: data });
    set((state) => ({
      weighIns: [...state.weighIns, weighIn]
    }));
    return weighIn;
  },

  deleteWeighIn: async (id) => {
    await invoke('delete_weigh_in', { id });
    set((state) => ({
      weighIns: state.weighIns.filter(w => w.id !== id)
    }));
  },

  getWeighInByAthlete: (athleteId) => {
    return get().weighIns.find(w => w.athlete_id === athleteId);
  }
}));
