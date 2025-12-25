import { useState, useEffect } from 'react';
import { useAthleteStore } from '../../../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../../../weigh-in/stores/weighInStore';
import { useAttemptStore } from '../../../stores/attemptStore';
import { useDeclarationStore } from '../../../stores/declarationStore';
import { calculateAttemptOrder } from '../../../utils/attemptOrdering';
import { LiftType } from '../../../types';
import { AttemptOrder } from '../../../../weigh-in/types';

export interface UseAttemptOrderingParams {
  competitionId: string | undefined;
  currentLift: LiftType;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  refreshKey?: number;
  orderVersion?: number;
}

export interface UseAttemptOrderingReturn {
  attemptOrder: AttemptOrder[];
  currentAttempt: AttemptOrder | undefined;
  hasAttempts: boolean;
  competitionAthletes: any[];
  competitionWeighIns: any[];
}

/**
 * Hook to calculate and manage attempt ordering
 * Handles ordering logic, declarations, and attempt progression
 */
export function useAttemptOrdering({
  competitionId,
  currentLift,
  currentIndex,
  setCurrentIndex,
  refreshKey = 0,
  orderVersion = 0,
}: UseAttemptOrderingParams): UseAttemptOrderingReturn {
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns } = useWeighInStore();
  const { attempts, loadAttempts } = useAttemptStore();
  const { getDeclaration } = useDeclarationStore();

  const [attemptOrder, setAttemptOrder] = useState<AttemptOrder[]>([]);

  // Load data when competition changes
  useEffect(() => {
    if (competitionId) {
      loadAthletes(competitionId);
      loadWeighIns(competitionId);
      loadAttempts(competitionId);
    }
  }, [competitionId, loadAthletes, loadWeighIns, loadAttempts]);

  const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
  const competitionWeighIns = weighIns.filter(w => w.competition_id === competitionId);

  // Calculate attempt order when lift type changes or new attempts are made
  useEffect(() => {
    if (competitionWeighIns.length === 0) return;

    // Get all athletes who haven't completed this lift
    const athletesForLift = competitionAthletes.filter(athlete => {
      const athleteAttempts = attempts.filter(
        a => a.athlete_id === athlete.id && a.lift_type === currentLift
      );
      return athleteAttempts.length < 3; // Still has attempts remaining
    });

    // Create attempt data
    const attemptData = athletesForLift.map(athlete => {
      const weighIn = competitionWeighIns.find(w => w.athlete_id === athlete.id);
      const athleteAttempts = attempts.filter(
        a => a.athlete_id === athlete.id && a.lift_type === currentLift
      );

      const attemptNumber = (athleteAttempts.length + 1) as 1 | 2 | 3;

      // Determine weight for next attempt
      let weight: number;

      // First check if there's a declaration for this attempt
      const declaredWeight = getDeclaration(athlete.id, currentLift, attemptNumber);

      if (declaredWeight) {
        // Use declared weight
        weight = declaredWeight;
      } else if (attemptNumber === 1) {
        // Opening attempt
        weight = weighIn?.[`opening_${currentLift}` as keyof typeof weighIn] as number || 40;
      } else {
        // Find the last successful attempt or the last attempt
        const lastSuccessful = [...athleteAttempts]
          .filter(a => a.result === 'success')
          .sort((a, b) => b.weight_kg - a.weight_kg)[0];

        if (lastSuccessful) {
          weight = lastSuccessful.weight_kg + 2.5; // Add minimum increment
        } else {
          // Last attempt failed, keep same weight or add increment
          const lastAttempt = athleteAttempts[athleteAttempts.length - 1];
          weight = lastAttempt.weight_kg;
        }
      }

      return {
        athlete_id: athlete.id,
        attempt_number: attemptNumber,
        weight_kg: weight,
      };
    });

    const ordered = calculateAttemptOrder(attemptData, competitionAthletes);

    // Enrich with weigh-in data (rack heights)
    const enrichedOrdered = ordered.map(attempt => {
      const weighIn = competitionWeighIns.find(w => w.athlete_id === attempt.athlete_id);
      return {
        ...attempt,
        rack_height: currentLift === 'squat' ? weighIn?.squat_rack_height :
                    currentLift === 'bench' ? weighIn?.bench_rack_height : undefined,
        safety_height: currentLift === 'bench' ? weighIn?.bench_safety_height : undefined,
      };
    });

    setAttemptOrder(enrichedOrdered);

    // Reset index if we're past the end
    if (currentIndex >= ordered.length) {
      setCurrentIndex(0);
    }
  }, [
    currentLift,
    competitionAthletes,
    competitionWeighIns,
    attempts,
    getDeclaration,
    refreshKey,
    orderVersion,
    currentIndex,
    setCurrentIndex,
  ]);

  const currentAttempt = attemptOrder[currentIndex];
  const hasAttempts = attemptOrder.length > 0;

  return {
    attemptOrder,
    currentAttempt,
    hasAttempts,
    competitionAthletes,
    competitionWeighIns,
  };
}
