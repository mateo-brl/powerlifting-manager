/**
 * Export au format OpenPowerlifting CSV
 * Format standard pour l'archivage mondial des compétitions
 */

import Papa from 'papaparse';
import { CompetitionResults, AthleteResult, OpenPowerliftingRecord } from '../types';
import { calculateIPFGLPoints } from '../../../shared/utils/calculations';

/**
 * Convertit une division locale en format OpenPowerlifting Equipment
 */
function convertDivisionToEquipment(division: string): string {
  const mapping: Record<string, string> = {
    'raw': 'Raw',
    'wraps': 'Wraps',
    'single-ply': 'Single-ply',
    'multi-ply': 'Multi-ply',
    'equipped': 'Single-ply', // Par défaut, équipé = single-ply
  };
  return mapping[division] || 'Raw';
}

/**
 * Convertit une catégorie d'âge en format OpenPowerlifting
 */
function convertAgeCategory(ageCategory: string): string {
  const mapping: Record<string, string> = {
    'Sub-Junior': 'Sub-Juniors',
    'Junior': 'Juniors',
    'Seniors': 'Open',
    'Sub-Master': 'Sub-Masters',
    'Open': 'Open',
    'Master 1': 'Masters 1',
    'Master 2': 'Masters 2',
    'Master 3': 'Masters 3',
    'Master 4': 'Masters 4',
  };
  return mapping[ageCategory] || 'Open';
}

/**
 * Calcule l'âge à partir de la date de naissance
 */
function calculateAge(dateOfBirth: string, competitionDate: string): number {
  const birth = new Date(dateOfBirth);
  const comp = new Date(competitionDate);
  let age = comp.getFullYear() - birth.getFullYear();
  const monthDiff = comp.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && comp.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Détermine la BirthYearClass selon les règles OpenPowerlifting
 */
function getBirthYearClass(dateOfBirth: string): string {
  const year = new Date(dateOfBirth).getFullYear();
  // Groupes par décennie pour les anciens athlètes
  if (year < 1950) return '40-49';
  if (year < 1960) return '50-59';
  if (year < 1970) return '60-69';
  if (year < 1980) return '70-79';
  if (year < 1990) return '80-89';
  if (year < 2000) return '90-99';
  if (year < 2010) return '00-09';
  return '10-19';
}

/**
 * Formatte un poids pour OpenPowerlifting (vide si 0 ou négatif, sinon valeur)
 */
function formatWeight(weight: number | undefined): string {
  if (!weight || weight <= 0) return '';
  return weight.toString();
}

/**
 * Convertit les résultats en format OpenPowerlifting
 */
export function convertToOpenPowerliftingFormat(
  results: CompetitionResults
): OpenPowerliftingRecord[] {
  return results.results.map((athlete, index) => {
    const age = calculateAge(athlete.date_of_birth, results.competition_date);
    const equipment = convertDivisionToEquipment(athlete.division);
    const ageClass = convertAgeCategory(athlete.age_category);
    const birthYearClass = getBirthYearClass(athlete.date_of_birth);

    // Calculer les points GL (Goodlift/IPF Points)
    const glPoints = calculateIPFGLPoints(
      athlete.total,
      athlete.bodyweight || parseFloat(athlete.weight_class),
      athlete.gender
    );

    // Déterminer l'événement (SBD = Squat+Bench+Deadlift)
    const event = 'SBD';

    // Trier les résultats par total pour obtenir le rang
    const sortedResults = results.results
      .filter(
        (a) =>
          a.gender === athlete.gender &&
          a.weight_class === athlete.weight_class &&
          a.division === athlete.division
      )
      .sort((a, b) => (b.total || 0) - (a.total || 0));

    const place = sortedResults.findIndex((a) => a.id === athlete.id) + 1;

    const record: OpenPowerliftingRecord = {
      Name: `${athlete.first_name} ${athlete.last_name}`,
      Sex: athlete.gender,
      Event: event,
      Equipment: equipment,
      Age: age,
      AgeClass: ageClass,
      BirthYearClass: birthYearClass,
      Division: `${ageClass}`,
      BodyweightKg: athlete.bodyweight || 0,
      WeightClassKg: athlete.weight_class,
      Squat1Kg: athlete.squat_1 || 0,
      Squat2Kg: athlete.squat_2 || 0,
      Squat3Kg: athlete.squat_3 || 0,
      Best3SquatKg: athlete.best_squat || 0,
      Bench1Kg: athlete.bench_1 || 0,
      Bench2Kg: athlete.bench_2 || 0,
      Bench3Kg: athlete.bench_3 || 0,
      Best3BenchKg: athlete.best_bench || 0,
      Deadlift1Kg: athlete.deadlift_1 || 0,
      Deadlift2Kg: athlete.deadlift_2 || 0,
      Deadlift3Kg: athlete.deadlift_3 || 0,
      Best3DeadliftKg: athlete.best_deadlift || 0,
      TotalKg: athlete.total || 0,
      Place: place,
      Goodlift: glPoints,
      Tested: 'Yes', // Assumé testé, à ajuster selon la fédération
      Federation: results.federation,
      Date: results.competition_date,
      MeetCountry: '', // À compléter
      MeetName: results.competition_name,
    };

    return record;
  });
}

/**
 * Exporte les résultats au format OpenPowerlifting CSV
 */
export function exportToOpenPowerliftingCSV(results: CompetitionResults): void {
  const records = convertToOpenPowerliftingFormat(results);

  // Colonnes dans l'ordre OpenPowerlifting
  const columns = [
    'Name',
    'Sex',
    'Event',
    'Equipment',
    'Age',
    'AgeClass',
    'BirthYearClass',
    'Division',
    'BodyweightKg',
    'WeightClassKg',
    'Squat1Kg',
    'Squat2Kg',
    'Squat3Kg',
    'Best3SquatKg',
    'Bench1Kg',
    'Bench2Kg',
    'Bench3Kg',
    'Best3BenchKg',
    'Deadlift1Kg',
    'Deadlift2Kg',
    'Deadlift3Kg',
    'Best3DeadliftKg',
    'TotalKg',
    'Place',
    'Dots',
    'Wilks',
    'Glossbrenner',
    'Goodlift',
    'Tested',
    'Country',
    'State',
    'Federation',
    'ParentFederation',
    'Date',
    'MeetCountry',
    'MeetState',
    'MeetTown',
    'MeetName',
  ];

  // Convertir en CSV
  const csv = Papa.unparse(records, {
    columns,
    header: true,
  });

  // Télécharger
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `openpowerlifting_${results.competition_name.replace(/\s+/g, '_')}_${
      results.competition_date
    }.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Valide les données avant export OpenPowerlifting
 */
export function validateOpenPowerliftingData(
  results: CompetitionResults
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  results.results.forEach((athlete, index) => {
    // Vérifications obligatoires
    if (!athlete.first_name || !athlete.last_name) {
      errors.push(`Athlète ${index + 1}: Nom complet requis`);
    }

    if (!athlete.bodyweight || athlete.bodyweight <= 0) {
      errors.push(`${athlete.first_name} ${athlete.last_name}: Poids de corps manquant`);
    }

    if (!athlete.date_of_birth) {
      errors.push(`${athlete.first_name} ${athlete.last_name}: Date de naissance manquante`);
    }

    if (!athlete.total || athlete.total <= 0) {
      errors.push(`${athlete.first_name} ${athlete.last_name}: Total manquant ou invalide`);
    }

    // Vérifier que les tentatives existent
    const hasSquat = athlete.best_squat && athlete.best_squat > 0;
    const hasBench = athlete.best_bench && athlete.best_bench > 0;
    const hasDeadlift = athlete.best_deadlift && athlete.best_deadlift > 0;

    if (!hasSquat || !hasBench || !hasDeadlift) {
      errors.push(
        `${athlete.first_name} ${athlete.last_name}: Toutes les tentatives (SBD) sont requises`
      );
    }
  });

  if (!results.competition_name) {
    errors.push('Nom de compétition manquant');
  }

  if (!results.competition_date) {
    errors.push('Date de compétition manquante');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
