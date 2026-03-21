/**
 * Apple HealthKit Sync Hook
 *
 * Reads health data from the local HealthKit store on the user's iPhone.
 * No tokens, no network calls — all data is local.
 *
 * Features:
 *  - Morning data sync (HRV, RHR, sleep, SpO2)
 *  - Post-workout sync (workouts + HR)
 *  - Historical backfill (90 days on first connect)
 *  - AppState-based re-sync on foreground return
 *  - Multi-device merge (fill-nulls when not primary device)
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { useSyncStore } from '../store/sync-store';
import { useDailyStore } from '../store/daily-store';
import { usePhysiologyStore, type MergeStrategy } from '../store/physiology-store';
import { useSettingsStore } from '../store/settings-store';
import { today, daysAgo } from '../lib/utils/date';
import { healthKitAdapter } from '../lib/adapters/healthkit';
import { isHealthKitAvailable, verifyHealthKitAccess } from '../lib/adapters/healthkit/permissions';

// ─── Constants ───────────────────────────────────────────────────────────────

const BACKFILL_DAYS = 90;
const MIN_SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useHealthKitSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const lastSyncRef = useRef<number>(0);

  // Re-sync when app returns to foreground
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        const hkEnabled = useSettingsStore.getState().healthKitEnabled;
        if (hkEnabled) {
          syncMorningData().catch(console.warn);
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  /**
   * Check if HealthKit is connected and permissions are granted.
   */
  const isConnected = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;
    if (!isHealthKitAvailable()) return false;
    if (!useSettingsStore.getState().healthKitEnabled) return false;
    return verifyHealthKitAccess();
  }, []);

  /**
   * Determine merge strategy based on primary device setting.
   */
  const getMergeStrategy = useCallback((): MergeStrategy => {
    const primary = useSettingsStore.getState().primaryDevice;
    return primary === 'apple_health' ? 'overwrite' : 'fill-nulls';
  }, []);

  /**
   * Sync today's morning data (recovery metrics + sleep).
   */
  const syncMorningData = useCallback(async () => {
    if (Platform.OS !== 'ios') return;

    // Throttle: skip if synced recently
    const now = Date.now();
    if (now - lastSyncRef.current < MIN_SYNC_INTERVAL_MS) {
      console.log('[HealthKit] Skipping sync — last sync was < 15 min ago');
      return;
    }

    setSyncing(true);
    setSyncProgress('Reading health data…');

    try {
      const todayStr = today();
      // Fetch today + yesterday (sleep sessions span overnight)
      const records = await healthKitAdapter.fetchLocalData!(
        daysAgo(1),
        todayStr,
      );

      if (records.length > 0) {
        const strategy = getMergeStrategy();
        usePhysiologyStore.getState().upsertRecords(records, strategy);

        usePhysiologyStore.setState({
          lastImport: {
            source: 'apple_health',
            recordCount: records.length,
            dateRange: { start: daysAgo(1), end: todayStr },
            importedAt: new Date().toISOString(),
          },
        });

        useDailyStore.getState().setDeviceSynced(true, 'apple_health');
        useSyncStore.getState().setLastDeviceSync(new Date().toISOString(), 'apple_health');
        console.log(`[HealthKit] Morning sync: ${records.length} records`);
      }

      lastSyncRef.current = now;
      setSyncProgress(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[HealthKit] Morning sync error:', msg);
      useSyncStore.getState().setSyncError(`HealthKit sync failed: ${msg}`);
      setSyncProgress(null);
    } finally {
      setSyncing(false);
    }
  }, [getMergeStrategy]);

  /**
   * Historical backfill — fetch the last N days of data.
   * Default: 90 days on first connect.
   */
  const syncHistorical = useCallback(async (daysBack: number = BACKFILL_DAYS) => {
    if (Platform.OS !== 'ios') return;

    setSyncing(true);
    setSyncProgress(`Importing ${daysBack} days of health data…`);

    try {
      const todayStr = today();
      const startDate = daysAgo(daysBack);

      const records = await healthKitAdapter.fetchLocalData!(startDate, todayStr);

      if (records.length > 0) {
        const strategy = getMergeStrategy();
        usePhysiologyStore.getState().upsertRecords(records, strategy);

        usePhysiologyStore.setState({
          lastImport: {
            source: 'apple_health',
            recordCount: records.length,
            dateRange: { start: startDate, end: todayStr },
            importedAt: new Date().toISOString(),
          },
        });

        useDailyStore.getState().setDeviceSynced(true, 'apple_health');
        useSyncStore.getState().setLastDeviceSync(new Date().toISOString(), 'apple_health');
      }

      console.log(`[HealthKit] Historical sync: ${records.length} records (${daysBack} days)`);
      setSyncProgress(`Imported ${records.length} days of data`);
      lastSyncRef.current = Date.now();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[HealthKit] Historical sync error:', msg);
      useSyncStore.getState().setSyncError(`HealthKit backfill failed: ${msg}`);
      setSyncProgress(null);
    } finally {
      setSyncing(false);
    }
  }, [getMergeStrategy]);

  return {
    syncMorningData,
    syncHistorical,
    isConnected,
    syncing,
    syncProgress,
  };
}
