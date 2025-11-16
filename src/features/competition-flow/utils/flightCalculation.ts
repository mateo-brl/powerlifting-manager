import { Athlete } from '../../athlete/types';
import { WeighIn } from '../../weigh-in/types';
import { Flight } from '../../weigh-in/types';

interface FlightGroup {
  weightClass: string;
  gender: string;
  athletes: { athlete: Athlete; weighIn: WeighIn }[];
}

const MAX_ATHLETES_PER_FLIGHT = 14;

/**
 * Calcule automatiquement les flights pour une compétition
 */
export function calculateFlights(
  athletes: Athlete[],
  weighIns: WeighIn[]
): Flight[] {
  const athletesWithWeighIns = athletes
    .map(athlete => {
      const weighIn = weighIns.find(w => w.athlete_id === athlete.id);
      return weighIn ? { athlete, weighIn } : null;
    })
    .filter((item): item is { athlete: Athlete; weighIn: WeighIn } => item !== null);

  const groups: Map<string, FlightGroup> = new Map();

  athletesWithWeighIns.forEach(({ athlete, weighIn }) => {
    const key = `${athlete.gender}-${athlete.weight_class}`;
    if (!groups.has(key)) {
      groups.set(key, {
        weightClass: athlete.weight_class,
        gender: athlete.gender,
        athletes: [],
      });
    }
    groups.get(key)!.athletes.push({ athlete, weighIn });
  });

  const flights: Flight[] = [];
  let flightCounter = 1;

  groups.forEach((group) => {
    const { athletes: groupAthletes } = group;
    const numberOfFlights = Math.ceil(groupAthletes.length / MAX_ATHLETES_PER_FLIGHT);

    for (let i = 0; i < numberOfFlights; i++) {
      const startIndex = i * MAX_ATHLETES_PER_FLIGHT;
      const endIndex = Math.min(startIndex + MAX_ATHLETES_PER_FLIGHT, groupAthletes.length);
      const flightAthletes = groupAthletes.slice(startIndex, endIndex);

      ['squat', 'bench', 'deadlift'].forEach((liftType) => {
        flights.push({
          id: `flight-${flightCounter}`,
          competition_id: flightAthletes[0].athlete.competition_id,
          name: `Flight ${flightCounter} - ${group.gender} ${group.weightClass} - ${liftType.toUpperCase()}`,
          athlete_ids: flightAthletes.map(a => a.athlete.id),
          lift_type: liftType as 'squat' | 'bench' | 'deadlift',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      });

      flightCounter++;
    }
  });

  return flights;
}

export function assignLotNumbers(athletes: Athlete[]): Map<string, number> {
  const assignments = new Map<string, number>();
  const groups = new Map<string, Athlete[]>();

  athletes.forEach(athlete => {
    const key = `${athlete.gender}-${athlete.weight_class}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(athlete);
  });

  groups.forEach((groupAthletes) => {
    groupAthletes.forEach((athlete, index) => {
      assignments.set(athlete.id, index + 1);
    });
  });

  return assignments;
}

export function validateFlightBalance(flights: Flight[]): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let valid = true;

  flights.forEach((flight) => {
    const athleteCount = flight.athlete_ids.length;

    if (athleteCount > MAX_ATHLETES_PER_FLIGHT) {
      warnings.push(
        `${flight.name} has ${athleteCount} athletes (max recommended: ${MAX_ATHLETES_PER_FLIGHT})`
      );
      valid = false;
    }

    if (athleteCount < 3) {
      warnings.push(
        `${flight.name} has only ${athleteCount} athletes (consider merging)`
      );
    }
  });

  return { valid, warnings };
}
