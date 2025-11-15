export interface Competition {
  id: string;
  name: string;
  date: string;
  location?: string;
  federation: 'IPF' | 'USAPL' | 'USPA' | 'FFForce';
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Athlete {
  id: string;
  competition_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  weight_class: string;
  division: 'raw' | 'equipped';
  age_category: string;
  lot_number?: number;
  bodyweight?: number;
  squat_rack_height?: number;
  bench_rack_height?: number;
  created_at: string;
}

export interface Attempt {
  id: string;
  athlete_id: string;
  lift_type: 'squat' | 'bench' | 'deadlift';
  attempt_number: 1 | 2 | 3;
  weight_kg: number;
  successful: boolean;
  referee_lights?: [boolean, boolean, boolean];
  timestamp: string;
}

// Catégories de poids IPF
export const WEIGHT_CLASSES = {
  men: [59, 66, 74, 83, 93, 105, 120, '+120'],
  women: [47, 52, 57, 63, 69, 76, 84, '+84']
} as const;

export type WeightClass = typeof WEIGHT_CLASSES.men[number] | typeof WEIGHT_CLASSES.women[number];
