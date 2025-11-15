/**
 * Constantes de l'application
 */

export const FEDERATIONS = [
  { value: 'IPF', label: 'International Powerlifting Federation (IPF)' },
  { value: 'USAPL', label: 'USA Powerlifting (USAPL)' },
  { value: 'USPA', label: 'United States Powerlifting Association (USPA)' },
  { value: 'FFForce', label: 'Fédération Française de Force (FFForce)' },
] as const;

export const WEIGHT_CLASSES_MEN = [
  { value: '59', label: 'jusqu\'à 59 kg' },
  { value: '66', label: 'jusqu\'à 66 kg' },
  { value: '74', label: 'jusqu\'à 74 kg' },
  { value: '83', label: 'jusqu\'à 83 kg' },
  { value: '93', label: 'jusqu\'à 93 kg' },
  { value: '105', label: 'jusqu\'à 105 kg' },
  { value: '120', label: 'jusqu\'à 120 kg' },
  { value: '+120', label: 'plus de 120 kg' },
] as const;

export const WEIGHT_CLASSES_WOMEN = [
  { value: '47', label: 'jusqu\'à 47 kg' },
  { value: '52', label: 'jusqu\'à 52 kg' },
  { value: '57', label: 'jusqu\'à 57 kg' },
  { value: '63', label: 'jusqu\'à 63 kg' },
  { value: '69', label: 'jusqu\'à 69 kg' },
  { value: '76', label: 'jusqu\'à 76 kg' },
  { value: '84', label: 'jusqu\'à 84 kg' },
  { value: '+84', label: 'plus de 84 kg' },
] as const;

export const DIVISIONS = [
  { value: 'raw', label: 'Raw (sans équipement)' },
  { value: 'equipped', label: 'Equipped (avec équipement)' },
] as const;

export const AGE_CATEGORIES = [
  { value: 'Sub-Junior', label: 'Sub-Junior (< 14 ans)' },
  { value: 'Junior', label: 'Junior (14-18 ans)' },
  { value: 'Sub-Master', label: 'Sub-Master (19-23 ans)' },
  { value: 'Open', label: 'Open (24-39 ans)' },
  { value: 'Master 1', label: 'Master 1 (40-49 ans)' },
  { value: 'Master 2', label: 'Master 2 (50-59 ans)' },
  { value: 'Master 3', label: 'Master 3 (60-69 ans)' },
  { value: 'Master 4', label: 'Master 4 (70+ ans)' },
] as const;

export const LIFT_TYPES = [
  { value: 'squat', label: 'Squat', color: '#1890ff' },
  { value: 'bench', label: 'Bench Press', color: '#52c41a' },
  { value: 'deadlift', label: 'Deadlift', color: '#ff4d4f' },
] as const;

// Règles de timing IPF
export const TIMING_RULES = {
  ATTEMPT_TIME: 60, // 60 secondes par tentative
  CHANGE_DEADLINE: 3, // Changements autorisés jusqu'à 3 athlètes avant
  REST_BETWEEN_ATTEMPTS: 120, // 2 minutes de repos minimum entre tentatives
} as const;

// Poids des barres et disques standards IPF (en kg)
export const EQUIPMENT_WEIGHTS = {
  BAR_WEIGHT: 20, // Barre olympique
  PLATES: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25],
  COLLARS: 2.5, // Paire de colliers
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  INVALID_WEIGHT_CLASS: 'Le poids corporel ne correspond pas à la catégorie sélectionnée',
  ATTEMPT_ALREADY_EXISTS: 'Cette tentative a déjà été enregistrée',
  COMPETITION_NOT_FOUND: 'Compétition introuvable',
  ATHLETE_NOT_FOUND: 'Athlète introuvable',
  DATABASE_ERROR: 'Erreur de base de données',
} as const;
