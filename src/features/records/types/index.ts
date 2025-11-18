/**
 * Types pour le système de gestion des records
 */

export type RecordType = 'national' | 'regional' | 'personal' | 'world';
export type LiftType = 'squat' | 'bench' | 'deadlift' | 'total';

export interface Record {
  id: string;
  record_type: RecordType;
  federation: string;
  country?: string;
  region?: string;
  gender: 'M' | 'F';
  weight_class: string;
  division: 'raw' | 'wraps' | 'single-ply' | 'multi-ply' | 'equipped';
  age_category: string;
  lift_type: LiftType;
  weight_kg: number;
  athlete_name: string;
  date_set: string;
  competition_name?: string;
  verified: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecordAttempt {
  id: string;
  record_id: string;
  attempt_id: string;
  athlete_id: string;
  competition_id: string;
  weight_kg: number;
  successful: boolean;
  approached: boolean; // Record approché à moins de 2.5kg
  timestamp: string;
}

export interface RecordCheck {
  hasRecord: boolean;
  record?: Record;
  isNewRecord: boolean;
  isApproached: boolean; // À moins de 2.5kg du record
  difference?: number; // Différence avec le record actuel
}

export interface RecordNotification {
  type: 'new_record' | 'record_approached' | 'record_broken';
  record: Record;
  attempt: {
    athlete_name: string;
    weight_kg: number;
    lift_type: LiftType;
  };
  message: string;
}

export interface RecordStats {
  total_records: number;
  by_type: {
    [key in RecordType]: number;
  };
  by_lift: {
    [key in LiftType]: number;
  };
  recent_records: Record[];
}

export interface RecordFilter {
  record_type?: RecordType;
  federation?: string;
  gender?: 'M' | 'F';
  weight_class?: string;
  division?: string;
  age_category?: string;
  lift_type?: LiftType;
}
