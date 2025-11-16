export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  federation: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateCompetitionInput {
  name: string;
  date: string;
  location: string;
  federation: string;
}

export interface UpdateCompetitionInput {
  name?: string;
  date?: string;
  location?: string;
  federation?: string;
  status?: 'upcoming' | 'in_progress' | 'completed';
}
