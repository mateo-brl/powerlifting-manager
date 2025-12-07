import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LiftType } from '../types';

interface Declaration {
  athlete_id: string;
  lift_type: LiftType;
  attempt_number: 1 | 2 | 3;
  weight_kg: number;
  declared_at: string;
}

interface DeclarationStore {
  declarations: Declaration[];

  // Set a weight declaration for an athlete's next attempt
  setDeclaration: (
    athleteId: string,
    liftType: LiftType,
    attemptNumber: 1 | 2 | 3,
    weightKg: number
  ) => void;

  // Get the declared weight for an athlete's attempt
  getDeclaration: (
    athleteId: string,
    liftType: LiftType,
    attemptNumber: 1 | 2 | 3
  ) => number | undefined;

  // Clear all declarations for a competition (when starting fresh)
  clearDeclarations: () => void;

  // Clear declarations for a specific lift type
  clearDeclarationsForLift: (liftType: LiftType) => void;
}

export const useDeclarationStore = create<DeclarationStore>()(
  persist(
    (set, get) => ({
      declarations: [],

      setDeclaration: (athleteId, liftType, attemptNumber, weightKg) => {
        set((state) => {
          // Remove existing declaration for this athlete/lift/attempt
          const filtered = state.declarations.filter(
            (d) =>
              !(d.athlete_id === athleteId &&
                d.lift_type === liftType &&
                d.attempt_number === attemptNumber)
          );

          // Add new declaration
          return {
            declarations: [
              ...filtered,
              {
                athlete_id: athleteId,
                lift_type: liftType,
                attempt_number: attemptNumber,
                weight_kg: weightKg,
                declared_at: new Date().toISOString(),
              },
            ],
          };
        });
      },

      getDeclaration: (athleteId, liftType, attemptNumber) => {
        const declaration = get().declarations.find(
          (d) =>
            d.athlete_id === athleteId &&
            d.lift_type === liftType &&
            d.attempt_number === attemptNumber
        );
        return declaration?.weight_kg;
      },

      clearDeclarations: () => {
        set({ declarations: [] });
      },

      clearDeclarationsForLift: (liftType) => {
        set((state) => ({
          declarations: state.declarations.filter((d) => d.lift_type !== liftType),
        }));
      },
    }),
    {
      name: 'declaration-storage',
    }
  )
);
