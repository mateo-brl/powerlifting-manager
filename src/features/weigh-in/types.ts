export interface WeighIn {
  id: string;
  athlete_id: string;
  competition_id: string;
  bodyweight: number;
  weighed_in_at: string;
  opening_squat: number;
  opening_bench: number;
  opening_deadlift: number;
  squat_rack_height?: number;
  bench_rack_height?: number;
  flight?: string;
  lot_number?: number;
}

export interface CreateWeighInInput {
  athlete_id: string;
  competition_id: string;
  bodyweight: number;
  opening_squat: number;
  opening_bench: number;
  opening_deadlift: number;
  squat_rack_height?: number;
  bench_rack_height?: number;
}

export interface Flight {
  id: string;
  competition_id: string;
  name: string;
  athlete_ids: string[];
  lift_type: 'squat' | 'bench' | 'deadlift';
  status: 'pending' | 'active' | 'completed';
  created_at: string;
}

export interface AttemptOrder {
  athlete_id: string;
  athlete_name: string;
  attempt_number: 1 | 2 | 3;
  weight_kg: number;
  lot_number: number;
  rack_height?: number;
}
