export interface Athlete {
  id: string;
  competition_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  weight_class: string;
  division: string;
  age_category: string;
  lot_number?: number;
  bodyweight?: number;
  team?: string;
  squat_rack_height?: number;
  bench_rack_height?: number;
  created_at: string;
}

export interface CreateAthleteInput {
  competition_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  weight_class: string;
  division: string;
  age_category: string;
}

export interface UpdateAthleteInput {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  weight_class?: string;
  division?: string;
  age_category?: string;
  lot_number?: number;
  squat_rack_height?: number;
  bench_rack_height?: number;
}
