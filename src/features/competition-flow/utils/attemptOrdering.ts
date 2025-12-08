import { Athlete } from '../../athlete/types';
import { AttemptOrder } from '../../weigh-in/types';

interface AttemptData {
  athlete_id: string;
  attempt_number: 1 | 2 | 3;
  weight_kg: number;
}

/**
 * Calcule l'ordre de passage selon les règles IPF:
 *
 * IMPORTANT: Round-robin par essai
 * - Tous les 1ers essais d'abord (triés par poids, puis lot)
 * - Puis tous les 2èmes essais (triés par poids, puis lot)
 * - Puis tous les 3èmes essais (triés par poids, puis lot)
 *
 * Dans chaque round:
 * 1. Tri par poids demandé (croissant)
 * 2. À poids égal: tri par numéro de lot (croissant)
 */
export function calculateAttemptOrder(
  attempts: AttemptData[],
  athletes: Athlete[]
): AttemptOrder[] {
  const athleteMap = new Map(athletes.map(a => [a.id, a]));

  const mappedAttempts = attempts
    .map(attempt => {
      const athlete = athleteMap.get(attempt.athlete_id);
      if (!athlete) return null;

      return {
        athlete_id: attempt.athlete_id,
        athlete_name: `${athlete.last_name}, ${athlete.first_name}`,
        attempt_number: attempt.attempt_number,
        weight_kg: attempt.weight_kg,
        lot_number: athlete.lot_number || 999,
        rack_height: undefined,
      } as AttemptOrder;
    })
    .filter((item): item is AttemptOrder => item !== null);

  // Tri IPF: d'abord par numéro d'essai (round-robin), puis par poids, puis par lot
  const orderedAttempts = mappedAttempts.sort((a, b) => {
    // 1. D'abord par numéro d'essai (tous les 1ers, puis 2èmes, puis 3èmes)
    if (a.attempt_number !== b.attempt_number) {
      return a.attempt_number - b.attempt_number;
    }
    // 2. Dans le même essai, tri par poids croissant
    if (a.weight_kg !== b.weight_kg) {
      return a.weight_kg - b.weight_kg;
    }
    // 3. À poids égal, tri par numéro de lot
    return a.lot_number - b.lot_number;
  });

  return orderedAttempts;
}

/**
 * V�rifie si un changement de tentative est autoris�
 * R�gle IPF: changement autoris� jusqu'� 3 athl�tes avant
 */
export function canChangeAttempt(
  athleteId: string,
  currentOrder: AttemptOrder[],
  currentIndex: number
): { allowed: boolean; reason?: string } {
  const athletePosition = currentOrder.findIndex(a => a.athlete_id === athleteId);

  if (athletePosition === -1) {
    return { allowed: false, reason: 'Athlete not found in order' };
  }

  const positionDifference = athletePosition - currentIndex;

  if (positionDifference <= 3) {
    return { allowed: false, reason: `Too close to attempt (${positionDifference} athletes away)` };
  }

  return { allowed: true };
}

/**
 * Valide qu'un nouveau poids respecte les r�gles IPF
 * - Minimum 2.5kg d'augmentation entre tentatives
 * - Pas de diminution de poids
 */
export function validateAttemptWeight(
  newWeight: number,
  previousWeight: number | null,
  attemptNumber: 1 | 2 | 3
): { valid: boolean; error?: string } {
  if (attemptNumber === 1) {
    if (newWeight < 20) {
      return { valid: false, error: 'Minimum opening attempt is 20kg' };
    }
    return { valid: true };
  }

  if (!previousWeight) {
    return { valid: false, error: 'Previous attempt weight is required' };
  }

  if (newWeight < previousWeight) {
    return { valid: false, error: 'Cannot decrease weight between attempts' };
  }

  const difference = newWeight - previousWeight;
  if (difference < 2.5 && difference !== 0) {
    return { valid: false, error: 'Minimum 2.5kg increase between attempts' };
  }

  return { valid: true };
}

/**
 * Calcule le prochain athl�te � tenter
 */
export function getNextAthlete(
  currentOrder: AttemptOrder[],
  currentIndex: number
): AttemptOrder | null {
  if (currentIndex >= currentOrder.length - 1) {
    return null;
  }

  return currentOrder[currentIndex + 1];
}

/**
 * R�cup�re les N prochains athl�tes
 */
export function getUpcomingAthletes(
  currentOrder: AttemptOrder[],
  currentIndex: number,
  count: number = 5
): AttemptOrder[] {
  const startIndex = currentIndex + 1;
  return currentOrder.slice(startIndex, startIndex + count);
}
