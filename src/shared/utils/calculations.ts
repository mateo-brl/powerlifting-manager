/**
 * Calculs de scores de powerlifting
 * Formules IPF GL Points, Wilks, et DOTS
 */

interface IPFCoefficients {
  A: number;
  B: number;
  C: number;
  D: number;
}

const IPF_GL_COEFFICIENTS: Record<'M' | 'F', IPFCoefficients> = {
  M: {
    A: -1055.41,
    B: 0.633145,
    C: -0.0001,
    D: 0.0000001,
  },
  F: {
    A: -125.44,
    B: 0.0796,
    C: -0.0000115,
    D: 0.000000015,
  },
};

/**
 * Calcule les points IPF GL (formule 2020)
 * @param total - Total soulevé en kg
 * @param bodyweight - Poids corporel en kg
 * @param gender - Sexe ('M' ou 'F')
 * @returns Points IPF GL
 */
export function calculateIPFGLPoints(
  total: number,
  bodyweight: number,
  gender: 'M' | 'F'
): number {
  if (total <= 0 || bodyweight <= 0) return 0;

  const c = IPF_GL_COEFFICIENTS[gender];
  const glPoints =
    100 /
    (c.A +
      c.B * bodyweight +
      c.C * Math.pow(bodyweight, 2) +
      c.D * Math.pow(bodyweight, 3));

  return Number((total * glPoints).toFixed(2));
}

/**
 * Calcule les points DOTS
 * @param total - Total soulevé en kg
 * @param bodyweight - Poids corporel en kg
 * @param gender - Sexe ('M' ou 'F')
 * @returns Points DOTS
 */
export function calculateDOTS(
  _total: number,
  _bodyweight: number,
  _gender: 'M' | 'F'
): number {
  // Coefficients DOTS (à implémenter selon la formule officielle)
  // TODO: Implémenter la formule DOTS complète
  return 0;
}

/**
 * Calcule les points Wilks (formule classique)
 * @param total - Total soulevé en kg
 * @param bodyweight - Poids corporel en kg
 * @param gender - Sexe ('M' ou 'F')
 * @returns Points Wilks
 */
export function calculateWilks(
  _total: number,
  _bodyweight: number,
  _gender: 'M' | 'F'
): number {
  // Coefficients Wilks (formule 2020 deprecated mais encore utilisée)
  // TODO: Implémenter la formule Wilks
  return 0;
}

/**
 * Détermine la catégorie d'âge selon les règles IPF
 * @param dateOfBirth - Date de naissance
 * @param competitionDate - Date de la compétition
 * @returns Catégorie d'âge
 */
export function getAgeCategory(
  dateOfBirth: Date,
  competitionDate: Date
): string {
  const age = competitionDate.getFullYear() - dateOfBirth.getFullYear();

  if (age < 14) return 'Sub-Junior';
  if (age >= 14 && age <= 18) return 'Junior';
  if (age >= 19 && age <= 23) return 'Sub-Master';
  if (age >= 24 && age <= 39) return 'Open';
  if (age >= 40 && age <= 49) return 'Master 1';
  if (age >= 50 && age <= 59) return 'Master 2';
  if (age >= 60 && age <= 69) return 'Master 3';
  return 'Master 4';
}

/**
 * Calcule la catégorie d'âge automatiquement à partir de la date de naissance
 * @param dateOfBirth - Date de naissance
 * @returns Catégorie d'âge
 */
export function calculateAgeCategory(dateOfBirth: Date): string {
  const today = new Date();
  return getAgeCategory(dateOfBirth, today);
}

/**
 * Valide qu'un poids est dans la catégorie spécifiée
 * @param bodyweight - Poids corporel en kg
 * @param weightClass - Catégorie de poids
 * @param gender - Sexe
 * @returns true si le poids est valide pour la catégorie
 */
export function isWeightClassValid(
  bodyweight: number,
  weightClass: string,
  gender: 'M' | 'F'
): boolean {
  const maxWeight = parseFloat(weightClass.replace('+', ''));

  if (weightClass.includes('+')) {
    return bodyweight > maxWeight;
  }

  // Déterminer la limite inférieure
  const weightClasses =
    gender === 'M'
      ? [59, 66, 74, 83, 93, 105, 120]
      : [47, 52, 57, 63, 69, 76, 84];

  const index = weightClasses.indexOf(maxWeight);
  const minWeight = index > 0 ? weightClasses[index - 1] : 0;

  return bodyweight > minWeight && bodyweight <= maxWeight;
}
