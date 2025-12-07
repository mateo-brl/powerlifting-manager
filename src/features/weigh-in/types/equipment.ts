/**
 * Types pour la validation d'équipement IPF
 * Système de validation conforme aux règles IPF/FFForce
 */

export type EquipmentCategory =
  | 'singlet'
  | 'belt'
  | 'knee_sleeves'
  | 'wrist_wraps'
  | 'shoes';

export interface AthleteEquipment {
  weigh_in_id: string;
  athlete_id: string;
  athlete_name: string;
  equipment_singlet?: string;
  equipment_singlet_brand?: string;
  equipment_belt?: string;
  equipment_belt_brand?: string;
  equipment_knee_sleeves?: string;
  equipment_knee_sleeves_brand?: string;
  equipment_wrist_wraps?: string;
  equipment_wrist_wraps_brand?: string;
  equipment_shoes?: string;
  equipment_shoes_brand?: string;
  equipment_validated: boolean;
  equipment_validator_name?: string;
  equipment_validation_timestamp?: number;
}

export interface UpdateEquipmentInput {
  weigh_in_id: string;
  equipment_singlet?: string;
  equipment_singlet_brand?: string;
  equipment_belt?: string;
  equipment_belt_brand?: string;
  equipment_knee_sleeves?: string;
  equipment_knee_sleeves_brand?: string;
  equipment_wrist_wraps?: string;
  equipment_wrist_wraps_brand?: string;
  equipment_shoes?: string;
  equipment_shoes_brand?: string;
}

export interface ValidateEquipmentInput {
  weigh_in_id: string;
  validator_name: string;
}

export interface EquipmentFormValues {
  singlet?: string;
  singlet_brand?: string;
  belt?: string;
  belt_brand?: string;
  knee_sleeves?: string;
  knee_sleeves_brand?: string;
  wrist_wraps?: string;
  wrist_wraps_brand?: string;
  shoes?: string;
  shoes_brand?: string;
}

export interface EquipmentValidationStatus {
  athlete_id: string;
  athlete_name: string;
  is_validated: boolean;
  validator_name?: string;
  validation_timestamp?: number;
  has_non_ipf_equipment: boolean;
  missing_required_equipment: EquipmentCategory[];
}

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, { fr: string; en: string }> = {
  singlet: { fr: 'Combinaison', en: 'Singlet' },
  belt: { fr: 'Ceinture', en: 'Belt' },
  knee_sleeves: { fr: 'Genouillères', en: 'Knee Sleeves' },
  wrist_wraps: { fr: 'Bandes de poignets', en: 'Wrist Wraps' },
  shoes: { fr: 'Chaussures', en: 'Shoes' },
};

export const REQUIRED_EQUIPMENT: EquipmentCategory[] = ['singlet', 'shoes'];

export const OPTIONAL_EQUIPMENT: EquipmentCategory[] = ['belt', 'knee_sleeves', 'wrist_wraps'];
