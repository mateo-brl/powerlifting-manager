/**
 * Types pour le système d'export
 */

import { Athlete } from '../../athlete/types';
import { Attempt } from '../../../shared/types';

export interface AthleteResult extends Athlete {
  squat_1?: number;
  squat_2?: number;
  squat_3?: number;
  best_squat: number;
  bench_1?: number;
  bench_2?: number;
  bench_3?: number;
  best_bench: number;
  deadlift_1?: number;
  deadlift_2?: number;
  deadlift_3?: number;
  best_deadlift: number;
  total: number;
  gl_points?: number;
  rank?: number;
  attempts: Attempt[];
}

export interface CompetitionResults {
  competition_id: string;
  competition_name: string;
  competition_date: string;
  competition_location?: string;
  federation: string;
  results: AthleteResult[];
}

export interface ExportOptions {
  includeAttempts?: boolean;
  includeGLPoints?: boolean;
  includeRackHeights?: boolean;
  format?: 'A4' | 'Letter';
  language?: 'fr' | 'en';
}

export interface OpenPowerliftingRecord {
  Name: string;
  Sex: string;
  Event: string;
  Equipment: string;
  Age: number;
  AgeClass: string;
  BirthYearClass: string;
  Division: string;
  BodyweightKg: number;
  WeightClassKg: string;
  Squat1Kg: number;
  Squat2Kg: number;
  Squat3Kg: number;
  Best3SquatKg: number;
  Bench1Kg: number;
  Bench2Kg: number;
  Bench3Kg: number;
  Best3BenchKg: number;
  Deadlift1Kg: number;
  Deadlift2Kg: number;
  Deadlift3Kg: number;
  Best3DeadliftKg: number;
  TotalKg: number;
  Place: number;
  Dots?: number;
  Wilks?: number;
  Glossbrenner?: number;
  Goodlift?: number;
  Tested: string;
  Country?: string;
  State?: string;
  Federation: string;
  ParentFederation?: string;
  Date: string;
  MeetCountry: string;
  MeetState?: string;
  MeetTown?: string;
  MeetName: string;
}

export interface FFForceExportData {
  // En-tête de la compétition
  competition: {
    nom: string;
    date: string;
    lieu: string;
    responsable: string;
  };
  // Données des athlètes par catégorie
  categories: {
    categorie: string;
    athletes: {
      numero: number;
      nom: string;
      prenom: string;
      club: string;
      categorie_age: string;
      poids_corps: number;
      squat: [number, number, number];
      bench: [number, number, number];
      deadlift: [number, number, number];
      total: number;
      classement: number;
    }[];
  }[];
}
