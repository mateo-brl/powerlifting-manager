/**
 * Bar Loading Calculator for IPF Powerlifting
 *
 * Calculates the optimal plate combination for loading a barbell
 * according to IPF standards.
 */

export interface Plate {
  weight: number;
  color: string;
  count: number;
}

export interface BarLoadingResult {
  targetWeight: number;
  barWeight: number;
  platePerSide: number;
  plates: Plate[];
  totalPlates: number;
  isExact: boolean;
  actualWeight: number;
}

/**
 * IPF Standard Competition Plates
 * Colors according to IPF Technical Rules
 */
export const IPF_PLATES = [
  { weight: 25, color: '#FF0000' },   // Red
  { weight: 20, color: '#0000FF' },   // Blue
  { weight: 15, color: '#FFFF00' },   // Yellow
  { weight: 10, color: '#00FF00' },   // Green
  { weight: 5, color: '#FFFFFF' },    // White
  { weight: 2.5, color: '#FF0000' },  // Red (small)
  { weight: 1.25, color: '#FFFFFF' }, // Chrome/White (small)
  { weight: 0.5, color: '#808080' },  // Grey (change)
  { weight: 0.25, color: '#808080' }, // Grey (change)
];

/**
 * Standard bar weights
 * Note: In IPF powerlifting, both men and women use 20kg bars
 */
export const BAR_WEIGHTS = {
  men: 20,
  women: 20,
};

/**
 * IPF collar weight (2.5kg each, 5kg total for both)
 */
export const COLLAR_WEIGHT = 2.5; // per collar
export const TOTAL_COLLAR_WEIGHT = COLLAR_WEIGHT * 2; // 5kg total

/**
 * Calculate the optimal plate combination for a target weight
 *
 * @param targetWeight - The total weight to lift (kg)
 * @param barWeight - Weight of the bar (20kg standard in IPF)
 * @param availablePlates - Optional array of available plate weights
 * @returns BarLoadingResult with plate combination
 */
export function calculateBarLoading(
  targetWeight: number,
  barWeight: number = BAR_WEIGHTS.men,
  availablePlates: number[] = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25]
): BarLoadingResult {
  // Calculate weight needed on each side (subtract bar + collars)
  const totalPlateWeight = targetWeight - barWeight - TOTAL_COLLAR_WEIGHT;
  const platePerSide = totalPlateWeight / 2;

  // Check if weight is valid
  if (platePerSide < 0) {
    return {
      targetWeight,
      barWeight,
      platePerSide: 0,
      plates: [],
      totalPlates: 0,
      isExact: false,
      actualWeight: barWeight,
    };
  }

  // Use greedy algorithm to find plate combination
  const plates: Plate[] = [];
  let remainingWeight = platePerSide;
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);

  for (const plateWeight of sortedPlates) {
    if (remainingWeight >= plateWeight) {
      const count = Math.floor(remainingWeight / plateWeight);
      if (count > 0) {
        const plateInfo = IPF_PLATES.find(p => p.weight === plateWeight);
        plates.push({
          weight: plateWeight,
          color: plateInfo?.color || '#808080',
          count,
        });
        remainingWeight = Math.round((remainingWeight - (plateWeight * count)) * 100) / 100;
      }
    }
  }

  const totalPlatesUsed = plates.reduce((sum, p) => sum + p.count, 0);
  const actualPlateWeight = plates.reduce((sum, p) => sum + (p.weight * p.count), 0);
  const actualWeight = barWeight + TOTAL_COLLAR_WEIGHT + (actualPlateWeight * 2);
  const isExact = Math.abs(actualWeight - targetWeight) < 0.01;

  return {
    targetWeight,
    barWeight,
    platePerSide,
    plates,
    totalPlates: totalPlatesUsed,
    isExact,
    actualWeight,
  };
}

/**
 * Format plate loading as a readable string
 * Example: "2x 25kg + 1x 20kg + 1x 5kg per side"
 */
export function formatBarLoading(result: BarLoadingResult): string {
  if (result.plates.length === 0) {
    return 'Bar only (no plates)';
  }

  const plateStrings = result.plates.map(p => `${p.count}x ${p.weight}kg`);
  return plateStrings.join(' + ') + ' per side';
}

/**
 * Get the loading order (from center to sleeve)
 * Heaviest plates closest to center
 */
export function getLoadingOrder(result: BarLoadingResult): Plate[] {
  return [...result.plates].sort((a, b) => b.weight - a.weight);
}
