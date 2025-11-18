/**
 * Service de détection automatique des records
 */

import { Record, RecordCheck, RecordType, LiftType } from '../types';
import { Athlete } from '../../athlete/types';
import { Attempt } from '../../attempt/types';

// Seuil pour considérer qu'un record est "approché" (en kg)
const APPROACH_THRESHOLD = 2.5;

/**
 * Vérifie si une tentative bat ou approche un record
 */
export function checkForRecord(
  attempt: Attempt,
  athlete: Athlete,
  records: Record[],
  recordType: RecordType = 'national'
): RecordCheck {
  // Filtrer les records applicables
  const applicableRecords = records.filter((record) => {
    return (
      record.record_type === recordType &&
      record.gender === athlete.gender &&
      record.weight_class === athlete.weight_class &&
      record.division === athlete.division &&
      record.age_category === athlete.age_category &&
      record.lift_type === attempt.lift_type
    );
  });

  if (applicableRecords.length === 0) {
    return {
      hasRecord: false,
      isNewRecord: false,
      isApproached: false,
    };
  }

  // Trouver le record actuel (poids le plus élevé)
  const currentRecord = applicableRecords.reduce((max, record) =>
    record.weight_kg > max.weight_kg ? record : max
  );

  const difference = attempt.weight_kg - currentRecord.weight_kg;
  const isNewRecord = attempt.successful && difference > 0;
  const isApproached =
    attempt.successful &&
    !isNewRecord &&
    Math.abs(difference) <= APPROACH_THRESHOLD;

  return {
    hasRecord: true,
    record: currentRecord,
    isNewRecord,
    isApproached,
    difference,
  };
}

/**
 * Vérifie tous les types de records pour une tentative
 */
export function checkAllRecordTypes(
  attempt: Attempt,
  athlete: Athlete,
  records: Record[],
  federation: string
): {
  [key in RecordType]?: RecordCheck;
} {
  const recordTypes: RecordType[] = ['personal', 'regional', 'national', 'world'];

  const results: { [key in RecordType]?: RecordCheck } = {};

  recordTypes.forEach((recordType) => {
    const filteredRecords = records.filter((r) => {
      if (recordType === 'personal') {
        // Records personnels de l'athlète uniquement
        return r.record_type === 'personal' && r.athlete_name === `${athlete.first_name} ${athlete.last_name}`;
      }
      // Autres types de records filtrés par fédération
      return r.record_type === recordType && r.federation === federation;
    });

    results[recordType] = checkForRecord(attempt, athlete, filteredRecords, recordType);
  });

  return results;
}

/**
 * Calcule le total et vérifie les records de total
 */
export function checkTotalRecord(
  athlete: Athlete,
  allAttempts: Attempt[],
  records: Record[],
  recordType: RecordType = 'national'
): RecordCheck {
  // Calculer le meilleur total
  const squatBest = Math.max(
    ...allAttempts
      .filter((a) => a.lift_type === 'squat' && a.successful)
      .map((a) => a.weight_kg),
    0
  );

  const benchBest = Math.max(
    ...allAttempts
      .filter((a) => a.lift_type === 'bench' && a.successful)
      .map((a) => a.weight_kg),
    0
  );

  const deadliftBest = Math.max(
    ...allAttempts
      .filter((a) => a.lift_type === 'deadlift' && a.successful)
      .map((a) => a.weight_kg),
    0
  );

  const total = squatBest + benchBest + deadliftBest;

  if (total === 0) {
    return {
      hasRecord: false,
      isNewRecord: false,
      isApproached: false,
    };
  }

  // Créer une tentative virtuelle pour le total
  const totalAttempt: Attempt = {
    id: 'total',
    athlete_id: athlete.id,
    lift_type: 'total' as any,
    attempt_number: 1,
    weight_kg: total,
    successful: true,
    timestamp: new Date().toISOString(),
  };

  return checkForRecord(totalAttempt, athlete, records, recordType);
}

/**
 * Génère un message de notification pour un record
 */
export function generateRecordMessage(
  recordCheck: RecordCheck,
  athleteName: string,
  liftType: LiftType,
  language: 'fr' | 'en' = 'fr'
): string {
  if (!recordCheck.hasRecord) {
    return '';
  }

  const liftNames = {
    fr: {
      squat: 'Squat',
      bench: 'Développé Couché',
      deadlift: 'Soulevé de Terre',
      total: 'Total',
    },
    en: {
      squat: 'Squat',
      bench: 'Bench Press',
      deadlift: 'Deadlift',
      total: 'Total',
    },
  };

  const liftName = liftNames[language][liftType];

  if (recordCheck.isNewRecord) {
    return language === 'fr'
      ? `🎉 NOUVEAU RECORD! ${athleteName} bat le record avec ${recordCheck.record!.weight_kg}kg au ${liftName}!`
      : `🎉 NEW RECORD! ${athleteName} breaks the record with ${recordCheck.record!.weight_kg}kg in ${liftName}!`;
  }

  if (recordCheck.isApproached) {
    const diff = Math.abs(recordCheck.difference!).toFixed(1);
    return language === 'fr'
      ? `⚡ Record approché! ${athleteName} est à ${diff}kg du record (${recordCheck.record!.weight_kg}kg) au ${liftName}`
      : `⚡ Record approached! ${athleteName} is ${diff}kg away from the record (${recordCheck.record!.weight_kg}kg) in ${liftName}`;
  }

  return '';
}

/**
 * Détermine la couleur de notification selon le type de record
 */
export function getRecordNotificationColor(recordCheck: RecordCheck): string {
  if (recordCheck.isNewRecord) {
    return '#52c41a'; // Vert pour nouveau record
  }
  if (recordCheck.isApproached) {
    return '#faad14'; // Orange pour record approché
  }
  return '#d9d9d9'; // Gris par défaut
}

/**
 * Crée un nouveau record à partir d'une tentative réussie
 */
export function createRecordFromAttempt(
  attempt: Attempt,
  athlete: Athlete,
  competition: {
    id: string;
    name: string;
    date: string;
    federation: string;
  },
  recordType: RecordType
): Omit<Record, 'id' | 'created_at' | 'updated_at'> {
  return {
    record_type: recordType,
    federation: competition.federation,
    gender: athlete.gender,
    weight_class: athlete.weight_class,
    division: athlete.division,
    age_category: athlete.age_category,
    lift_type: attempt.lift_type as LiftType,
    weight_kg: attempt.weight_kg,
    athlete_name: `${athlete.first_name} ${athlete.last_name}`,
    date_set: competition.date,
    competition_name: competition.name,
    verified: false, // À vérifier manuellement
  };
}

/**
 * Filtre les records selon des critères
 */
export function filterRecords(records: Record[], filter: Partial<Record>): Record[] {
  return records.filter((record) => {
    if (filter.record_type && record.record_type !== filter.record_type) return false;
    if (filter.federation && record.federation !== filter.federation) return false;
    if (filter.gender && record.gender !== filter.gender) return false;
    if (filter.weight_class && record.weight_class !== filter.weight_class) return false;
    if (filter.division && record.division !== filter.division) return false;
    if (filter.age_category && record.age_category !== filter.age_category) return false;
    if (filter.lift_type && record.lift_type !== filter.lift_type) return false;
    return true;
  });
}
