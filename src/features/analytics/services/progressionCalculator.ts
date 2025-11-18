/**
 * Service de calcul de progression des athlètes
 */

import {
  AthleteHistory,
  AthleteProgression,
  ChartDataPoint,
  AthleteDetailedStats,
} from '../types';

/**
 * Calculer la progression d'un athlète au fil du temps
 */
export function calculateAthleteProgression(
  athleteId: string,
  athleteName: string,
  history: AthleteHistory[]
): AthleteProgression {
  if (history.length === 0) {
    return {
      athlete_id: athleteId,
      athlete_name: athleteName,
      history: [],
      squat_progression: 0,
      bench_progression: 0,
      deadlift_progression: 0,
      total_progression: 0,
    };
  }

  // Trier par date (plus ancien au plus récent)
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(a.competition_date).getTime() -
      new Date(b.competition_date).getTime()
  );

  const firstCompetition = sortedHistory[0];
  const lastCompetition = sortedHistory[sortedHistory.length - 1];

  // Calculer les progressions (en %)
  const squatProgression = calculatePercentageChange(
    firstCompetition.best_squat,
    lastCompetition.best_squat
  );
  const benchProgression = calculatePercentageChange(
    firstCompetition.best_bench,
    lastCompetition.best_bench
  );
  const deadliftProgression = calculatePercentageChange(
    firstCompetition.best_deadlift,
    lastCompetition.best_deadlift
  );
  const totalProgression = calculatePercentageChange(
    firstCompetition.total,
    lastCompetition.total
  );

  // Trouver les meilleurs records
  let bestSquat = { value: 0, date: '' };
  let bestBench = { value: 0, date: '' };
  let bestDeadlift = { value: 0, date: '' };
  let bestTotal = { value: 0, date: '' };

  sortedHistory.forEach((comp) => {
    if (comp.best_squat && comp.best_squat > bestSquat.value) {
      bestSquat = { value: comp.best_squat, date: comp.competition_date };
    }
    if (comp.best_bench && comp.best_bench > bestBench.value) {
      bestBench = { value: comp.best_bench, date: comp.competition_date };
    }
    if (comp.best_deadlift && comp.best_deadlift > bestDeadlift.value) {
      bestDeadlift = { value: comp.best_deadlift, date: comp.competition_date };
    }
    if (comp.total && comp.total > bestTotal.value) {
      bestTotal = { value: comp.total, date: comp.competition_date };
    }
  });

  return {
    athlete_id: athleteId,
    athlete_name: athleteName,
    history: sortedHistory,
    squat_progression: squatProgression,
    bench_progression: benchProgression,
    deadlift_progression: deadliftProgression,
    total_progression: totalProgression,
    best_squat_ever: bestSquat.value || undefined,
    best_bench_ever: bestBench.value || undefined,
    best_deadlift_ever: bestDeadlift.value || undefined,
    best_total_ever: bestTotal.value || undefined,
    best_squat_date: bestSquat.date || undefined,
    best_bench_date: bestBench.date || undefined,
    best_deadlift_date: bestDeadlift.date || undefined,
    best_total_date: bestTotal.date || undefined,
  };
}

/**
 * Calculer le changement en pourcentage
 */
function calculatePercentageChange(
  oldValue?: number,
  newValue?: number
): number {
  if (!oldValue || !newValue) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Convertir l'historique en points de données pour graphiques
 */
export function convertToChartData(
  history: AthleteHistory[]
): ChartDataPoint[] {
  return history
    .sort(
      (a, b) =>
        new Date(a.competition_date).getTime() -
        new Date(b.competition_date).getTime()
    )
    .map((comp) => ({
      date: comp.competition_date,
      competition: comp.competition_name,
      squat: comp.best_squat,
      bench: comp.best_bench,
      deadlift: comp.best_deadlift,
      total: comp.total,
      ipf_points: comp.ipf_points,
      wilks: comp.wilks_score,
      dots: comp.dots_score,
    }));
}

/**
 * Calculer les statistiques détaillées d'un athlète
 */
export function calculateDetailedStats(
  athleteId: string,
  athleteName: string,
  history: AthleteHistory[],
  allAttempts?: Array<{ result: string }>
): AthleteDetailedStats {
  if (history.length === 0) {
    return {
      athlete_id: athleteId,
      athlete_name: athleteName,
      total_competitions: 0,
      total_lifts: 0,
      successful_lifts: 0,
      success_rate: 0,
      years_active: 0,
      best_lift: 'squat',
      strongest_relative: 'squat',
    };
  }

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(a.competition_date).getTime() -
      new Date(b.competition_date).getTime()
  );

  const firstDate = new Date(sortedHistory[0].competition_date);
  const lastDate = new Date(
    sortedHistory[sortedHistory.length - 1].competition_date
  );
  const yearsActive =
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  // Trouver les records personnels
  let prSquat = 0;
  let prBench = 0;
  let prDeadlift = 0;
  let prTotal = 0;
  let bestIpf = 0;
  let bestWilks = 0;
  let bestDots = 0;

  sortedHistory.forEach((comp) => {
    if (comp.best_squat && comp.best_squat > prSquat) prSquat = comp.best_squat;
    if (comp.best_bench && comp.best_bench > prBench) prBench = comp.best_bench;
    if (comp.best_deadlift && comp.best_deadlift > prDeadlift)
      prDeadlift = comp.best_deadlift;
    if (comp.total && comp.total > prTotal) prTotal = comp.total;
    if (comp.ipf_points && comp.ipf_points > bestIpf)
      bestIpf = comp.ipf_points;
    if (comp.wilks_score && comp.wilks_score > bestWilks)
      bestWilks = comp.wilks_score;
    if (comp.dots_score && comp.dots_score > bestDots)
      bestDots = comp.dots_score;
  });

  // Calculer le taux de réussite
  let totalLifts = 0;
  let successfulLifts = 0;
  if (allAttempts) {
    totalLifts = allAttempts.length;
    successfulLifts = allAttempts.filter((a) => a.result === 'success').length;
  }

  // Progression moyenne par an
  const totalYears = Math.max(1, yearsActive);
  const avgYearlySquatProgression = prSquat / totalYears;
  const avgYearlyBenchProgression = prBench / totalYears;
  const avgYearlyDeadliftProgression = prDeadlift / totalYears;
  const avgYearlyTotalProgression = prTotal / totalYears;

  // Déterminer le meilleur mouvement
  const bestLift =
    prSquat > prBench && prSquat > prDeadlift
      ? 'squat'
      : prBench > prDeadlift
      ? 'bench'
      : 'deadlift';

  // Mouvement le plus fort relativement (normalisé)
  const avgBodyweight =
    sortedHistory.reduce((sum, c) => sum + (c.bodyweight || 0), 0) /
    sortedHistory.length;
  const relativeSquat = prSquat / avgBodyweight;
  const relativeBench = prBench / avgBodyweight;
  const relativeDeadlift = prDeadlift / avgBodyweight;

  const strongestRelative =
    relativeSquat > relativeBench && relativeSquat > relativeDeadlift
      ? 'squat'
      : relativeBench > relativeDeadlift
      ? 'bench'
      : 'deadlift';

  return {
    athlete_id: athleteId,
    athlete_name: athleteName,
    total_competitions: history.length,
    total_lifts: totalLifts,
    successful_lifts: successfulLifts,
    success_rate: totalLifts > 0 ? (successfulLifts / totalLifts) * 100 : 0,
    pr_squat: prSquat || undefined,
    pr_bench: prBench || undefined,
    pr_deadlift: prDeadlift || undefined,
    pr_total: prTotal || undefined,
    best_ipf_points: bestIpf || undefined,
    best_wilks: bestWilks || undefined,
    best_dots: bestDots || undefined,
    avg_yearly_squat_progression: avgYearlySquatProgression || undefined,
    avg_yearly_bench_progression: avgYearlyBenchProgression || undefined,
    avg_yearly_deadlift_progression: avgYearlyDeadliftProgression || undefined,
    avg_yearly_total_progression: avgYearlyTotalProgression || undefined,
    first_competition_date: sortedHistory[0].competition_date,
    last_competition_date:
      sortedHistory[sortedHistory.length - 1].competition_date,
    years_active: Math.round(yearsActive * 10) / 10,
    best_lift: bestLift,
    strongest_relative: strongestRelative,
  };
}

/**
 * Comparer deux athlètes
 */
export function compareAthletes(
  progression1: AthleteProgression,
  progression2: AthleteProgression
): {
  athlete1: string;
  athlete2: string;
  squat_leader: string;
  bench_leader: string;
  deadlift_leader: string;
  total_leader: string;
  progression_leader: string;
} {
  return {
    athlete1: progression1.athlete_name,
    athlete2: progression2.athlete_name,
    squat_leader:
      (progression1.best_squat_ever || 0) > (progression2.best_squat_ever || 0)
        ? progression1.athlete_name
        : progression2.athlete_name,
    bench_leader:
      (progression1.best_bench_ever || 0) > (progression2.best_bench_ever || 0)
        ? progression1.athlete_name
        : progression2.athlete_name,
    deadlift_leader:
      (progression1.best_deadlift_ever || 0) >
      (progression2.best_deadlift_ever || 0)
        ? progression1.athlete_name
        : progression2.athlete_name,
    total_leader:
      (progression1.best_total_ever || 0) > (progression2.best_total_ever || 0)
        ? progression1.athlete_name
        : progression2.athlete_name,
    progression_leader:
      progression1.total_progression > progression2.total_progression
        ? progression1.athlete_name
        : progression2.athlete_name,
  };
}
