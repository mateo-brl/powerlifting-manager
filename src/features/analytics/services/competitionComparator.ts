/**
 * Service de comparaison entre compétitions
 */

import {
  CompetitionComparison,
  MultiCompetitionComparison,
  AdvancedCompetitionStats,
} from '../types';
import { Athlete, Attempt } from '../../../shared/types';

/**
 * Calculer les statistiques de comparaison pour une compétition
 */
export function calculateCompetitionComparison(
  competitionId: string,
  athletes: Athlete[],
  attempts: Attempt[]
): CompetitionComparison {
  const totalAthletes = athletes.length;
  const totalLifts = attempts.length;
  const successfulLifts = attempts.filter((a) => a.successful).length;
  const failedLifts = totalLifts - successfulLifts;
  const successRate = totalLifts > 0 ? (successfulLifts / totalLifts) * 100 : 0;

  // Séparer par genre
  const maleAthletes = athletes.filter((a) => a.gender === 'M');
  const femaleAthletes = athletes.filter((a) => a.gender === 'F');

  // Trouver les meilleurs lifts par genre et mouvement
  const maleAttempts = attempts.filter((a) => {
    const athlete = athletes.find((ath) => ath.id === a.athlete_id);
    return athlete?.gender === 'M' && a.successful;
  });

  const femaleAttempts = attempts.filter((a) => {
    const athlete = athletes.find((ath) => ath.id === a.athlete_id);
    return athlete?.gender === 'F' && a.successful;
  });

  const bestSquatMale = Math.max(
    ...maleAttempts
      .filter((a) => a.lift_type === 'squat')
      .map((a) => a.weight_kg),
    0
  );
  const bestSquatFemale = Math.max(
    ...femaleAttempts
      .filter((a) => a.lift_type === 'squat')
      .map((a) => a.weight_kg),
    0
  );

  const bestBenchMale = Math.max(
    ...maleAttempts
      .filter((a) => a.lift_type === 'bench')
      .map((a) => a.weight_kg),
    0
  );
  const bestBenchFemale = Math.max(
    ...femaleAttempts
      .filter((a) => a.lift_type === 'bench')
      .map((a) => a.weight_kg),
    0
  );

  const bestDeadliftMale = Math.max(
    ...maleAttempts
      .filter((a) => a.lift_type === 'deadlift')
      .map((a) => a.weight_kg),
    0
  );
  const bestDeadliftFemale = Math.max(
    ...femaleAttempts
      .filter((a) => a.lift_type === 'deadlift')
      .map((a) => a.weight_kg),
    0
  );

  // Calculer les totaux pour chaque athlète
  const maleTotals = calculateTotals(maleAthletes, attempts);
  const femaleTotals = calculateTotals(femaleAthletes, attempts);

  const bestTotalMale = Math.max(...maleTotals, 0);
  const bestTotalFemale = Math.max(...femaleTotals, 0);

  const avgTotalMale =
    maleTotals.length > 0
      ? maleTotals.reduce((a, b) => a + b, 0) / maleTotals.length
      : undefined;
  const avgTotalFemale =
    femaleTotals.length > 0
      ? femaleTotals.reduce((a, b) => a + b, 0) / femaleTotals.length
      : undefined;

  return {
    id: `comp_${competitionId}_${Date.now()}`,
    competition_id: competitionId,
    total_athletes: totalAthletes,
    total_lifts: totalLifts,
    successful_lifts: successfulLifts,
    failed_lifts: failedLifts,
    success_rate: successRate,
    best_squat_male: bestSquatMale || undefined,
    best_squat_female: bestSquatFemale || undefined,
    best_bench_male: bestBenchMale || undefined,
    best_bench_female: bestBenchFemale || undefined,
    best_deadlift_male: bestDeadliftMale || undefined,
    best_deadlift_female: bestDeadliftFemale || undefined,
    best_total_male: bestTotalMale || undefined,
    best_total_female: bestTotalFemale || undefined,
    avg_total_male: avgTotalMale,
    avg_total_female: avgTotalFemale,
    avg_ipf_points: undefined, // À calculer si nécessaire
    created_at: new Date().toISOString(),
  };
}

/**
 * Calculer les totaux pour un groupe d'athlètes
 */
function calculateTotals(athletes: Athlete[], attempts: Attempt[]): number[] {
  return athletes
    .map((athlete) => {
      const athleteAttempts = attempts.filter(
        (a) => a.athlete_id === athlete.id && a.successful
      );

      const bestSquat = Math.max(
        ...athleteAttempts
          .filter((a) => a.lift_type === 'squat')
          .map((a) => a.weight_kg),
        0
      );
      const bestBench = Math.max(
        ...athleteAttempts
          .filter((a) => a.lift_type === 'bench')
          .map((a) => a.weight_kg),
        0
      );
      const bestDeadlift = Math.max(
        ...athleteAttempts
          .filter((a) => a.lift_type === 'deadlift')
          .map((a) => a.weight_kg),
        0
      );

      return bestSquat + bestBench + bestDeadlift;
    })
    .filter((total) => total > 0);
}

/**
 * Comparer plusieurs compétitions
 */
export function compareMultipleCompetitions(
  competitions: Array<{
    id: string;
    name: string;
    date: string;
    stats: CompetitionComparison;
  }>
): MultiCompetitionComparison {
  if (competitions.length === 0) {
    return {
      competitions: [],
      trend_participation: 'stable',
      trend_performance: 'stable',
      trend_success_rate: 'stable',
    };
  }

  // Trier par date
  const sorted = [...competitions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Analyser les tendances
  const participationTrend = analyzeTrend(
    sorted.map((c) => c.stats.total_athletes)
  );
  const performanceTrend = analyzeTrend(
    sorted.map((c) => c.stats.avg_ipf_points || 0)
  );
  const successRateTrend = analyzeTrend(
    sorted.map((c) => c.stats.success_rate)
  );

  return {
    competitions: sorted,
    trend_participation: participationTrend,
    trend_performance: performanceTrend,
    trend_success_rate: successRateTrend,
  };
}

/**
 * Analyser la tendance d'une série de valeurs
 */
function analyzeTrend(
  values: number[]
): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';

  let increases = 0;
  let decreases = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) increases++;
    else if (values[i] < values[i - 1]) decreases++;
  }

  const threshold = values.length * 0.6; // 60%

  if (increases >= threshold) return 'increasing';
  if (decreases >= threshold) return 'decreasing';
  return 'stable';
}

/**
 * Calculer des statistiques avancées pour une compétition
 */
export function calculateAdvancedStats(
  competitionId: string,
  competitionName: string,
  athletes: Athlete[],
  attempts: Attempt[]
): AdvancedCompetitionStats {
  const maleAthletes = athletes.filter((a) => a.gender === 'M').length;
  const femaleAthletes = athletes.filter((a) => a.gender === 'F').length;

  // Distribution par catégorie d'âge
  const ageDistribution: Record<string, number> = {};
  athletes.forEach((a) => {
    ageDistribution[a.age_category] =
      (ageDistribution[a.age_category] || 0) + 1;
  });

  // Distribution par division
  const divisionDistribution: Record<string, number> = {};
  athletes.forEach((a) => {
    divisionDistribution[a.division] =
      (divisionDistribution[a.division] || 0) + 1;
  });

  // Distribution par catégorie de poids
  const weightClassDistribution: Record<string, number> = {};
  athletes.forEach((a) => {
    weightClassDistribution[a.weight_class] =
      (weightClassDistribution[a.weight_class] || 0) + 1;
  });

  // Taux de réussite par mouvement
  const squatAttempts = attempts.filter((a) => a.lift_type === 'squat');
  const benchAttempts = attempts.filter((a) => a.lift_type === 'bench');
  const deadliftAttempts = attempts.filter((a) => a.lift_type === 'deadlift');

  const squatSuccessRate =
    squatAttempts.length > 0
      ? (squatAttempts.filter((a) => a.successful).length /
          squatAttempts.length) *
        100
      : 0;
  const benchSuccessRate =
    benchAttempts.length > 0
      ? (benchAttempts.filter((a) => a.successful).length /
          benchAttempts.length) *
        100
      : 0;
  const deadliftSuccessRate =
    deadliftAttempts.length > 0
      ? (deadliftAttempts.filter((a) => a.successful).length /
          deadliftAttempts.length) *
        100
      : 0;

  // Distribution des totaux
  const totals = calculateTotals(athletes, attempts);
  const sortedTotals = [...totals].sort((a, b) => a - b);

  const totalDistribution = {
    min: sortedTotals[0] || 0,
    max: sortedTotals[sortedTotals.length - 1] || 0,
    avg: totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0,
    median: calculateMedian(sortedTotals),
    q1: calculateQuartile(sortedTotals, 0.25),
    q3: calculateQuartile(sortedTotals, 0.75),
  };

  return {
    competition_id: competitionId,
    competition_name: competitionName,
    total_athletes: athletes.length,
    male_athletes: maleAthletes,
    female_athletes: femaleAthletes,
    age_distribution: ageDistribution,
    division_distribution: divisionDistribution,
    weight_class_distribution: weightClassDistribution,
    squat_success_rate: squatSuccessRate,
    bench_success_rate: benchSuccessRate,
    deadlift_success_rate: deadliftSuccessRate,
    total_distribution: totalDistribution,
    records_broken: 0, // À calculer avec le système de records
    records_approached: 0,
  };
}

/**
 * Calculer la médiane
 */
function calculateMedian(sortedValues: number[]): number {
  if (sortedValues.length === 0) return 0;

  const mid = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  }

  return sortedValues[mid];
}

/**
 * Calculer un quartile
 */
function calculateQuartile(sortedValues: number[], quartile: number): number {
  if (sortedValues.length === 0) return 0;

  const index = quartile * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sortedValues[lower];
  }

  return (
    sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
  );
}
