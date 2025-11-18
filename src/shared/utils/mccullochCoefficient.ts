/**
 * Coefficient McCulloch pour ajustement d'âge Masters
 * Utilisé pour normaliser les performances des athlètes Masters selon leur âge
 *
 * Formule : A + B×age + C×age² + D×age³ + E×age⁴
 * où les coefficients varient selon le genre
 */

interface McCullochCoefficients {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

// Coefficients officiels McCulloch pour hommes
const MALE_COEFFICIENTS: McCullochCoefficients = {
  A: 0.0000000140,
  B: 0.0000084716,
  C: -0.0019419963,
  D: 0.2144950357,
  E: -9.9881273704,
};

// Coefficients officiels McCulloch pour femmes
const FEMALE_COEFFICIENTS: McCullochCoefficients = {
  A: 0.0000001072,
  B: -0.0000090614,
  C: 0.0002697700,
  D: -0.0341371000,
  E: 1.6662735000,
};

/**
 * Calcule le coefficient McCulloch pour un âge et un genre donnés
 *
 * @param age - Âge de l'athlète (doit être >= 40 ans)
 * @param gender - Genre ('M' ou 'F')
 * @returns Coefficient McCulloch (multiplicateur)
 */
export function calculateMcCullochCoefficient(
  age: number,
  gender: 'M' | 'F'
): number {
  // Pas d'ajustement pour les athlètes de moins de 40 ans
  if (age < 40) {
    return 1.0;
  }

  const coef = gender === 'M' ? MALE_COEFFICIENTS : FEMALE_COEFFICIENTS;

  // Formule polynomiale de degré 4
  const coefficient =
    coef.A * Math.pow(age, 4) +
    coef.B * Math.pow(age, 3) +
    coef.C * Math.pow(age, 2) +
    coef.D * age +
    coef.E;

  // Le coefficient doit être >= 1.0
  return Math.max(1.0, coefficient);
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
