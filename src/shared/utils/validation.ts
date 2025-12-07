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

/**
 * Schéma de validation pour les protestations IPF
 * Délai de 60 secondes, raison minimum 20 caractères
 */
export const ProtestSchema = z.object({
  id: z.string().uuid().optional(),
  competition_id: z.string().uuid(),
  athlete_id: z.string().uuid(),
  attempt_id: z.string().uuid(),
  protest_type: z.enum(['referee_decision', 'equipment', 'procedure'], {
    errorMap: () => ({ message: 'Type de protestation invalide' }),
  }),
  reason: z.string().min(20, 'La raison doit contenir au moins 20 caractères'),
  timestamp: z.number().int().optional(),
  protest_deadline: z.number().int().optional(),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
  jury_decision: z.string().optional(),
  jury_notes: z.string().optional(),
  created_at: z.number().int().optional(),
});

export const ProtestFormSchema = z.object({
  protest_type: z.enum(['referee_decision', 'equipment', 'procedure'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un type de protestation' }),
  }),
  reason: z
    .string()
    .min(20, 'La raison doit contenir au moins 20 caractères')
    .max(500, 'La raison ne peut pas dépasser 500 caractères'),
});

export const ResolveProtestSchema = z.object({
  protest_id: z.string().uuid(),
  decision: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: 'Décision invalide' }),
  }),
  jury_notes: z.string().min(1, 'Les notes du jury sont requises'),
});

/**
 * Schéma de validation pour l'équipement athlète
 */
export const EquipmentSchema = z.object({
  weigh_in_id: z.string().uuid(),
  equipment_singlet: z.string().optional(),
  equipment_singlet_brand: z.string().optional(),
  equipment_belt: z.string().optional(),
  equipment_belt_brand: z.string().optional(),
  equipment_knee_sleeves: z.string().optional(),
  equipment_knee_sleeves_brand: z.string().optional(),
  equipment_wrist_wraps: z.string().optional(),
  equipment_wrist_wraps_brand: z.string().optional(),
  equipment_shoes: z.string().optional(),
  equipment_shoes_brand: z.string().optional(),
});

export const EquipmentFormSchema = z.object({
  singlet: z.string().min(1, 'La combinaison est requise'),
  singlet_brand: z.string().min(1, 'La marque de combinaison est requise'),
  belt: z.string().optional(),
  belt_brand: z.string().optional(),
  knee_sleeves: z.string().optional(),
  knee_sleeves_brand: z.string().optional(),
  wrist_wraps: z.string().optional(),
  wrist_wraps_brand: z.string().optional(),
  shoes: z.string().min(1, 'Les chaussures sont requises'),
  shoes_brand: z.string().min(1, 'La marque de chaussures est requise'),
}).refine(
  (data) => {
    // Si une ceinture est spécifiée, la marque doit l'être aussi
    if (data.belt && !data.belt_brand) return false;
    if (data.knee_sleeves && !data.knee_sleeves_brand) return false;
    if (data.wrist_wraps && !data.wrist_wraps_brand) return false;
    return true;
  },
  {
    message: 'La marque est requise pour chaque équipement spécifié',
  }
);

export const ValidateEquipmentSchema = z.object({
  weigh_in_id: z.string().uuid(),
  validator_name: z.string().min(2, 'Le nom du validateur est requis'),
});

// Types TypeScript inférés
export type CompetitionInput = z.infer<typeof CompetitionSchema>;
export type AthleteInput = z.infer<typeof AthleteSchema>;
export type AttemptInput = z.infer<typeof AttemptSchema>;
export type ProtestInput = z.infer<typeof ProtestSchema>;
export type ProtestFormInput = z.infer<typeof ProtestFormSchema>;
export type ResolveProtestInput = z.infer<typeof ResolveProtestSchema>;
export type EquipmentInput = z.infer<typeof EquipmentSchema>;
export type EquipmentFormInput = z.infer<typeof EquipmentFormSchema>;
export type ValidateEquipmentInput = z.infer<typeof ValidateEquipmentSchema>;
