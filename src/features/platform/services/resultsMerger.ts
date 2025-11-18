/**
 * Service de fusion intelligente des résultats multi-plateformes
 */

import {
  AthleteWithPlatform,
  AttemptWithPlatform,
  MergedResult,
  Platform,
} from '../types';

/**
 * Fusionne les tentatives d'un athlète provenant de plusieurs plateformes
 *
 * @param attempts - Toutes les tentatives de l'athlète
 * @param conflictResolution - Stratégie de résolution des conflits
 * @returns Tentatives fusionnées par mouvement
 */
function mergeAttemptsByLift(
  attempts: AttemptWithPlatform[],
  conflictResolution: 'latest' | 'source_priority' = 'latest'
): {
  squat: AttemptWithPlatform[];
  bench: AttemptWithPlatform[];
  deadlift: AttemptWithPlatform[];
  hasConflicts: boolean;
} {
  const byLift = {
    squat: [] as AttemptWithPlatform[],
    bench: [] as AttemptWithPlatform[],
    deadlift: [] as AttemptWithPlatform[],
  };

  let hasConflicts = false;

  // Regrouper par mouvement
  attempts.forEach((attempt) => {
    byLift[attempt.lift_type].push(attempt);
  });

  // Pour chaque mouvement, vérifier les conflits
  (['squat', 'bench', 'deadlift'] as const).forEach((lift) => {
    const liftAttempts = byLift[lift];

    // Regrouper par numéro de tentative
    const byAttemptNumber: { [key: number]: AttemptWithPlatform[] } = {};
    liftAttempts.forEach((attempt) => {
      if (!byAttemptNumber[attempt.attempt_number]) {
        byAttemptNumber[attempt.attempt_number] = [];
      }
      byAttemptNumber[attempt.attempt_number].push(attempt);
    });

    // Résoudre les conflits pour chaque tentative
    byLift[lift] = [];
    [1, 2, 3].forEach((attemptNum) => {
      const duplicates = byAttemptNumber[attemptNum] || [];

      if (duplicates.length > 1) {
        hasConflicts = true;

        // Stratégie de résolution
        if (conflictResolution === 'latest') {
          // Prendre la tentative la plus récente
          const latest = duplicates.reduce((prev, curr) =>
            new Date(curr.timestamp) > new Date(prev.timestamp) ? curr : prev
          );
          byLift[lift].push(latest);
        } else if (conflictResolution === 'source_priority') {
          // Prendre la première tentative (priorité à la source)
          byLift[lift].push(duplicates[0]);
        }
      } else if (duplicates.length === 1) {
        byLift[lift].push(duplicates[0]);
      }
    });

    // Trier par numéro de tentative
    byLift[lift].sort((a, b) => a.attempt_number - b.attempt_number);
  });

  return {
    squat: byLift.squat,
    bench: byLift.bench,
    deadlift: byLift.deadlift,
    hasConflicts,
  };
}

/**
 * Calcule le meilleur résultat d'une liste de tentatives
 */
function getBestAttempt(attempts: AttemptWithPlatform[]): number {
  const successful = attempts.filter((a) => a.successful);
  if (successful.length === 0) return 0;

  return Math.max(...successful.map((a) => a.weight_kg));
}

/**
 * Fusionne tous les résultats d'athlètes provenant de plusieurs plateformes
 *
 * @param athletes - Liste des athlètes avec leurs plateformes
 * @param attempts - Liste de toutes les tentatives
 * @param platforms - Liste des plateformes
 * @param conflictResolution - Stratégie de résolution des conflits
 * @returns Résultats fusionnés par athlète
 */
export function mergeMultiPlatformResults(
  athletes: AthleteWithPlatform[],
  attempts: AttemptWithPlatform[],
  platforms: Platform[],
  conflictResolution: 'latest' | 'source_priority' = 'latest'
): MergedResult[] {
  const results: MergedResult[] = [];

  // Créer une map des plateformes pour lookup rapide
  const platformMap = new Map(platforms.map((p) => [p.id, p]));

  // Regrouper les tentatives par athlète
  const attemptsByAthlete = new Map<string, AttemptWithPlatform[]>();
  attempts.forEach((attempt) => {
    if (!attemptsByAthlete.has(attempt.athlete_id)) {
      attemptsByAthlete.set(attempt.athlete_id, []);
    }

    // Enrichir avec le nom de la plateforme
    const enrichedAttempt = { ...attempt };
    if (attempt.platform_id) {
      const platform = platformMap.get(attempt.platform_id);
      if (platform) {
        enrichedAttempt.platform_name = platform.name;
      }
    }

    attemptsByAthlete.get(attempt.athlete_id)!.push(enrichedAttempt);
  });

  // Pour chaque athlète, fusionner ses résultats
  athletes.forEach((athlete) => {
    const athleteAttempts = attemptsByAthlete.get(athlete.id) || [];

    // Enrichir avec le nom de la plateforme
    let platformName: string | undefined;
    if (athlete.platform_id) {
      const platform = platformMap.get(athlete.platform_id);
      if (platform) {
        platformName = platform.name;
      }
    }

    // Fusionner les tentatives par mouvement
    const merged = mergeAttemptsByLift(athleteAttempts, conflictResolution);

    // Calculer les meilleurs résultats
    const bestSquat = getBestAttempt(merged.squat);
    const bestBench = getBestAttempt(merged.bench);
    const bestDeadlift = getBestAttempt(merged.deadlift);
    const total = bestSquat + bestBench + bestDeadlift;

    // Déterminer la dernière mise à jour
    const allAttempts = [
      ...merged.squat,
      ...merged.bench,
      ...merged.deadlift,
    ];
    const lastUpdated =
      allAttempts.length > 0
        ? allAttempts.reduce((latest, curr) =>
            new Date(curr.timestamp) > new Date(latest.timestamp)
              ? curr
              : latest
          ).timestamp
        : athlete.created_at;

    results.push({
      athlete_id: athlete.id,
      athlete_name: `${athlete.first_name} ${athlete.last_name}`,
      gender: athlete.gender,
      weight_class: athlete.weight_class,
      division: athlete.division,
      age_category: athlete.age_category,
      platform_id: athlete.platform_id,
      platform_name: platformName,

      squat_attempts: merged.squat,
      bench_attempts: merged.bench,
      deadlift_attempts: merged.deadlift,

      best_squat: bestSquat,
      best_bench: bestBench,
      best_deadlift: bestDeadlift,
      total,

      has_conflicting_data: merged.hasConflicts,
      last_updated: lastUpdated,
    });
  });

  // Trier par total décroissant
  results.sort((a, b) => b.total - a.total);

  return results;
}

/**
 * Détecte les conflits entre résultats de différentes plateformes
 *
 * @param results - Résultats fusionnés
 * @returns Liste des athlètes avec conflits
 */
export function detectConflicts(results: MergedResult[]): MergedResult[] {
  return results.filter((r) => r.has_conflicting_data);
}

/**
 * Fusionne les résultats par catégorie de poids
 *
 * @param results - Résultats fusionnés
 * @param gender - Genre à filtrer
 * @param weightClass - Catégorie de poids à filtrer
 * @returns Résultats filtrés et classés
 */
export function mergeResultsByCategory(
  results: MergedResult[],
  gender?: 'M' | 'F',
  weightClass?: string
): MergedResult[] {
  let filtered = results;

  if (gender) {
    filtered = filtered.filter((r) => r.gender === gender);
  }

  if (weightClass) {
    filtered = filtered.filter((r) => r.weight_class === weightClass);
  }

  // Réassigner les rangs
  return filtered
    .sort((a, b) => b.total - a.total)
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    })) as MergedResult[];
}

/**
 * Vérifie si un athlète a des tentatives sur plusieurs plateformes
 *
 * @param athleteId - ID de l'athlète
 * @param attempts - Toutes les tentatives
 * @returns true si l'athlète a des tentatives sur plusieurs plateformes
 */
export function hasMultiplePlatformAttempts(
  athleteId: string,
  attempts: AttemptWithPlatform[]
): boolean {
  const athleteAttempts = attempts.filter((a) => a.athlete_id === athleteId);
  const platformIds = new Set(
    athleteAttempts
      .map((a) => a.platform_id)
      .filter((id) => id !== undefined && id !== null)
  );

  return platformIds.size > 1;
}
