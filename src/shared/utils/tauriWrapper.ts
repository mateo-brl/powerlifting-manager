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

// Stockage en mémoire pour le mode navigateur
const browserStorage = {
  competitions: [] as any[],
  athletes: [] as any[],
  weighIns: [] as any[],
  attempts: [] as any[],
};

// Import dynamique de Tauri seulement si disponible
let tauriInvoke: any = null;
if (isTauri) {
  import('@tauri-apps/api/core').then((module) => {
    tauriInvoke = module.invoke;
  });
}

/**
 * Wrapper pour invoke qui fonctionne en mode navigateur et Tauri
 */
export async function invoke<T>(cmd: string, args?: Record<string, any>): Promise<T> {
  // Mode Tauri
  if (isTauri && tauriInvoke) {
    return tauriInvoke(cmd, args);
  }

  // Mode navigateur - simulation avec stockage en mémoire
  // console.debug(`[Browser Mode] ${cmd}`, args); // Uncomment for debugging

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
      browserStorage.competitions.push(comp);
      return comp;

    case 'get_competitions':
      return [...browserStorage.competitions];

    case 'update_competition':
      const compIndex = browserStorage.competitions.findIndex(c => c.id === args!.id);
      if (compIndex >= 0) {
        browserStorage.competitions[compIndex] = {
          ...browserStorage.competitions[compIndex],
          ...args!.input,
          updated_at: new Date().toISOString(),
        };
        return browserStorage.competitions[compIndex];
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
      browserStorage.athletes.push(athlete);
      return athlete;

    case 'get_athletes':
      return browserStorage.athletes.filter(a =>
        !args!.competitionId || a.competition_id === args!.competitionId
      );

    case 'update_athlete':
      const athleteIndex = browserStorage.athletes.findIndex(a => a.id === args!.id);
      if (athleteIndex >= 0) {
        browserStorage.athletes[athleteIndex] = {
          ...browserStorage.athletes[athleteIndex],
          ...args!.input,
        };
        return browserStorage.athletes[athleteIndex];
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
      browserStorage.weighIns.push(weighIn);
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
      browserStorage.attempts.push(attempt);
      return attempt;

    case 'update_attempt':
      const attemptIndex = browserStorage.attempts.findIndex(a => a.id === args!.input.id);
      if (attemptIndex >= 0) {
        browserStorage.attempts[attemptIndex] = {
          ...browserStorage.attempts[attemptIndex],
          ...args!.input,
        };
        return browserStorage.attempts[attemptIndex];
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

    default:
      console.warn(`[Browser Mode] Unknown command: ${cmd}`);
      return null;
  }
}

/**
 * Réinitialise le stockage en mémoire (utile pour les tests)
 */
export function resetBrowserStorage() {
  browserStorage.competitions = [];
  browserStorage.athletes = [];
  browserStorage.weighIns = [];
  browserStorage.attempts = [];
}
