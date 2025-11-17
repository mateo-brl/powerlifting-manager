import { Competition } from '../../features/competition/types';
import { Athlete } from '../../features/athlete/types';
import { WeighIn } from '../../features/weigh-in/types';

/**
 * Générateur de données factices pour les tests
 */

const firstNames = {
  M: ['Jean', 'Pierre', 'Marc', 'Luc', 'Paul', 'André', 'François', 'Nicolas', 'Mathieu', 'David', 'Alexandre', 'Thomas', 'Lucas', 'Antoine', 'Maxime'],
  F: ['Marie', 'Sophie', 'Julie', 'Camille', 'Laura', 'Céline', 'Émilie', 'Sarah', 'Charlotte', 'Léa', 'Emma', 'Chloé', 'Manon', 'Lisa', 'Anaïs']
};

const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];

const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes', 'Strasbourg', 'Montpellier', 'Nice'];

export function generateMockCompetition(): Competition {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 30));

  return {
    id: `comp-${Date.now()}-${Math.random()}`,
    name: `Championnat ${cities[Math.floor(Math.random() * cities.length)]} ${date.getFullYear()}`,
    date: date.toISOString().split('T')[0],
    location: cities[Math.floor(Math.random() * cities.length)],
    federation: 'IPF',
    status: 'upcoming',
    format: Math.random() > 0.7 ? 'bench_only' : 'full_power',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function generateMockAthletes(competitionId: string, count: number = 20): Athlete[] {
  const athletes: Athlete[] = [];
  const weightClassesM = ['59', '66', '74', '83', '93', '105', '120', '120+'];
  const weightClassesF = ['47', '52', '57', '63', '69', '76', '84', '84+'];

  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.3 ? 'M' : 'F';
    const weightClasses = gender === 'M' ? weightClassesM : weightClassesF;
    const weightClass = weightClasses[Math.floor(Math.random() * weightClasses.length)];

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - (20 + Math.floor(Math.random() * 30)));

    const age = new Date().getFullYear() - birthDate.getFullYear();
    let ageCategory = 'open';
    if (age < 23) ageCategory = 'junior';
    else if (age >= 40 && age < 50) ageCategory = 'master1';
    else if (age >= 50 && age < 60) ageCategory = 'master2';
    else if (age >= 60) ageCategory = 'master3';

    athletes.push({
      id: `athlete-${competitionId}-${i}`,
      competition_id: competitionId,
      first_name: firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)],
      last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
      date_of_birth: birthDate.toISOString().split('T')[0],
      gender,
      weight_class: weightClass,
      division: Math.random() > 0.2 ? 'raw' : 'equipped',
      age_category: ageCategory,
      lot_number: (i % 4) + 1, // 4 lots
      bodyweight: undefined,
      team: Math.random() > 0.5 ? `Club ${cities[Math.floor(Math.random() * 3)]}` : undefined,
      squat_rack_height: 10 + Math.floor(Math.random() * 8),
      bench_rack_height: 6 + Math.floor(Math.random() * 6),
      created_at: new Date().toISOString(),
    });
  }

  return athletes;
}

export function generateMockWeighIns(athletes: Athlete[]): WeighIn[] {
  const weighIns: WeighIn[] = [];

  athletes.forEach((athlete) => {
    // Parse weight class to get upper limit
    let upperLimit = parseFloat(athlete.weight_class.replace('+', ''));
    let bodyweight: number;

    if (athlete.weight_class.includes('+')) {
      // For unlimited classes, add 5-15kg above the limit
      bodyweight = upperLimit + 5 + Math.random() * 10;
    } else {
      // For limited classes, stay 0.5-3kg below the limit
      bodyweight = upperLimit - 0.5 - Math.random() * 2.5;
    }

    // Round to 1 decimal
    bodyweight = Math.round(bodyweight * 10) / 10;

    // Generate realistic opening attempts based on bodyweight and gender
    const multiplier = athlete.gender === 'M' ? 1.5 : 1.1;
    const baseSquat = Math.round((bodyweight * multiplier) / 2.5) * 2.5;
    const baseBench = Math.round((bodyweight * multiplier * 0.7) / 2.5) * 2.5;
    const baseDeadlift = Math.round((bodyweight * multiplier * 1.1) / 2.5) * 2.5;

    weighIns.push({
      id: `weighin-${athlete.id}`,
      athlete_id: athlete.id,
      competition_id: athlete.competition_id,
      bodyweight,
      weighed_in_at: new Date().toISOString(),
      opening_squat: Math.max(baseSquat, 40),
      opening_bench: Math.max(baseBench, 30),
      opening_deadlift: Math.max(baseDeadlift, 60),
      squat_rack_height: athlete.squat_rack_height,
      bench_rack_height: athlete.bench_rack_height,
      flight: undefined,
      lot_number: athlete.lot_number,
    });
  });

  return weighIns;
}

/**
 * Initialise une compétition complète avec athlètes et pesées
 */
export async function initializeMockCompetition(
  createCompetition: (data: any) => Promise<Competition>,
  createAthlete: (data: any) => Promise<Athlete>,
  createWeighIn: (data: any) => Promise<WeighIn>,
  athleteCount: number = 20
): Promise<{ competition: Competition; athletes: Athlete[]; weighIns: WeighIn[] }> {
  // Create competition
  const competitionData = generateMockCompetition();
  const competition = await createCompetition({
    name: competitionData.name,
    date: competitionData.date,
    location: competitionData.location,
    federation: competitionData.federation,
  });

  // Create athletes
  const athletesData = generateMockAthletes(competition.id, athleteCount);
  const athletes: Athlete[] = [];

  for (const athleteData of athletesData) {
    const athlete = await createAthlete({
      ...athleteData,
      competition_id: competition.id,
    });
    athletes.push(athlete);
  }

  // Create weigh-ins
  const weighInsData = generateMockWeighIns(athletes);
  const weighIns: WeighIn[] = [];

  for (const weighInData of weighInsData) {
    const weighIn = await createWeighIn({
      athlete_id: weighInData.athlete_id,
      competition_id: weighInData.competition_id,
      bodyweight: weighInData.bodyweight,
      opening_squat: weighInData.opening_squat,
      opening_bench: weighInData.opening_bench,
      opening_deadlift: weighInData.opening_deadlift,
      squat_rack_height: weighInData.squat_rack_height,
      bench_rack_height: weighInData.bench_rack_height,
    });
    weighIns.push(weighIn);
  }

  return { competition, athletes, weighIns };
}
