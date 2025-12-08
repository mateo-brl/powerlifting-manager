import { describe, it, expect } from 'vitest';
import {
  calculateAttemptOrder,
  canChangeAttempt,
  validateAttemptWeight,
  getNextAthlete,
  getUpcomingAthletes,
} from './attemptOrdering';
import { Athlete } from '../../athlete/types';
import { AttemptOrder } from '../../weigh-in/types';

// Helper to create test athletes
const createAthlete = (
  id: string,
  firstName: string,
  lastName: string,
  lotNumber: number
): Athlete => ({
  id,
  competition_id: 'comp-1',
  first_name: firstName,
  last_name: lastName,
  date_of_birth: '1990-01-01',
  gender: 'M',
  weight_class: '83',
  division: 'raw',
  age_category: 'Open',
  lot_number: lotNumber,
  created_at: '2024-01-01T00:00:00.000Z',
});

describe('calculateAttemptOrder', () => {
  const athletes: Athlete[] = [
    createAthlete('athlete-1', 'John', 'Doe', 1),
    createAthlete('athlete-2', 'Jane', 'Smith', 2),
    createAthlete('athlete-3', 'Bob', 'Johnson', 3),
  ];

  it('should sort by weight (ascending)', () => {
    const attempts = [
      { athlete_id: 'athlete-1', attempt_number: 1 as const, weight_kg: 150 },
      { athlete_id: 'athlete-2', attempt_number: 1 as const, weight_kg: 100 },
      { athlete_id: 'athlete-3', attempt_number: 1 as const, weight_kg: 125 },
    ];

    const order = calculateAttemptOrder(attempts, athletes);

    expect(order[0].weight_kg).toBe(100);
    expect(order[1].weight_kg).toBe(125);
    expect(order[2].weight_kg).toBe(150);
  });

  it('should sort by lot number when weights are equal', () => {
    const attempts = [
      { athlete_id: 'athlete-3', attempt_number: 1 as const, weight_kg: 100 },
      { athlete_id: 'athlete-1', attempt_number: 1 as const, weight_kg: 100 },
      { athlete_id: 'athlete-2', attempt_number: 1 as const, weight_kg: 100 },
    ];

    const order = calculateAttemptOrder(attempts, athletes);

    expect(order[0].lot_number).toBe(1);
    expect(order[1].lot_number).toBe(2);
    expect(order[2].lot_number).toBe(3);
  });

  it('should sort by attempt number when weight and lot are equal', () => {
    const sameAthletes: Athlete[] = [
      createAthlete('athlete-1', 'John', 'Doe', 1),
    ];

    const attempts = [
      { athlete_id: 'athlete-1', attempt_number: 3 as const, weight_kg: 100 },
      { athlete_id: 'athlete-1', attempt_number: 1 as const, weight_kg: 100 },
      { athlete_id: 'athlete-1', attempt_number: 2 as const, weight_kg: 100 },
    ];

    const order = calculateAttemptOrder(attempts, sameAthletes);

    expect(order[0].attempt_number).toBe(1);
    expect(order[1].attempt_number).toBe(2);
    expect(order[2].attempt_number).toBe(3);
  });

  it('should include athlete name in format "LastName, FirstName"', () => {
    const attempts = [
      { athlete_id: 'athlete-1', attempt_number: 1 as const, weight_kg: 100 },
    ];

    const order = calculateAttemptOrder(attempts, athletes);

    expect(order[0].athlete_name).toBe('Doe, John');
  });

  it('should filter out attempts for unknown athletes', () => {
    const attempts = [
      { athlete_id: 'athlete-1', attempt_number: 1 as const, weight_kg: 100 },
      { athlete_id: 'unknown-athlete', attempt_number: 1 as const, weight_kg: 50 },
    ];

    const order = calculateAttemptOrder(attempts, athletes);

    expect(order.length).toBe(1);
    expect(order[0].athlete_id).toBe('athlete-1');
  });

  it('should assign default lot number 999 for athletes without lot number', () => {
    const athletesWithoutLot: Athlete[] = [
      { ...createAthlete('athlete-1', 'John', 'Doe', 1), lot_number: undefined },
    ];

    const attempts = [
      { athlete_id: 'athlete-1', attempt_number: 1 as const, weight_kg: 100 },
    ];

    const order = calculateAttemptOrder(attempts, athletesWithoutLot);

    expect(order[0].lot_number).toBe(999);
  });

  it('should handle empty attempts array', () => {
    const order = calculateAttemptOrder([], athletes);
    expect(order).toEqual([]);
  });

  it('should handle complex sorting with multiple criteria', () => {
    const moreAthletes: Athlete[] = [
      createAthlete('a1', 'A', 'One', 5),
      createAthlete('a2', 'B', 'Two', 1),
      createAthlete('a3', 'C', 'Three', 3),
      createAthlete('a4', 'D', 'Four', 2),
    ];

    const attempts = [
      { athlete_id: 'a1', attempt_number: 1 as const, weight_kg: 120 },
      { athlete_id: 'a2', attempt_number: 1 as const, weight_kg: 100 },
      { athlete_id: 'a3', attempt_number: 1 as const, weight_kg: 120 },
      { athlete_id: 'a4', attempt_number: 1 as const, weight_kg: 100 },
    ];

    const order = calculateAttemptOrder(attempts, moreAthletes);

    // First: 100kg athletes sorted by lot (1, 2)
    expect(order[0].athlete_id).toBe('a2'); // 100kg, lot 1
    expect(order[1].athlete_id).toBe('a4'); // 100kg, lot 2
    // Then: 120kg athletes sorted by lot (3, 5)
    expect(order[2].athlete_id).toBe('a3'); // 120kg, lot 3
    expect(order[3].athlete_id).toBe('a1'); // 120kg, lot 5
  });
});

describe('canChangeAttempt', () => {
  const createOrder = (): AttemptOrder[] => [
    { athlete_id: 'a1', athlete_name: 'One', attempt_number: 1, weight_kg: 100, lot_number: 1 },
    { athlete_id: 'a2', athlete_name: 'Two', attempt_number: 1, weight_kg: 110, lot_number: 2 },
    { athlete_id: 'a3', athlete_name: 'Three', attempt_number: 1, weight_kg: 120, lot_number: 3 },
    { athlete_id: 'a4', athlete_name: 'Four', attempt_number: 1, weight_kg: 130, lot_number: 4 },
    { athlete_id: 'a5', athlete_name: 'Five', attempt_number: 1, weight_kg: 140, lot_number: 5 },
    { athlete_id: 'a6', athlete_name: 'Six', attempt_number: 1, weight_kg: 150, lot_number: 6 },
  ];

  it('should not allow change when athlete is current (0 away)', () => {
    const order = createOrder();
    const result = canChangeAttempt('a1', order, 0);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Too close');
  });

  it('should not allow change when athlete is 1 away', () => {
    const order = createOrder();
    const result = canChangeAttempt('a2', order, 0);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Too close');
  });

  it('should not allow change when athlete is 2 away', () => {
    const order = createOrder();
    const result = canChangeAttempt('a3', order, 0);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Too close');
  });

  it('should not allow change when athlete is 3 away', () => {
    const order = createOrder();
    const result = canChangeAttempt('a4', order, 0);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Too close');
  });

  it('should allow change when athlete is 4 or more away', () => {
    const order = createOrder();
    const result = canChangeAttempt('a5', order, 0);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should allow change when athlete is far away', () => {
    const order = createOrder();
    const result = canChangeAttempt('a6', order, 0);
    expect(result.allowed).toBe(true);
  });

  it('should not allow change for athlete not in order', () => {
    const order = createOrder();
    const result = canChangeAttempt('unknown', order, 0);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Athlete not found in order');
  });

  it('should calculate distance correctly from different positions', () => {
    const order = createOrder();
    // a5 is at position 4, current is 1 -> distance = 3, not allowed
    const result1 = canChangeAttempt('a5', order, 1);
    expect(result1.allowed).toBe(false);

    // a6 is at position 5, current is 1 -> distance = 4, allowed
    const result2 = canChangeAttempt('a6', order, 1);
    expect(result2.allowed).toBe(true);
  });
});

describe('validateAttemptWeight', () => {
  describe('first attempt', () => {
    it('should accept valid first attempt weight', () => {
      const result = validateAttemptWeight(100, null, 1);
      expect(result.valid).toBe(true);
    });

    it('should reject first attempt below 20kg', () => {
      const result = validateAttemptWeight(15, null, 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum opening attempt');
    });

    it('should accept first attempt at exactly 20kg', () => {
      const result = validateAttemptWeight(20, null, 1);
      expect(result.valid).toBe(true);
    });
  });

  describe('subsequent attempts', () => {
    it('should accept weight increase of 2.5kg', () => {
      const result = validateAttemptWeight(102.5, 100, 2);
      expect(result.valid).toBe(true);
    });

    it('should accept weight increase greater than 2.5kg', () => {
      const result = validateAttemptWeight(110, 100, 2);
      expect(result.valid).toBe(true);
    });

    it('should accept same weight (repeat attempt)', () => {
      const result = validateAttemptWeight(100, 100, 2);
      expect(result.valid).toBe(true);
    });

    it('should reject weight decrease', () => {
      const result = validateAttemptWeight(95, 100, 2);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot decrease');
    });

    it('should reject increase less than 2.5kg', () => {
      const result = validateAttemptWeight(101, 100, 2);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum 2.5kg');
    });

    it('should reject increase of 1kg', () => {
      const result = validateAttemptWeight(101, 100, 3);
      expect(result.valid).toBe(false);
    });

    it('should require previous weight for non-first attempts', () => {
      const result = validateAttemptWeight(100, null, 2);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Previous attempt weight is required');
    });
  });
});

describe('getNextAthlete', () => {
  const createOrder = (): AttemptOrder[] => [
    { athlete_id: 'a1', athlete_name: 'One', attempt_number: 1, weight_kg: 100, lot_number: 1 },
    { athlete_id: 'a2', athlete_name: 'Two', attempt_number: 1, weight_kg: 110, lot_number: 2 },
    { athlete_id: 'a3', athlete_name: 'Three', attempt_number: 1, weight_kg: 120, lot_number: 3 },
  ];

  it('should return next athlete', () => {
    const order = createOrder();
    const next = getNextAthlete(order, 0);
    expect(next?.athlete_id).toBe('a2');
  });

  it('should return null when at last position', () => {
    const order = createOrder();
    const next = getNextAthlete(order, 2);
    expect(next).toBeNull();
  });

  it('should return null when past last position', () => {
    const order = createOrder();
    const next = getNextAthlete(order, 5);
    expect(next).toBeNull();
  });

  it('should handle empty order', () => {
    const next = getNextAthlete([], 0);
    expect(next).toBeNull();
  });
});

describe('getUpcomingAthletes', () => {
  const createOrder = (): AttemptOrder[] => [
    { athlete_id: 'a1', athlete_name: 'One', attempt_number: 1, weight_kg: 100, lot_number: 1 },
    { athlete_id: 'a2', athlete_name: 'Two', attempt_number: 1, weight_kg: 110, lot_number: 2 },
    { athlete_id: 'a3', athlete_name: 'Three', attempt_number: 1, weight_kg: 120, lot_number: 3 },
    { athlete_id: 'a4', athlete_name: 'Four', attempt_number: 1, weight_kg: 130, lot_number: 4 },
    { athlete_id: 'a5', athlete_name: 'Five', attempt_number: 1, weight_kg: 140, lot_number: 5 },
    { athlete_id: 'a6', athlete_name: 'Six', attempt_number: 1, weight_kg: 150, lot_number: 6 },
  ];

  it('should return requested number of upcoming athletes', () => {
    const order = createOrder();
    const upcoming = getUpcomingAthletes(order, 0, 3);
    expect(upcoming.length).toBe(3);
    expect(upcoming[0].athlete_id).toBe('a2');
    expect(upcoming[1].athlete_id).toBe('a3');
    expect(upcoming[2].athlete_id).toBe('a4');
  });

  it('should return default 5 athletes when count not specified', () => {
    const order = createOrder();
    const upcoming = getUpcomingAthletes(order, 0);
    expect(upcoming.length).toBe(5);
  });

  it('should return remaining athletes when less than requested', () => {
    const order = createOrder();
    const upcoming = getUpcomingAthletes(order, 4, 5);
    expect(upcoming.length).toBe(1);
    expect(upcoming[0].athlete_id).toBe('a6');
  });

  it('should return empty array when at last position', () => {
    const order = createOrder();
    const upcoming = getUpcomingAthletes(order, 5, 3);
    expect(upcoming).toEqual([]);
  });

  it('should return empty array when past end', () => {
    const order = createOrder();
    const upcoming = getUpcomingAthletes(order, 10, 3);
    expect(upcoming).toEqual([]);
  });

  it('should handle empty order', () => {
    const upcoming = getUpcomingAthletes([], 0, 3);
    expect(upcoming).toEqual([]);
  });
});
