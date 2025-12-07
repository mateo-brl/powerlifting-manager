/**
 * Wrapper pour les commandes Tauri qui fonctionne aussi dans le navigateur
 * Détecte si on est dans Tauri ou dans un navigateur web
 */

// Type declaration for Tauri internals
declare global {
  interface Window {
    __TAURI_INTERNALS__?: any;
  }
}

// Détection si on est dans Tauri ou dans un navigateur
export const isTauri = typeof window !== 'undefined' &&
  window.__TAURI_INTERNALS__ !== undefined;

// Clés pour le localStorage
const STORAGE_KEYS = {
  competitions: 'pl_competitions',
  athletes: 'pl_athletes',
  weighIns: 'pl_weighIns',
  attempts: 'pl_attempts',
  flights: 'pl_flights',
};

// Stockage persistant avec localStorage pour le mode navigateur
const browserStorage = {
  get competitions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.competitions) || '[]');
  },
  set competitions(value: any[]) {
    localStorage.setItem(STORAGE_KEYS.competitions, JSON.stringify(value));
  },

  get athletes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.athletes) || '[]');
  },
  set athletes(value: any[]) {
    localStorage.setItem(STORAGE_KEYS.athletes, JSON.stringify(value));
  },

  get weighIns() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.weighIns) || '[]');
  },
  set weighIns(value: any[]) {
    localStorage.setItem(STORAGE_KEYS.weighIns, JSON.stringify(value));
  },

  get attempts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.attempts) || '[]');
  },
  set attempts(value: any[]) {
    localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(value));
  },

  get flights() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.flights) || '[]');
  },
  set flights(value: any[]) {
    localStorage.setItem(STORAGE_KEYS.flights, JSON.stringify(value));
  },
};

// Import dynamique de Tauri seulement si disponible
let tauriInvoke: ((cmd: string, args?: Record<string, any>) => Promise<any>) | null = null;
let tauriLoaded = false;

async function loadTauriInvoke() {
  if (isTauri && !tauriLoaded) {
    try {
      const { invoke: tauriInvokeFunc } = await import('@tauri-apps/api/core');
      tauriInvoke = tauriInvokeFunc;
      tauriLoaded = true;
      console.log('[Tauri] API loaded successfully');
    } catch (e) {
      console.warn('[Tauri] Failed to load API:', e);
    }
  }
}

// Charger Tauri immédiatement
if (isTauri) {
  loadTauriInvoke();
}

/**
 * Wrapper pour invoke qui fonctionne en mode navigateur et Tauri
 */
export async function invoke<T>(cmd: string, args?: Record<string, any>): Promise<T> {
  // Si Tauri n'est pas encore chargé, attendre
  if (isTauri && !tauriLoaded) {
    await loadTauriInvoke();
  }

  // Mode Tauri
  if (isTauri && tauriInvoke) {
    try {
      return await tauriInvoke(cmd, args);
    } catch (e) {
      console.error(`[Tauri] Command failed: ${cmd}`, e);
      throw e;
    }
  }

  // Mode navigateur - simulation avec stockage en mémoire
  console.debug(`[Browser Mode] ${cmd}`, args);

  return new Promise((resolve) => {
    setTimeout(() => {
      const result = simulateCommand(cmd, args);
      resolve(result as T);
    }, 50); // Simule un délai réseau
  });
}

/**
 * Simule les commandes Tauri en mode navigateur
 */
function simulateCommand(cmd: string, args?: Record<string, any>): any {
  const generateId = () => `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  switch (cmd) {
    // Competitions
    case 'create_competition':
      const comp = {
        id: generateId(),
        status: 'upcoming',
        ...args!.input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const comps = browserStorage.competitions;
      comps.push(comp);
      browserStorage.competitions = comps;
      return comp;

    case 'get_competitions':
      return [...browserStorage.competitions];

    case 'update_competition':
      const competitions = browserStorage.competitions;
      const compIndex = competitions.findIndex(c => c.id === args!.id);
      if (compIndex >= 0) {
        competitions[compIndex] = {
          ...competitions[compIndex],
          ...args!.input,
          updated_at: new Date().toISOString(),
        };
        browserStorage.competitions = competitions;
        return competitions[compIndex];
      }
      throw new Error('Competition not found');

    case 'delete_competition':
      browserStorage.competitions = browserStorage.competitions.filter(c => c.id !== args!.id);
      return null;

    // Athletes
    case 'create_athlete':
      const athlete = {
        id: generateId(),
        ...args!.input,
        created_at: new Date().toISOString(),
      };
      const athletes = browserStorage.athletes;
      athletes.push(athlete);
      browserStorage.athletes = athletes;
      return athlete;

    case 'get_athletes':
      return browserStorage.athletes.filter(a =>
        !args!.competitionId || a.competition_id === args!.competitionId
      );

    case 'update_athlete':
      const athletesList = browserStorage.athletes;
      const athleteIndex = athletesList.findIndex(a => a.id === args!.id);
      if (athleteIndex >= 0) {
        athletesList[athleteIndex] = {
          ...athletesList[athleteIndex],
          ...args!.input,
        };
        browserStorage.athletes = athletesList;
        return athletesList[athleteIndex];
      }
      throw new Error('Athlete not found');

    case 'delete_athlete':
      browserStorage.athletes = browserStorage.athletes.filter(a => a.id !== args!.id);
      return null;

    // Weigh-ins
    case 'create_weigh_in':
      const weighIn = {
        id: generateId(),
        ...args!.input,
        weighed_in_at: new Date().toISOString(),
      };
      const weighIns = browserStorage.weighIns;
      weighIns.push(weighIn);
      browserStorage.weighIns = weighIns;
      return weighIn;

    case 'get_weigh_ins':
      return browserStorage.weighIns.filter(w =>
        !args!.competitionId || w.competition_id === args!.competitionId
      );

    case 'delete_weigh_in':
      browserStorage.weighIns = browserStorage.weighIns.filter(w => w.id !== args!.id);
      return null;

    // Attempts
    case 'create_attempt':
      const attempt = {
        id: generateId(),
        ...args!.input,
        result: 'pending',
        timestamp: new Date().toISOString(),
      };
      const attempts = browserStorage.attempts;
      attempts.push(attempt);
      browserStorage.attempts = attempts;
      return attempt;

    case 'update_attempt':
      const attemptsList = browserStorage.attempts;
      const attemptIndex = attemptsList.findIndex(a => a.id === args!.input.id);
      if (attemptIndex >= 0) {
        attemptsList[attemptIndex] = {
          ...attemptsList[attemptIndex],
          ...args!.input,
        };
        browserStorage.attempts = attemptsList;
        return attemptsList[attemptIndex];
      }
      throw new Error('Attempt not found');

    case 'get_attempts':
      return browserStorage.attempts.filter(a =>
        !args!.competitionId || a.competition_id === args!.competitionId
      );

    case 'get_athlete_attempts':
      return browserStorage.attempts.filter(a => a.athlete_id === args!.athleteId);

    case 'delete_attempt':
      browserStorage.attempts = browserStorage.attempts.filter(a => a.id !== args!.id);
      return null;

    // Flights
    case 'create_flight':
      const flight = {
        id: generateId(),
        ...args!.input,
        created_at: new Date().toISOString(),
      };
      const flights = browserStorage.flights;
      flights.push(flight);
      browserStorage.flights = flights;
      return flight;

    case 'get_flights':
      return browserStorage.flights.filter(f =>
        !args!.competitionId || f.competition_id === args!.competitionId
      );

    case 'update_flight':
      const flightsList = browserStorage.flights;
      const flightIndex = flightsList.findIndex(f => f.id === args!.id);
      if (flightIndex >= 0) {
        flightsList[flightIndex] = {
          ...flightsList[flightIndex],
          ...args!.input,
        };
        browserStorage.flights = flightsList;
        return flightsList[flightIndex];
      }
      throw new Error('Flight not found');

    case 'delete_flight':
      browserStorage.flights = browserStorage.flights.filter(f => f.id !== args!.id);
      return null;

    case 'delete_flights_by_competition':
      browserStorage.flights = browserStorage.flights.filter(f =>
        f.competition_id !== args!.competitionId
      );
      return null;

    default:
      console.warn(`[Browser Mode] Unknown command: ${cmd}`);
      return null;
  }
}

/**
 * Réinitialise le stockage (localStorage) - utile pour les tests ou le debugging
 */
export function resetBrowserStorage() {
  browserStorage.competitions = [];
  browserStorage.athletes = [];
  browserStorage.weighIns = [];
  browserStorage.attempts = [];
  browserStorage.flights = [];
}
