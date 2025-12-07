/**
 * Types pour le système de protestations IPF/FFForce
 * Délai de protestation : 60 secondes après la tentative
 */

export type ProtestType = 'referee_decision' | 'equipment' | 'procedure';
export type ProtestStatus = 'pending' | 'accepted' | 'rejected';

export interface Protest {
  id: string;
  competition_id: string;
  athlete_id: string;
  attempt_id: string;
  protest_type: ProtestType;
  reason: string;
  timestamp: number; // Unix timestamp when protest was filed
  protest_deadline: number; // Unix timestamp (timestamp + 60 seconds)
  status: ProtestStatus;
  jury_decision?: string;
  jury_notes?: string;
  created_at: number;
}

export interface CreateProtestInput {
  competition_id: string;
  athlete_id: string;
  attempt_id: string;
  protest_type: ProtestType;
  reason: string;
}

export interface ResolveProtestInput {
  protest_id: string;
  decision: 'accepted' | 'rejected';
  jury_notes: string;
}

export interface ProtestFormValues {
  protest_type: ProtestType;
  reason: string;
}

export interface ProtestWithAthleteInfo extends Protest {
  athlete_name: string;
  attempt_weight?: number;
  attempt_lift_type?: 'squat' | 'bench' | 'deadlift';
  attempt_number?: number;
}

export const PROTEST_TYPE_LABELS: Record<ProtestType, { fr: string; en: string }> = {
  referee_decision: { fr: 'Décision arbitrale', en: 'Referee Decision' },
  equipment: { fr: 'Équipement', en: 'Equipment' },
  procedure: { fr: 'Procédure', en: 'Procedure' },
};

export const PROTEST_STATUS_LABELS: Record<ProtestStatus, { fr: string; en: string }> = {
  pending: { fr: 'En attente', en: 'Pending' },
  accepted: { fr: 'Acceptée', en: 'Accepted' },
  rejected: { fr: 'Rejetée', en: 'Rejected' },
};

export const PROTEST_DEADLINE_SECONDS = 60;
export const PROTEST_REASON_MIN_LENGTH = 20;
