import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

/**
 * Hook personnalisé pour invoquer des commandes Tauri avec gestion d'état
 */
export function useTauriCommand<TResult = unknown, TArgs = unknown>(
  commandName: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const execute = useCallback(
    async (args?: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await invoke<TResult>(commandName, args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        console.error(`Error invoking ${commandName}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [commandName]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Hook pour les commandes de compétition
 */
export function useCompetitionCommands() {
  const createCompetition = useTauriCommand('create_competition');
  const getCompetitions = useTauriCommand('get_competitions');
  const updateCompetition = useTauriCommand('update_competition');
  const deleteCompetition = useTauriCommand('delete_competition');

  return {
    createCompetition,
    getCompetitions,
    updateCompetition,
    deleteCompetition,
  };
}

/**
 * Hook pour les commandes d'athlète
 */
export function useAthleteCommands() {
  const createAthlete = useTauriCommand('create_athlete');
  const getAthletes = useTauriCommand('get_athletes');
  const updateAthlete = useTauriCommand('update_athlete');
  const deleteAthlete = useTauriCommand('delete_athlete');

  return {
    createAthlete,
    getAthletes,
    updateAthlete,
    deleteAthlete,
  };
}
