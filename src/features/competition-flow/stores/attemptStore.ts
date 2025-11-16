import { create } from 'zustand';
import { invoke } from '../../../shared/utils/tauriWrapper';
import { Attempt, CreateAttemptInput, UpdateAttemptInput } from '../types';

interface AttemptStore {
  attempts: Attempt[];
  loadAttempts: (competitionId: string) => Promise<void>;
  loadAthleteAttempts: (athleteId: string) => Promise<void>;
  createAttempt: (data: CreateAttemptInput) => Promise<Attempt>;
  updateAttempt: (data: UpdateAttemptInput) => Promise<Attempt>;
  deleteAttempt: (id: string) => Promise<void>;
  getAttemptsByLift: (liftType: string) => Attempt[];
  getAthleteAttempts: (athleteId: string) => Attempt[];
}

export const useAttemptStore = create<AttemptStore>((set, get) => ({
  attempts: [],

  loadAttempts: async (competitionId) => {
    const attempts = await invoke<Attempt[]>('get_attempts', { competitionId });
    set((state) => {
      const otherAttempts = state.attempts.filter(a => a.competition_id !== competitionId);
      return { attempts: [...otherAttempts, ...attempts] };
    });
  },

  loadAthleteAttempts: async (athleteId) => {
    const attempts = await invoke<Attempt[]>('get_athlete_attempts', { athleteId });
    set((state) => {
      const otherAttempts = state.attempts.filter(a => a.athlete_id !== athleteId);
      return { attempts: [...otherAttempts, ...attempts] };
    });
  },

  createAttempt: async (data) => {
    const attempt = await invoke<Attempt>('create_attempt', { input: data });
    set((state) => ({
      attempts: [...state.attempts, attempt]
    }));
    return attempt;
  },

  updateAttempt: async (data) => {
    const attempt = await invoke<Attempt>('update_attempt', { input: data });
    set((state) => ({
      attempts: state.attempts.map(a => a.id === attempt.id ? attempt : a)
    }));
    return attempt;
  },

  deleteAttempt: async (id) => {
    await invoke('delete_attempt', { id });
    set((state) => ({
      attempts: state.attempts.filter(a => a.id !== id)
    }));
  },

  getAttemptsByLift: (liftType) => {
    return get().attempts.filter(a => a.lift_type === liftType);
  },

  getAthleteAttempts: (athleteId) => {
    return get().attempts.filter(a => a.athlete_id === athleteId);
  },
}));
