/**
 * Service de synchronisation entre plateformes
 */

import { Platform, PlatformSyncLog, SyncType, SyncConfig } from '../types';

/**
 * Interface pour les données de synchronisation
 */
interface SyncData {
  entity_type: 'athlete' | 'attempt' | 'order';
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
}

/**
 * Créer un log de synchronisation
 */
export function createSyncLog(
  competitionId: string,
  sourcePlatformId: string,
  targetPlatformId: string | null,
  syncType: SyncType,
  data: SyncData
): Omit<PlatformSyncLog, 'id' | 'synced' | 'timestamp'> {
  return {
    competition_id: competitionId,
    source_platform_id: sourcePlatformId,
    target_platform_id: targetPlatformId || undefined,
    sync_type: syncType,
    data: JSON.stringify(data),
  };
}

/**
 * Synchroniser une mise à jour d'athlète vers d'autres plateformes
 */
export async function syncAthleteUpdate(
  competitionId: string,
  sourcePlatformId: string,
  athleteData: any,
  targetPlatforms: Platform[],
  config: SyncConfig
): Promise<PlatformSyncLog[]> {
  if (!config.auto_sync) {
    return [];
  }

  const syncLogs: PlatformSyncLog[] = [];

  for (const targetPlatform of targetPlatforms) {
    if (targetPlatform.id === sourcePlatformId || !targetPlatform.active) {
      continue;
    }

    const syncData: SyncData = {
      entity_type: 'athlete',
      entity_id: athleteData.id,
      action: 'update',
      payload: athleteData,
    };

    const log = createSyncLog(
      competitionId,
      sourcePlatformId,
      targetPlatform.id,
      'athlete_update',
      syncData
    );

    syncLogs.push({
      ...log,
      id: `sync_${Date.now()}_${Math.random()}`,
      synced: false,
      timestamp: new Date().toISOString(),
    });
  }

  return syncLogs;
}

/**
 * Synchroniser un résultat de tentative vers d'autres plateformes
 */
export async function syncAttemptResult(
  competitionId: string,
  sourcePlatformId: string,
  attemptData: any,
  targetPlatforms: Platform[],
  config: SyncConfig
): Promise<PlatformSyncLog[]> {
  if (!config.auto_sync || !config.sync_attempts) {
    return [];
  }

  const syncLogs: PlatformSyncLog[] = [];

  for (const targetPlatform of targetPlatforms) {
    if (targetPlatform.id === sourcePlatformId || !targetPlatform.active) {
      continue;
    }

    const syncData: SyncData = {
      entity_type: 'attempt',
      entity_id: attemptData.id,
      action: 'create',
      payload: attemptData,
    };

    const log = createSyncLog(
      competitionId,
      sourcePlatformId,
      targetPlatform.id,
      'attempt_result',
      syncData
    );

    syncLogs.push({
      ...log,
      id: `sync_${Date.now()}_${Math.random()}`,
      synced: false,
      timestamp: new Date().toISOString(),
    });
  }

  return syncLogs;
}

/**
 * Synchroniser un changement d'ordre de passage
 */
export async function syncOrderChange(
  competitionId: string,
  sourcePlatformId: string,
  orderData: any,
  targetPlatforms: Platform[],
  config: SyncConfig
): Promise<PlatformSyncLog[]> {
  if (!config.auto_sync) {
    return [];
  }

  const syncLogs: PlatformSyncLog[] = [];

  // Broadcast à toutes les plateformes
  for (const targetPlatform of targetPlatforms) {
    if (targetPlatform.id === sourcePlatformId || !targetPlatform.active) {
      continue;
    }

    const syncData: SyncData = {
      entity_type: 'order',
      entity_id: 'order_update',
      action: 'update',
      payload: orderData,
    };

    const log = createSyncLog(
      competitionId,
      sourcePlatformId,
      targetPlatform.id,
      'order_change',
      syncData
    );

    syncLogs.push({
      ...log,
      id: `sync_${Date.now()}_${Math.random()}`,
      synced: false,
      timestamp: new Date().toISOString(),
    });
  }

  return syncLogs;
}

/**
 * Résoudre les conflits de synchronisation
 */
export function resolveConflict(
  localData: any,
  remoteData: any,
  strategy: 'latest' | 'manual' | 'source_priority'
): any {
  if (strategy === 'source_priority') {
    // Toujours prendre la donnée distante (source)
    return remoteData;
  }

  if (strategy === 'latest') {
    // Prendre la donnée la plus récente
    const localTimestamp = new Date(localData.timestamp || localData.updated_at);
    const remoteTimestamp = new Date(
      remoteData.timestamp || remoteData.updated_at
    );

    return remoteTimestamp > localTimestamp ? remoteData : localData;
  }

  // Pour 'manual', retourner null et demander intervention utilisateur
  return null;
}

/**
 * Traiter les logs de synchronisation en attente
 */
export async function processPendingSyncLogs(
  syncLogs: PlatformSyncLog[],
  onSync: (log: PlatformSyncLog, data: SyncData) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;

  for (const log of syncLogs.filter((l) => !l.synced)) {
    try {
      const data: SyncData = JSON.parse(log.data);
      const success = await onSync(log, data);

      if (success) {
        processed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Error processing sync log:', error);
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * Vérifier l'état de synchronisation entre plateformes
 */
export function checkSyncStatus(
  platforms: Platform[],
  syncLogs: PlatformSyncLog[]
): {
  platform_id: string;
  platform_name: string;
  pending_syncs: number;
  last_sync: string | null;
  is_synced: boolean;
}[] {
  return platforms.map((platform) => {
    const platformLogs = syncLogs.filter(
      (log) =>
        log.source_platform_id === platform.id ||
        log.target_platform_id === platform.id
    );

    const pendingSyncs = platformLogs.filter((log) => !log.synced).length;

    const sortedLogs = platformLogs
      .filter((log) => log.synced)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    const lastSync = sortedLogs.length > 0 ? sortedLogs[0].timestamp : null;

    return {
      platform_id: platform.id,
      platform_name: platform.name,
      pending_syncs: pendingSyncs,
      last_sync: lastSync,
      is_synced: pendingSyncs === 0,
    };
  });
}

/**
 * Configuration par défaut de synchronisation
 */
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  auto_sync: true,
  sync_interval: 5000, // 5 secondes
  conflict_resolution: 'latest',
  sync_attempts: true,
  sync_declarations: true,
};
