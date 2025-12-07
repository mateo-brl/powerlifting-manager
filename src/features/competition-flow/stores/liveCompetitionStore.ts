import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LiftType } from '../types';

interface LiveCompetitionState {
  // Competition session state
  activeCompetitionId: string | null;
  currentLift: LiftType;
  currentIndex: number;
  isCompetitionActive: boolean;

  // Actions
  setActiveCompetition: (competitionId: string, initialLift?: LiftType) => void;
  setCurrentLift: (lift: LiftType) => void;
  setCurrentIndex: (index: number) => void;
  setIsCompetitionActive: (active: boolean) => void;
  resetCompetition: () => void;

  // Utility to check if a competition is the active one
  isActiveCompetition: (competitionId: string) => boolean;
}

export const useLiveCompetitionStore = create<LiveCompetitionState>()(
  persist(
    (set, get) => ({
      activeCompetitionId: null,
      currentLift: 'squat',
      currentIndex: 0,
      isCompetitionActive: false,

      setActiveCompetition: (competitionId: string, initialLift?: LiftType) => {
        const state = get();
        // Only reset if it's a different competition
        if (state.activeCompetitionId !== competitionId) {
          set({
            activeCompetitionId: competitionId,
            currentLift: initialLift || 'squat',
            currentIndex: 0,
            isCompetitionActive: false,
          });
        }
      },

      setCurrentLift: (lift: LiftType) => {
        set({ currentLift: lift, currentIndex: 0 });
      },

      setCurrentIndex: (index: number) => {
        set({ currentIndex: index });
      },

      setIsCompetitionActive: (active: boolean) => {
        set({ isCompetitionActive: active });
      },

      resetCompetition: () => {
        set({
          activeCompetitionId: null,
          currentLift: 'squat',
          currentIndex: 0,
          isCompetitionActive: false,
        });
      },

      isActiveCompetition: (competitionId: string) => {
        return get().activeCompetitionId === competitionId;
      },
    }),
    {
      name: 'live-competition-storage',
    }
  )
);
