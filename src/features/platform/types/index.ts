/**
 * Types pour le système multi-plateformes
 */

export interface Platform {
  id: string;
  competition_id: string;
  name: string;
  location?: string;
  active: boolean;
  created_at: string;
}

export type SyncType = 'athlete_update' | 'attempt_result' | 'order_change';

export interface PlatformSyncLog {
  id: string;
  competition_id: string;
  source_platform_id: string;
  target_platform_id?: string;
  sync_type: SyncType;
  data: string; // JSON stringifié
  synced: boolean;
  timestamp: string;
}

export interface AthleteWithPlatform {
  id: string;
  competition_id: string;
  platform_id?: string;
  platform_name?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  weight_class: string;
  division: string;
  age_category: string;
  lot_number?: number;
  bodyweight?: number;
  squat_rack_height?: number;
  bench_rack_height?: number;
  created_at: string;
}

export interface AttemptWithPlatform {
  id: string;
  athlete_id: string;
  platform_id?: string;
  platform_name?: string;
  lift_type: 'squat' | 'bench' | 'deadlift';
  attempt_number: 1 | 2 | 3;
  weight_kg: number;
  successful: boolean;
  referee_lights?: [boolean, boolean, boolean];
  timestamp: string;
}

export interface MergedResult {
  athlete_id: string;
  athlete_name: string;
  gender: 'M' | 'F';
  weight_class: string;
  division: string;
  age_category: string;
  platform_id?: string;
  platform_name?: string;

  // Tentatives par mouvement
  squat_attempts: AttemptWithPlatform[];
  bench_attempts: AttemptWithPlatform[];
  deadlift_attempts: AttemptWithPlatform[];

  // Meilleurs résultats
  best_squat: number;
  best_bench: number;
  best_deadlift: number;
  total: number;

  // Métadonnées
  has_conflicting_data: boolean;
  last_updated: string;
}

export interface PlatformStats {
  platform_id: string;
  platform_name: string;
  total_athletes: number;
  athletes_in_progress: number;
  athletes_completed: number;
  current_lift_type?: 'squat' | 'bench' | 'deadlift';
  last_activity: string;
}

export interface SyncConfig {
  auto_sync: boolean;
  sync_interval: number; // en millisecondes
  conflict_resolution: 'latest' | 'manual' | 'source_priority';
  sync_attempts: boolean;
  sync_declarations: boolean;
}
