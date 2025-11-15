import { z } from 'zod';

/**
 * Schémas de validation Zod pour les entités principales
 */

export const CompetitionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  date: z.string().datetime(),
  location: z.string().optional(),
  federation: z.enum(['IPF', 'USAPL', 'USPA', 'FFForce']),
  status: z.enum(['upcoming', 'active', 'completed']).default('upcoming'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const AthleteSchema = z.object({
  id: z.string().uuid().optional(),
  competition_id: z.string().uuid(),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  date_of_birth: z.string().datetime(),
  gender: z.enum(['M', 'F']),
  weight_class: z.string(),
  division: z.enum(['raw', 'equipped']).default('raw'),
  age_category: z.string(),
  lot_number: z.number().int().positive().optional(),
  bodyweight: z.number().positive().optional(),
  squat_rack_height: z.number().int().min(1).max(30).optional(),
  bench_rack_height: z.number().int().min(1).max(30).optional(),
  created_at: z.string().datetime().optional(),
});

export const AttemptSchema = z.object({
  id: z.string().uuid().optional(),
  athlete_id: z.string().uuid(),
  lift_type: z.enum(['squat', 'bench', 'deadlift']),
  attempt_number: z.number().int().min(1).max(3),
  weight_kg: z.number().positive(),
  successful: z.boolean().default(false),
  referee_lights: z.tuple([z.boolean(), z.boolean(), z.boolean()]).optional(),
  timestamp: z.string().datetime().optional(),
});

// Types TypeScript inférés
export type CompetitionInput = z.infer<typeof CompetitionSchema>;
export type AthleteInput = z.infer<typeof AthleteSchema>;
export type AttemptInput = z.infer<typeof AttemptSchema>;
