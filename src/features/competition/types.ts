export type CompetitionFormat = 'full_power' | 'bench_only';

export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  federation: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  format: CompetitionFormat;
  created_at: string;
  updated_at: string;
}

export interface CreateCompetitionInput {
  name: string;
  date: string;
  location: string;
  federation: string;
  format?: CompetitionFormat;
}

export interface UpdateCompetitionInput {
  name?: string;
  date?: string;
  location?: string;
  federation?: string;
  status?: 'upcoming' | 'in_progress' | 'completed';
  format?: CompetitionFormat;
}
