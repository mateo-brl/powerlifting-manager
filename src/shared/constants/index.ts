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
  { value: '53', label: 'jusqu\'à 53 kg (Sub-Junior/Junior)' },
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
  { value: '43', label: 'jusqu\'à 43 kg (Sub-Junior/Junior)' },
  { value: '47', label: 'jusqu\'à 47 kg' },
  { value: '52', label: 'jusqu\'à 52 kg' },
  { value: '57', label: 'jusqu\'à 57 kg' },
  { value: '63', label: 'jusqu\'à 63 kg' },
  { value: '69', label: 'jusqu\'à 69 kg' },
  { value: '76', label: 'jusqu\'à 76 kg' },
  { value: '84', label: 'jusqu\'à 84 kg' },
  { value: '+84', label: 'plus de 84 kg' },
] as const;


export const AGE_CATEGORIES = [
  'Sub-Junior',
  'Junior',
  'Seniors', // 24-39 ans (FFForce)
  'Sub-Master',
  'Open',
  'Master 1',
  'Master 2',
  'Master 3',
  'Master 4',
] as const;

export const WEIGHT_CLASSES = {
  men: ['53kg', '59kg', '66kg', '74kg', '83kg', '93kg', '105kg', '120kg', '+120kg'],
  women: ['43kg', '47kg', '52kg', '57kg', '63kg', '69kg', '76kg', '84kg', '+84kg'],
} as const;

export const DIVISIONS = [
  'raw',
  'wraps',        // Raw avec genouillères autorisées
  'single-ply',   // Équipement single-ply
  'multi-ply',    // Équipement multi-ply
  'equipped'      // Équipé (ancien terme générique)
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
  PROTEST_DEADLINE_EXPIRED: 'Le délai de protestation de 60 secondes est dépassé',
  PROTEST_REASON_TOO_SHORT: 'La raison de la protestation doit contenir au moins 20 caractères',
  EQUIPMENT_NOT_VALIDATED: 'L\'équipement de l\'athlète n\'a pas été validé',
} as const;

// Re-export IPF Equipment constants
export * from './ipfEquipment';
