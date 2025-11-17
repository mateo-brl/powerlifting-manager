import { Attempt, AthleteScore } from '../types';
import { Athlete } from '../../athlete/types';
import { WeighIn } from '../../weigh-in/types';
import { calculateIPFGLPoints, calculateDOTS, calculateWilks } from '../../../shared/utils/calculations';

/**
 * Calcule le meilleur lift pour un athlète et un type de mouvement
 */
export function getBestLift(attempts: Attempt[], liftType: string): number {
  const successfulAttempts = attempts.filter(
    a => a.lift_type.toLowerCase() === liftType.toLowerCase() && a.result === 'success'
  );

  if (successfulAttempts.length === 0) return 0;

  return Math.max(...successfulAttempts.map(a => a.weight_kg));
}

/**
 * Calcule le score complet d'un athlète
 */
export function calculateAthleteScore(
  athlete: Athlete,
  weighIn: WeighIn,
  attempts: Attempt[]
): AthleteScore {
  const athleteAttempts = attempts.filter(a => a.athlete_id === athlete.id);

  const best_squat = getBestLift(athleteAttempts, 'squat');
  const best_bench = getBestLift(athleteAttempts, 'bench');
  const best_deadlift = getBestLift(athleteAttempts, 'deadlift');
  const total = best_squat + best_bench + best_deadlift;

  const dots_score = total > 0 ? calculateDOTS(total, weighIn.bodyweight, athlete.gender as 'M' | 'F') : 0;
  const wilks_score = total > 0 ? calculateWilks(total, weighIn.bodyweight, athlete.gender as 'M' | 'F') : 0;
  const ipf_gl_points = total > 0 ? calculateIPFGLPoints(total, weighIn.bodyweight, athlete.gender as 'M' | 'F') : 0;

  return {
    athlete_id: athlete.id,
    athlete_name: `${athlete.last_name}, ${athlete.first_name}`,
    gender: athlete.gender,
    weight_class: athlete.weight_class,
    bodyweight: weighIn.bodyweight,
    division: athlete.division,
    age_category: athlete.age_category,
    best_squat,
    best_bench,
    best_deadlift,
    total,
    dots_score,
    wilks_score,
    ipf_gl_points,
  };
}

/**
 * Calcule les scores pour tous les athlètes
 */
export function calculateAllScores(
  athletes: Athlete[],
  weighIns: WeighIn[],
  attempts: Attempt[]
): AthleteScore[] {
  const scores: AthleteScore[] = [];

  athletes.forEach(athlete => {
    const weighIn = weighIns.find(w => w.athlete_id === athlete.id);
    if (!weighIn) return;

    const score = calculateAthleteScore(athlete, weighIn, attempts);
    scores.push(score);
  });

  return scores;
}

/**
 * Classe les athlètes par catégorie
 */
export function rankByCategory(scores: AthleteScore[]): AthleteScore[] {
  const scoresByCat = new Map<string, AthleteScore[]>();

  // Group by weight class and gender
  scores.forEach(score => {
    const key = `${score.gender}-${score.weight_class}`;
    if (!scoresByCat.has(key)) {
      scoresByCat.set(key, []);
    }
    scoresByCat.get(key)!.push(score);
  });

  // Rank within each category
  const rankedScores: AthleteScore[] = [];
  scoresByCat.forEach(catScores => {
    const sorted = catScores
      .filter(s => s.total > 0)
      .sort((a, b) => b.total - a.total);

    sorted.forEach((score, index) => {
      rankedScores.push({
        ...score,
        category_rank: index + 1,
      });
    });

    // Add athletes with no total
    catScores
      .filter(s => s.total === 0)
      .forEach(score => {
        rankedScores.push(score);
      });
  });

  return rankedScores;
}

/**
 * Classe tous les athlètes (absolu)
 */
export function rankAbsolute(scores: AthleteScore[]): AthleteScore[] {
  const withTotal = scores.filter(s => s.total > 0);
  const withoutTotal = scores.filter(s => s.total === 0);

  // Sort by IPF GL Points (official ranking method)
  const sorted = withTotal.sort((a, b) => (b.ipf_gl_points || 0) - (a.ipf_gl_points || 0));

  return [
    ...sorted.map((score, index) => ({
      ...score,
      absolute_rank: index + 1,
    })),
    ...withoutTotal,
  ];
}

/**
 * Obtient le prochain numéro de tentative pour un athlète et un lift
 */
export function getNextAttemptNumber(
  attempts: Attempt[],
  athleteId: string,
  liftType: string
): 1 | 2 | 3 | null {
  const athleteLiftAttempts = attempts.filter(
    a => a.athlete_id === athleteId && a.lift_type.toLowerCase() === liftType.toLowerCase()
  );

  if (athleteLiftAttempts.length === 0) return 1;
  if (athleteLiftAttempts.length === 1) return 2;
  if (athleteLiftAttempts.length === 2) return 3;
  return null; // All 3 attempts completed
}

/**
 * Vérifie si un athlète a terminé tous ses essais pour un mouvement
 */
export function hasCompletedLift(
  attempts: Attempt[],
  athleteId: string,
  liftType: string
): boolean {
  const athleteLiftAttempts = attempts.filter(
    a => a.athlete_id === athleteId && a.lift_type.toLowerCase() === liftType.toLowerCase()
  );

  return athleteLiftAttempts.length >= 3;
}
