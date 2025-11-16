/**
 * Types pour la gestion des tentatives en temps réel
 */

export type LiftType = 'squat' | 'bench' | 'deadlift';
export type AttemptResult = 'success' | 'failure' | 'pending';

export interface Attempt {
  id: string;
  athlete_id: string;
  competition_id: string;
  lift_type: LiftType;
  attempt_number: 1 | 2 | 3;
  weight_kg: number;
  result: AttemptResult;
  referee_votes?: [boolean, boolean, boolean]; // 3 arbitres
  timestamp?: string;
  rack_height?: number;
}

export interface CreateAttemptInput {
  athlete_id: string;
  competition_id: string;
  lift_type: LiftType;
  attempt_number: 1 | 2 | 3;
  weight_kg: number;
  rack_height?: number;
}

export interface UpdateAttemptInput {
  id: string;
  weight_kg?: number;
  result?: AttemptResult;
  referee_votes?: [boolean, boolean, boolean];
  rack_height?: number;
}

export interface AthleteScore {
  athlete_id: string;
  athlete_name: string;
  gender: string;
  weight_class: string;
  bodyweight: number;
  // Best lifts
  best_squat: number;
  best_bench: number;
  best_deadlift: number;
  total: number;
  // Calculated scores
  dots_score?: number;
  wilks_score?: number;
  ipf_gl_points?: number;
  // Rankings
  category_rank?: number;
  absolute_rank?: number;
}

export interface CompetitionState {
  competition_id: string;
  current_lift: LiftType;
  current_flight?: string;
  current_attempt_index: number;
  is_active: boolean;
}
