/**
 * Coefficient McCulloch pour ajustement d'âge Masters
 * Utilisé pour normaliser les performances des athlètes Masters selon leur âge
 *
 * Table de coefficients officiels McCulloch par tranche d'âge
 */

// Table officielle des coefficients McCulloch par âge
// Source: IPF/USAPL Age Coefficients
const MCCULLOCH_TABLE: Record<number, number> = {
  40: 1.000,
  41: 1.010,
  42: 1.020,
  43: 1.031,
  44: 1.043,
  45: 1.055,
  46: 1.068,
  47: 1.082,
  48: 1.097,
  49: 1.113,
  50: 1.130,
  51: 1.147,
  52: 1.165,
  53: 1.184,
  54: 1.204,
  55: 1.225,
  56: 1.246,
  57: 1.268,
  58: 1.291,
  59: 1.315,
  60: 1.340,
  61: 1.366,
  62: 1.393,
  63: 1.421,
  64: 1.450,
  65: 1.480,
  66: 1.511,
  67: 1.543,
  68: 1.576,
  69: 1.610,
  70: 1.645,
  71: 1.681,
  72: 1.718,
  73: 1.756,
  74: 1.795,
  75: 1.835,
  76: 1.876,
  77: 1.918,
  78: 1.961,
  79: 2.005,
  80: 2.050,
  81: 2.096,
  82: 2.143,
  83: 2.191,
  84: 2.240,
  85: 2.290,
  86: 2.341,
  87: 2.393,
  88: 2.446,
  89: 2.500,
  90: 2.555,
};

/**
 * Calcule le coefficient McCulloch pour un âge donné
 * Les coefficients sont identiques pour hommes et femmes
 *
 * @param age - Âge de l'athlète (doit être >= 40 ans)
 * @param _gender - Genre (non utilisé, gardé pour compatibilité)
 * @returns Coefficient McCulloch (multiplicateur)
 */
export function calculateMcCullochCoefficient(
  age: number,
  _gender: 'M' | 'F'
): number {
  // Pas d'ajustement pour les athlètes de moins de 40 ans
  if (age < 40) {
    return 1.0;
  }

  // Pour les âges > 90, utiliser le coefficient de 90 ans
  const lookupAge = Math.min(Math.floor(age), 90);

  return MCCULLOCH_TABLE[lookupAge] || 1.0;
}

/**
 * Applique le coefficient McCulloch à un total
 *
 * @param total - Total brut (en kg)
 * @param age - Âge de l'athlète
 * @param gender - Genre ('M' ou 'F')
 * @returns Total ajusté avec coefficient McCulloch
 */
export function applyMcCullochCoefficient(
  total: number,
  age: number,
  gender: 'M' | 'F'
): number {
  const coefficient = calculateMcCullochCoefficient(age, gender);
  return total * coefficient;
}

/**
 * Calcule l'âge à partir de la date de naissance et d'une date de référence
 *
 * @param dateOfBirth - Date de naissance (format ISO string)
 * @param referenceDate - Date de référence (format ISO string), par défaut aujourd'hui
 * @returns Âge en années
 */
export function calculateAge(
  dateOfBirth: string,
  referenceDate: string = new Date().toISOString()
): number {
  const birth = new Date(dateOfBirth);
  const ref = new Date(referenceDate);

  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();

  // Ajuster si l'anniversaire n'est pas encore passé cette année
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Détermine si un athlète est éligible au coefficient McCulloch
 * (catégories Masters : 40 ans et plus)
 *
 * @param ageCategory - Catégorie d'âge
 * @returns true si éligible au coefficient McCulloch
 */
export function isMasterCategory(ageCategory: string): boolean {
  const masterCategories = [
    'Master 1',
    'Master 2',
    'Master 3',
    'Master 4',
    'Masters 1',
    'Masters 2',
    'Masters 3',
    'Masters 4',
  ];

  return masterCategories.some(
    (cat) => ageCategory.toLowerCase().includes(cat.toLowerCase())
  );
}

/**
 * Calcule les totaux ajustés McCulloch pour un résultat
 *
 * @param result - Résultat avec total, age, gender
 * @returns Objet avec total brut, total ajusté, et coefficient
 */
export function calculateAdjustedTotal(result: {
  total: number;
  age: number;
  gender: 'M' | 'F';
  age_category: string;
}): {
  rawTotal: number;
  adjustedTotal: number;
  mccullochCoefficient: number;
  isMaster: boolean;
} {
  const isMaster = isMasterCategory(result.age_category);
  const coefficient = isMaster
    ? calculateMcCullochCoefficient(result.age, result.gender)
    : 1.0;

  return {
    rawTotal: result.total,
    adjustedTotal: result.total * coefficient,
    mccullochCoefficient: coefficient,
    isMaster,
  };
}

/**
 * Tableau de référence des coefficients McCulloch par âge
 * (pour affichage et référence)
 */
export function getMcCullochTable(
  gender: 'M' | 'F',
  startAge: number = 40,
  endAge: number = 90
): Array<{ age: number; coefficient: number }> {
  const table: Array<{ age: number; coefficient: number }> = [];

  for (let age = startAge; age <= endAge; age++) {
    table.push({
      age,
      coefficient: calculateMcCullochCoefficient(age, gender),
    });
  }

  return table;
}
