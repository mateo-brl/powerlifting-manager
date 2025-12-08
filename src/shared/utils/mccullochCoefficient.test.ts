import { describe, it, expect } from 'vitest';
import {
  calculateMcCullochCoefficient,
  applyMcCullochCoefficient,
  calculateAge,
  isMasterCategory,
  calculateAdjustedTotal,
  getMcCullochTable,
} from './mccullochCoefficient';

describe('calculateMcCullochCoefficient', () => {
  describe('non-master athletes (< 40 years)', () => {
    it('should return 1.0 for athletes under 40', () => {
      expect(calculateMcCullochCoefficient(20, 'M')).toBe(1.0);
      expect(calculateMcCullochCoefficient(30, 'M')).toBe(1.0);
      expect(calculateMcCullochCoefficient(39, 'M')).toBe(1.0);
      expect(calculateMcCullochCoefficient(20, 'F')).toBe(1.0);
      expect(calculateMcCullochCoefficient(30, 'F')).toBe(1.0);
      expect(calculateMcCullochCoefficient(39, 'F')).toBe(1.0);
    });
  });

  describe('master athletes (>= 40 years)', () => {
    it('should return coefficient >= 1.0 for male masters', () => {
      expect(calculateMcCullochCoefficient(40, 'M')).toBeGreaterThanOrEqual(1.0);
      expect(calculateMcCullochCoefficient(50, 'M')).toBeGreaterThanOrEqual(1.0);
      expect(calculateMcCullochCoefficient(60, 'M')).toBeGreaterThanOrEqual(1.0);
      expect(calculateMcCullochCoefficient(70, 'M')).toBeGreaterThanOrEqual(1.0);
    });

    it('should return coefficient >= 1.0 for female masters', () => {
      expect(calculateMcCullochCoefficient(40, 'F')).toBeGreaterThanOrEqual(1.0);
      expect(calculateMcCullochCoefficient(50, 'F')).toBeGreaterThanOrEqual(1.0);
      expect(calculateMcCullochCoefficient(60, 'F')).toBeGreaterThanOrEqual(1.0);
      expect(calculateMcCullochCoefficient(70, 'F')).toBeGreaterThanOrEqual(1.0);
    });

    it('should increase coefficient with age', () => {
      const coef40 = calculateMcCullochCoefficient(40, 'M');
      const coef50 = calculateMcCullochCoefficient(50, 'M');
      const coef60 = calculateMcCullochCoefficient(60, 'M');
      const coef70 = calculateMcCullochCoefficient(70, 'M');

      expect(coef50).toBeGreaterThan(coef40);
      expect(coef60).toBeGreaterThan(coef50);
      expect(coef70).toBeGreaterThan(coef60);
    });

    it('should return correct coefficients from official table', () => {
      // Vérifier quelques valeurs de la table officielle
      expect(calculateMcCullochCoefficient(40, 'M')).toBe(1.0);
      expect(calculateMcCullochCoefficient(50, 'M')).toBe(1.13);
      expect(calculateMcCullochCoefficient(60, 'M')).toBe(1.34);
      expect(calculateMcCullochCoefficient(70, 'M')).toBe(1.645);
      expect(calculateMcCullochCoefficient(80, 'M')).toBe(2.05);
    });

    it('should return same coefficients for male and female', () => {
      // McCulloch coefficients are the same for both genders
      expect(calculateMcCullochCoefficient(50, 'M')).toBe(calculateMcCullochCoefficient(50, 'F'));
      expect(calculateMcCullochCoefficient(60, 'M')).toBe(calculateMcCullochCoefficient(60, 'F'));
      expect(calculateMcCullochCoefficient(70, 'M')).toBe(calculateMcCullochCoefficient(70, 'F'));
    });

    it('should handle ages above 90', () => {
      // Ages > 90 should use the 90 year coefficient
      expect(calculateMcCullochCoefficient(95, 'M')).toBe(calculateMcCullochCoefficient(90, 'M'));
      expect(calculateMcCullochCoefficient(100, 'M')).toBe(calculateMcCullochCoefficient(90, 'M'));
    });

    it('should handle decimal ages by flooring', () => {
      expect(calculateMcCullochCoefficient(50.5, 'M')).toBe(calculateMcCullochCoefficient(50, 'M'));
      expect(calculateMcCullochCoefficient(50.9, 'M')).toBe(calculateMcCullochCoefficient(50, 'M'));
    });
  });
});

describe('applyMcCullochCoefficient', () => {
  it('should not modify total for athletes under 40', () => {
    expect(applyMcCullochCoefficient(500, 30, 'M')).toBe(500);
    expect(applyMcCullochCoefficient(400, 25, 'F')).toBe(400);
  });

  it('should increase total for master athletes', () => {
    const original = 500;
    const adjusted = applyMcCullochCoefficient(original, 50, 'M');
    expect(adjusted).toBeGreaterThan(original);
  });

  it('should apply correct coefficient', () => {
    const total = 500;
    const age = 50;
    const gender = 'M' as const;
    const coefficient = calculateMcCullochCoefficient(age, gender);
    const expected = total * coefficient;
    expect(applyMcCullochCoefficient(total, age, gender)).toBe(expected);
  });

  it('should calculate correct adjusted total for 50 year old', () => {
    // 50 ans = coefficient 1.13
    expect(applyMcCullochCoefficient(500, 50, 'M')).toBe(500 * 1.13);
  });
});

describe('calculateAge', () => {
  it('should calculate correct age', () => {
    const dob = '1990-06-15';
    const refDate = '2024-06-15';
    expect(calculateAge(dob, refDate)).toBe(34);
  });

  it('should handle birthday not yet passed', () => {
    const dob = '1990-12-15';
    const refDate = '2024-06-15';
    expect(calculateAge(dob, refDate)).toBe(33);
  });

  it('should handle birthday already passed', () => {
    const dob = '1990-01-15';
    const refDate = '2024-06-15';
    expect(calculateAge(dob, refDate)).toBe(34);
  });

  it('should handle same day birthday', () => {
    const dob = '1990-06-15';
    const refDate = '2024-06-15';
    expect(calculateAge(dob, refDate)).toBe(34);
  });

  it('should handle day before birthday', () => {
    const dob = '1990-06-16';
    const refDate = '2024-06-15';
    expect(calculateAge(dob, refDate)).toBe(33);
  });

  it('should use current date as default reference', () => {
    const today = new Date();
    const thirtyYearsAgo = new Date(
      today.getFullYear() - 30,
      today.getMonth(),
      today.getDate()
    ).toISOString();
    expect(calculateAge(thirtyYearsAgo)).toBe(30);
  });
});

describe('isMasterCategory', () => {
  it('should return true for Master categories', () => {
    expect(isMasterCategory('Master 1')).toBe(true);
    expect(isMasterCategory('Master 2')).toBe(true);
    expect(isMasterCategory('Master 3')).toBe(true);
    expect(isMasterCategory('Master 4')).toBe(true);
    expect(isMasterCategory('Masters 1')).toBe(true);
    expect(isMasterCategory('Masters 2')).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(isMasterCategory('master 1')).toBe(true);
    expect(isMasterCategory('MASTER 1')).toBe(true);
    expect(isMasterCategory('Master 1')).toBe(true);
  });

  it('should return false for non-Master categories', () => {
    expect(isMasterCategory('Open')).toBe(false);
    expect(isMasterCategory('Junior')).toBe(false);
    expect(isMasterCategory('Sub-Junior')).toBe(false);
    expect(isMasterCategory('Sub-Master')).toBe(false);
  });
});

describe('calculateAdjustedTotal', () => {
  it('should return raw total for non-master athlete', () => {
    const result = calculateAdjustedTotal({
      total: 500,
      age: 30,
      gender: 'M',
      age_category: 'Open',
    });

    expect(result.rawTotal).toBe(500);
    expect(result.adjustedTotal).toBe(500);
    expect(result.mccullochCoefficient).toBe(1.0);
    expect(result.isMaster).toBe(false);
  });

  it('should return adjusted total for master athlete', () => {
    const result = calculateAdjustedTotal({
      total: 500,
      age: 50,
      gender: 'M',
      age_category: 'Master 2',
    });

    expect(result.rawTotal).toBe(500);
    expect(result.adjustedTotal).toBe(500 * 1.13); // 50 ans = 1.13
    expect(result.mccullochCoefficient).toBe(1.13);
    expect(result.isMaster).toBe(true);
  });

  it('should calculate correct adjusted total', () => {
    const total = 500;
    const age = 60;
    const gender = 'M' as const;
    const coefficient = calculateMcCullochCoefficient(age, gender);

    const result = calculateAdjustedTotal({
      total,
      age,
      gender,
      age_category: 'Master 3',
    });

    expect(result.adjustedTotal).toBe(total * coefficient);
    expect(result.mccullochCoefficient).toBe(coefficient);
  });
});

describe('getMcCullochTable', () => {
  it('should return table with correct range', () => {
    const table = getMcCullochTable('M', 40, 50);
    expect(table.length).toBe(11); // 40 à 50 inclus
    expect(table[0].age).toBe(40);
    expect(table[10].age).toBe(50);
  });

  it('should return increasing coefficients', () => {
    const table = getMcCullochTable('M', 40, 70);
    for (let i = 1; i < table.length; i++) {
      expect(table[i].coefficient).toBeGreaterThanOrEqual(table[i - 1].coefficient);
    }
  });

  it('should return same values for male and female (McCulloch is gender-neutral)', () => {
    const maleTable = getMcCullochTable('M', 50, 60);
    const femaleTable = getMcCullochTable('F', 50, 60);

    // McCulloch coefficients are identical for both genders
    maleTable.forEach((m, i) => {
      expect(m.coefficient).toBe(femaleTable[i].coefficient);
    });
  });

  it('should use default range when not specified', () => {
    const table = getMcCullochTable('M');
    expect(table[0].age).toBe(40);
    expect(table[table.length - 1].age).toBe(90);
    expect(table.length).toBe(51); // 40 à 90 inclus
  });

  it('should return correct coefficients from table', () => {
    const table = getMcCullochTable('M', 40, 50);
    expect(table[0].coefficient).toBe(1.0);    // 40 ans
    expect(table[10].coefficient).toBe(1.13);  // 50 ans
  });
});
