import { describe, it, expect } from 'vitest';
import {
  calculateIPFGLPoints,
  calculateDOTS,
  calculateWilks,
  getAgeCategory,
  calculateAgeCategory,
  isWeightClassValid,
} from './calculations';

describe('calculateIPFGLPoints', () => {
  describe('valid inputs', () => {
    it('should calculate IPF GL points for male athlete', () => {
      // Athlète homme de 83kg avec un total de 600kg
      const points = calculateIPFGLPoints(600, 83, 'M');
      expect(points).toBeGreaterThan(0);
      // IPF GL pour homme 83kg, 600kg total devrait être autour de 90-100
      expect(points).toBeGreaterThan(80);
      expect(points).toBeLessThan(120);
    });

    it('should calculate IPF GL points for female athlete', () => {
      // Athlète femme de 63kg avec un total de 400kg
      const points = calculateIPFGLPoints(400, 63, 'F');
      expect(points).toBeGreaterThan(0);
      // IPF GL pour femme 63kg, 400kg total devrait être autour de 90-110
      expect(points).toBeGreaterThan(80);
      expect(points).toBeLessThan(120);
    });

    it('should return higher points for same total at lighter bodyweight', () => {
      const pointsLight = calculateIPFGLPoints(500, 66, 'M');
      const pointsHeavy = calculateIPFGLPoints(500, 93, 'M');
      expect(pointsLight).toBeGreaterThan(pointsHeavy);
    });

    it('should return higher points for higher total at same bodyweight', () => {
      const pointsLow = calculateIPFGLPoints(400, 83, 'M');
      const pointsHigh = calculateIPFGLPoints(600, 83, 'M');
      expect(pointsHigh).toBeGreaterThan(pointsLow);
    });

    it('should scale linearly with total', () => {
      const points500 = calculateIPFGLPoints(500, 83, 'M');
      const points1000 = calculateIPFGLPoints(1000, 83, 'M');
      // Points should roughly double when total doubles
      expect(points1000 / points500).toBeCloseTo(2, 1);
    });
  });

  describe('edge cases', () => {
    it('should return 0 for zero total', () => {
      expect(calculateIPFGLPoints(0, 83, 'M')).toBe(0);
    });

    it('should return 0 for negative total', () => {
      expect(calculateIPFGLPoints(-100, 83, 'M')).toBe(0);
    });

    it('should return 0 for zero bodyweight', () => {
      expect(calculateIPFGLPoints(500, 0, 'M')).toBe(0);
    });

    it('should return 0 for negative bodyweight', () => {
      expect(calculateIPFGLPoints(500, -83, 'M')).toBe(0);
    });
  });
});

describe('calculateDOTS', () => {
  describe('valid inputs', () => {
    it('should calculate DOTS points for male athlete', () => {
      const points = calculateDOTS(600, 83, 'M');
      expect(points).toBeGreaterThan(0);
      // DOTS pour homme 83kg, 600kg total
      expect(points).toBeGreaterThan(350);
      expect(points).toBeLessThan(450);
    });

    it('should calculate DOTS points for female athlete', () => {
      const points = calculateDOTS(400, 63, 'F');
      expect(points).toBeGreaterThan(0);
      // DOTS pour femme 63kg, 400kg total
      expect(points).toBeGreaterThan(380);
      expect(points).toBeLessThan(480);
    });

    it('should return higher points for same total at lighter bodyweight', () => {
      const pointsLight = calculateDOTS(500, 66, 'M');
      const pointsHeavy = calculateDOTS(500, 93, 'M');
      expect(pointsLight).toBeGreaterThan(pointsHeavy);
    });

    it('should scale linearly with total', () => {
      const points500 = calculateDOTS(500, 83, 'M');
      const points1000 = calculateDOTS(1000, 83, 'M');
      expect(points1000 / points500).toBeCloseTo(2, 1);
    });
  });

  describe('edge cases', () => {
    it('should return 0 for zero total', () => {
      expect(calculateDOTS(0, 83, 'M')).toBe(0);
    });

    it('should return 0 for negative total', () => {
      expect(calculateDOTS(-100, 83, 'M')).toBe(0);
    });

    it('should return 0 for zero bodyweight', () => {
      expect(calculateDOTS(500, 0, 'M')).toBe(0);
    });

    it('should return 0 for negative bodyweight', () => {
      expect(calculateDOTS(500, -83, 'M')).toBe(0);
    });

    it('should handle extreme bodyweights gracefully', () => {
      // Very light bodyweight
      const lightPoints = calculateDOTS(100, 30, 'M');
      expect(lightPoints).toBeGreaterThanOrEqual(0);
      expect(isFinite(lightPoints)).toBe(true);

      // Very heavy bodyweight
      const heavyPoints = calculateDOTS(500, 200, 'M');
      expect(heavyPoints).toBeGreaterThanOrEqual(0);
      expect(isFinite(heavyPoints)).toBe(true);
    });
  });
});

describe('calculateWilks', () => {
  describe('valid inputs', () => {
    it('should calculate Wilks points for male athlete', () => {
      const points = calculateWilks(600, 83, 'M');
      expect(points).toBeGreaterThan(0);
      // Wilks pour homme 83kg, 600kg total
      expect(points).toBeGreaterThan(350);
      expect(points).toBeLessThan(450);
    });

    it('should calculate Wilks points for female athlete', () => {
      const points = calculateWilks(400, 63, 'F');
      expect(points).toBeGreaterThan(0);
      // Wilks pour femme 63kg, 400kg total
      expect(points).toBeGreaterThan(380);
      expect(points).toBeLessThan(480);
    });

    it('should return higher points for same total at lighter bodyweight', () => {
      const pointsLight = calculateWilks(500, 66, 'M');
      const pointsHeavy = calculateWilks(500, 93, 'M');
      expect(pointsLight).toBeGreaterThan(pointsHeavy);
    });

    it('should scale linearly with total', () => {
      const points500 = calculateWilks(500, 83, 'M');
      const points1000 = calculateWilks(1000, 83, 'M');
      expect(points1000 / points500).toBeCloseTo(2, 1);
    });
  });

  describe('edge cases', () => {
    it('should return 0 for zero total', () => {
      expect(calculateWilks(0, 83, 'M')).toBe(0);
    });

    it('should return 0 for negative total', () => {
      expect(calculateWilks(-100, 83, 'M')).toBe(0);
    });

    it('should return 0 for zero bodyweight', () => {
      expect(calculateWilks(500, 0, 'M')).toBe(0);
    });

    it('should return 0 for negative bodyweight', () => {
      expect(calculateWilks(500, -83, 'M')).toBe(0);
    });
  });
});

describe('getAgeCategory', () => {
  const competitionDate = new Date('2024-06-15');

  it('should return Sub-Junior for age < 14', () => {
    const dob = new Date('2012-01-01'); // 12 ans
    expect(getAgeCategory(dob, competitionDate)).toBe('Sub-Junior');
  });

  it('should return Junior for age 14-18', () => {
    const dob14 = new Date('2010-01-01'); // 14 ans
    const dob18 = new Date('2006-01-01'); // 18 ans
    expect(getAgeCategory(dob14, competitionDate)).toBe('Junior');
    expect(getAgeCategory(dob18, competitionDate)).toBe('Junior');
  });

  it('should return Sub-Master for age 19-23', () => {
    const dob19 = new Date('2005-01-01'); // 19 ans
    const dob23 = new Date('2001-01-01'); // 23 ans
    expect(getAgeCategory(dob19, competitionDate)).toBe('Sub-Master');
    expect(getAgeCategory(dob23, competitionDate)).toBe('Sub-Master');
  });

  it('should return Open for age 24-39', () => {
    const dob24 = new Date('2000-01-01'); // 24 ans
    const dob39 = new Date('1985-01-01'); // 39 ans
    expect(getAgeCategory(dob24, competitionDate)).toBe('Open');
    expect(getAgeCategory(dob39, competitionDate)).toBe('Open');
  });

  it('should return Master 1 for age 40-49', () => {
    const dob40 = new Date('1984-01-01'); // 40 ans
    const dob49 = new Date('1975-01-01'); // 49 ans
    expect(getAgeCategory(dob40, competitionDate)).toBe('Master 1');
    expect(getAgeCategory(dob49, competitionDate)).toBe('Master 1');
  });

  it('should return Master 2 for age 50-59', () => {
    const dob50 = new Date('1974-01-01'); // 50 ans
    const dob59 = new Date('1965-01-01'); // 59 ans
    expect(getAgeCategory(dob50, competitionDate)).toBe('Master 2');
    expect(getAgeCategory(dob59, competitionDate)).toBe('Master 2');
  });

  it('should return Master 3 for age 60-69', () => {
    const dob60 = new Date('1964-01-01'); // 60 ans
    const dob69 = new Date('1955-01-01'); // 69 ans
    expect(getAgeCategory(dob60, competitionDate)).toBe('Master 3');
    expect(getAgeCategory(dob69, competitionDate)).toBe('Master 3');
  });

  it('should return Master 4 for age >= 70', () => {
    const dob70 = new Date('1954-01-01'); // 70 ans
    const dob80 = new Date('1944-01-01'); // 80 ans
    expect(getAgeCategory(dob70, competitionDate)).toBe('Master 4');
    expect(getAgeCategory(dob80, competitionDate)).toBe('Master 4');
  });
});

describe('calculateAgeCategory', () => {
  it('should calculate age category based on current date', () => {
    // Test avec une date de naissance qui donne un âge connu
    const today = new Date();
    const thirtyYearsAgo = new Date(
      today.getFullYear() - 30,
      today.getMonth(),
      today.getDate()
    );
    expect(calculateAgeCategory(thirtyYearsAgo)).toBe('Open');
  });
});

describe('isWeightClassValid', () => {
  describe('male weight classes', () => {
    it('should validate 59kg class', () => {
      expect(isWeightClassValid(55, '59', 'M')).toBe(true);
      expect(isWeightClassValid(59, '59', 'M')).toBe(true);
      expect(isWeightClassValid(60, '59', 'M')).toBe(false);
    });

    it('should validate 66kg class', () => {
      expect(isWeightClassValid(60, '66', 'M')).toBe(true);
      expect(isWeightClassValid(66, '66', 'M')).toBe(true);
      expect(isWeightClassValid(59, '66', 'M')).toBe(false);
      expect(isWeightClassValid(67, '66', 'M')).toBe(false);
    });

    it('should validate 74kg class', () => {
      expect(isWeightClassValid(67, '74', 'M')).toBe(true);
      expect(isWeightClassValid(74, '74', 'M')).toBe(true);
      expect(isWeightClassValid(66, '74', 'M')).toBe(false);
      expect(isWeightClassValid(75, '74', 'M')).toBe(false);
    });

    it('should validate 83kg class', () => {
      expect(isWeightClassValid(75, '83', 'M')).toBe(true);
      expect(isWeightClassValid(83, '83', 'M')).toBe(true);
      expect(isWeightClassValid(74, '83', 'M')).toBe(false);
      expect(isWeightClassValid(84, '83', 'M')).toBe(false);
    });

    it('should validate 93kg class', () => {
      expect(isWeightClassValid(84, '93', 'M')).toBe(true);
      expect(isWeightClassValid(93, '93', 'M')).toBe(true);
      expect(isWeightClassValid(83, '93', 'M')).toBe(false);
      expect(isWeightClassValid(94, '93', 'M')).toBe(false);
    });

    it('should validate 105kg class', () => {
      expect(isWeightClassValid(94, '105', 'M')).toBe(true);
      expect(isWeightClassValid(105, '105', 'M')).toBe(true);
      expect(isWeightClassValid(93, '105', 'M')).toBe(false);
      expect(isWeightClassValid(106, '105', 'M')).toBe(false);
    });

    it('should validate 120kg class', () => {
      expect(isWeightClassValid(106, '120', 'M')).toBe(true);
      expect(isWeightClassValid(120, '120', 'M')).toBe(true);
      expect(isWeightClassValid(105, '120', 'M')).toBe(false);
      expect(isWeightClassValid(121, '120', 'M')).toBe(false);
    });

    it('should validate 120+ kg class', () => {
      expect(isWeightClassValid(121, '120+', 'M')).toBe(true);
      expect(isWeightClassValid(150, '120+', 'M')).toBe(true);
      expect(isWeightClassValid(120, '120+', 'M')).toBe(false);
    });
  });

  describe('female weight classes', () => {
    it('should validate 47kg class', () => {
      expect(isWeightClassValid(45, '47', 'F')).toBe(true);
      expect(isWeightClassValid(47, '47', 'F')).toBe(true);
      expect(isWeightClassValid(48, '47', 'F')).toBe(false);
    });

    it('should validate 52kg class', () => {
      expect(isWeightClassValid(48, '52', 'F')).toBe(true);
      expect(isWeightClassValid(52, '52', 'F')).toBe(true);
      expect(isWeightClassValid(47, '52', 'F')).toBe(false);
      expect(isWeightClassValid(53, '52', 'F')).toBe(false);
    });

    it('should validate 57kg class', () => {
      expect(isWeightClassValid(53, '57', 'F')).toBe(true);
      expect(isWeightClassValid(57, '57', 'F')).toBe(true);
      expect(isWeightClassValid(52, '57', 'F')).toBe(false);
      expect(isWeightClassValid(58, '57', 'F')).toBe(false);
    });

    it('should validate 63kg class', () => {
      expect(isWeightClassValid(58, '63', 'F')).toBe(true);
      expect(isWeightClassValid(63, '63', 'F')).toBe(true);
      expect(isWeightClassValid(57, '63', 'F')).toBe(false);
      expect(isWeightClassValid(64, '63', 'F')).toBe(false);
    });

    it('should validate 69kg class', () => {
      expect(isWeightClassValid(64, '69', 'F')).toBe(true);
      expect(isWeightClassValid(69, '69', 'F')).toBe(true);
      expect(isWeightClassValid(63, '69', 'F')).toBe(false);
      expect(isWeightClassValid(70, '69', 'F')).toBe(false);
    });

    it('should validate 76kg class', () => {
      expect(isWeightClassValid(70, '76', 'F')).toBe(true);
      expect(isWeightClassValid(76, '76', 'F')).toBe(true);
      expect(isWeightClassValid(69, '76', 'F')).toBe(false);
      expect(isWeightClassValid(77, '76', 'F')).toBe(false);
    });

    it('should validate 84kg class', () => {
      expect(isWeightClassValid(77, '84', 'F')).toBe(true);
      expect(isWeightClassValid(84, '84', 'F')).toBe(true);
      expect(isWeightClassValid(76, '84', 'F')).toBe(false);
      expect(isWeightClassValid(85, '84', 'F')).toBe(false);
    });

    it('should validate 84+ kg class', () => {
      expect(isWeightClassValid(85, '84+', 'F')).toBe(true);
      expect(isWeightClassValid(100, '84+', 'F')).toBe(true);
      expect(isWeightClassValid(84, '84+', 'F')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for invalid weight class format', () => {
      expect(isWeightClassValid(80, 'ABC', 'M')).toBe(false);
      expect(isWeightClassValid(80, '', 'M')).toBe(false);
      expect(isWeightClassValid(80, 'invalid', 'F')).toBe(false);
    });

    it('should return false for negative weight class', () => {
      expect(isWeightClassValid(80, '-83', 'M')).toBe(false);
    });

    it('should handle non-standard weight classes', () => {
      // Non-standard class like 75kg (not in IPF list) should use 0-max range
      expect(isWeightClassValid(70, '75', 'M')).toBe(true);
      expect(isWeightClassValid(76, '75', 'M')).toBe(false);
    });

    it('should return false for zero bodyweight', () => {
      expect(isWeightClassValid(0, '83', 'M')).toBe(false);
    });
  });
});
