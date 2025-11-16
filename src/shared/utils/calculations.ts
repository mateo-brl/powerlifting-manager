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
 * Formula: DOTS = Total * (500 / (A + B*BW + C*BW^2 + D*BW^3 + E*BW^4))
 * @param total - Total soulevé en kg
 * @param bodyweight - Poids corporel en kg
 * @param gender - Sexe ('M' ou 'F')
 * @returns Points DOTS
 */
export function calculateDOTS(
  total: number,
  bodyweight: number,
  gender: 'M' | 'F'
): number {
  if (total <= 0 || bodyweight <= 0) return 0;

  // DOTS Coefficients
  const coefficients = gender === 'M'
    ? {
        A: -0.0000010930,
        B: 0.0007391293,
        C: -0.1918759221,
        D: 24.0900756,
        E: -307.75076,
      }
    : {
        A: -0.0000010706,
        B: 0.0005158568,
        C: -0.1126655495,
        D: 13.6175032,
        E: -57.96288,
      };

  const denominator =
    coefficients.E +
    coefficients.D * bodyweight +
    coefficients.C * Math.pow(bodyweight, 2) +
    coefficients.B * Math.pow(bodyweight, 3) +
    coefficients.A * Math.pow(bodyweight, 4);

  const dots = (500 / denominator) * total;
  return Number(dots.toFixed(2));
}

/**
 * Calcule les points Wilks (formule classique)
 * Formula: Wilks = Total * Coefficient
 * Coefficient = 500 / (a + b*BW + c*BW^2 + d*BW^3 + e*BW^4 + f*BW^5)
 * @param total - Total soulevé en kg
 * @param bodyweight - Poids corporel en kg
 * @param gender - Sexe ('M' ou 'F')
 * @returns Points Wilks
 */
export function calculateWilks(
  total: number,
  bodyweight: number,
  gender: 'M' | 'F'
): number {
  if (total <= 0 || bodyweight <= 0) return 0;

  // Wilks Coefficients (2020 formula)
  const coefficients = gender === 'M'
    ? {
        a: 47.4617885411949,
        b: 8.47206137941125,
        c: 0.073694103462609,
        d: -0.00139583381094385,
        e: 7.07665973070743e-6,
        f: -1.20804336482315e-8,
      }
    : {
        a: -125.425539779509,
        b: 13.7121941940668,
        c: -0.0330725063103405,
        d: -0.0010504000506583,
        e: 9.38773881462799e-6,
        f: -2.3334613884954e-8,
      };

  const denominator =
    coefficients.a +
    coefficients.b * bodyweight +
    coefficients.c * Math.pow(bodyweight, 2) +
    coefficients.d * Math.pow(bodyweight, 3) +
    coefficients.e * Math.pow(bodyweight, 4) +
    coefficients.f * Math.pow(bodyweight, 5);

  const coefficient = 500 / denominator;
  const wilks = total * coefficient;
  return Number(wilks.toFixed(2));
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
