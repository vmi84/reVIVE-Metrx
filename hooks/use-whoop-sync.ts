/**
 * Whoop Live API Sync Hook
 *
 * Fetches recovery, sleep, and workout data from the Whoop API using
 * the adapter layer, then stores canonical records in the physiology store
 * (file-system backed). Works fully offline — no Supabase required.
 *
 * Features:
 *  - Automatic token refresh before expiry
 *  - Morning data sync (recovery + sleep)
 *  - Post-workout sync (workouts + strain)
 *  - Historical backfill (configurable date range)
 *  - Error handling with user-friendly messages
 */

import { useCallback, useState, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useSyncStore } from '../store/sync-store';
import { useDailyStore } from '../store/daily-store';
import { usePhysiologyStore } from '../store/physiology-store';
import { today, daysAgo } from '../lib/utils/date';
import { WHOOP_TOKEN_URL } from '../lib/utils/constants';
import type { CanonicalPhysiologyRecord } from '../lib/types/canonical';

// ─── Secure Store Keys ────────────────────────────────────────────────────────

const TOKEN_KEY = 'whoop_access_token';
const REFRESH_KEY = 'whoop_refresh_token';
const EXPIRY_KEY = 'whoop_token_expires_at';

// Refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

// ─── Token Management ─────────────────────────────────────────────────────────

async function getValidToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return null;

  // Check if token needs refresh
  const expiryStr = await SecureStore.getItemAsync(EXPIRY_KEY);
  if (expiryStr) {
    const expiresAt = Number(expiryStr);
    if (Date.now() > expiresAt - REFRESH_BUFFER_MS) {
      // Token expired or expiring soon — try to refresh
      const refreshed = await refreshToken();
      return refreshed;
    }
  }

  return token;
}

async function refreshToken(): Promise<string | null> {
  const refreshTok = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshTok) return null;

  const extra = Constants.expoConfig?.extra ?? {};
  const clientId = extra.whoopClientId ?? '';
  const clientSecret = extra.whoopClientSecret ?? '';

  try {
    const res = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshTok,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!res.ok) {
      console.warn('Token refresh failed:', res.status);
      // Clear invalid tokens
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      await SecureStore.deleteItemAsync(EXPIRY_KEY);
      return null;
    }

    const data = await res.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    // Store refreshed tokens
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      await SecureStore.setItemAsync(REFRESH_KEY, data.refresh_token);
    }
    const expiresAt = Date.now() + data.expires_in * 1000;
    await SecureStore.setItemAsync(EXPIRY_KEY, String(expiresAt));

    return data.access_token;
  } catch (err) {
    console.warn('Token refresh error:', err);
    return null;
  }
}

// ─── Merge Helper ─────────────────────────────────────────────────────────────

/** Merge recovery + sleep + workout canonical records for the same date. */
function mergeRecords(
  recovery: CanonicalPhysiologyRecord | null,
  sleep: CanonicalPhysiologyRecord | null,
  workoutRecords: CanonicalPhysiologyRecord[],
  date: string,
): CanonicalPhysiologyRecord {
  const base: CanonicalPhysiologyRecord = {
    date,
    source: 'whoop',
    dataQuality: 'medium',
    sleep: sleep?.sleep ?? {
      totalSleepMs: null,
      sleepPerformancePct: null,
      sleepConsistencyPct: null,
      remSleepMs: null,
      deepSleepMs: null,
      lightSleepMs: null,
      awakeDuringMs: null,
      sleepLatencyMs: null,
      sleepOnsetTime: null,
      wakeTime: null,
      awakenings: null,
      respiratoryRate: null,
      spo2Pct: null,
      skinTempDeviation: null,
    },
    cardiovascular: {
      hrvRmssd: recovery?.cardiovascular.hrvRmssd ?? sleep?.cardiovascular.hrvRmssd ?? null,
      restingHeartRate: recovery?.cardiovascular.restingHeartRate ?? null,
      respiratoryRate: sleep?.cardiovascular.respiratoryRate ?? recovery?.cardiovascular.respiratoryRate ?? null,
      spo2Pct: recovery?.cardiovascular.spo2Pct ?? null,
      skinTempDeviation: recovery?.cardiovascular.skinTempDeviation ?? null,
    },
    recovery: recovery?.recovery ?? {
      recoveryScore: null,
      hrvRmssd: null,
      restingHeartRate: null,
      spo2Pct: null,
      skinTempDeviation: null,
      respiratoryRate: null,
    },
    workouts: [],
  };

  // Collect workouts from workout records
  for (const wr of workoutRecords) {
    base.workouts.push(...wr.workouts);
  }

  // Determine data quality
  const hasRecovery = base.recovery.recoveryScore != null;
  const hasSleep = base.sleep.totalSleepMs != null;
  const hasHrv = base.cardiovascular.hrvRmssd != null;
  if (hasRecovery && hasSleep && hasHrv) {
    base.dataQuality = 'high';
  } else if (hasRecovery || hasSleep) {
    base.dataQuality = 'medium';
  } else {
    base.dataQuality = 'low';
  }

  return base;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWhoopSync() {
  const { setSyncInProgress, setLastDeviceSync, setSyncError } = useSyncStore();
  const { setDeviceSynced } = useDailyStore();
  const { upsertRecords } = usePhysiologyStore();
  const [syncing, setSyncing] = useState(false);
  const lastSyncDate = useRef<string | null>(null);

  /**
   * Check if Whoop is connected (has valid token).
   */
  const isConnected = useCallback(async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  }, []);

  /**
   * Sync today's recovery + sleep data from the Whoop API.
   * Stores canonical records in the physiology store (file-system persistence).
   */
  const syncMorningData = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncInProgress(true);
    setSyncError(null);

    try {
      const token = await getValidToken();
      if (!token) {
        setSyncError('Whoop not connected. Go to Profile > Connect Device.');
        return;
      }

      const dateStr = today();

      // Skip if we already synced today within the last 15 minutes
      if (lastSyncDate.current === dateStr) {
        const lastSync = useSyncStore.getState().lastDeviceSync;
        if (lastSync && Date.now() - new Date(lastSync).getTime() < 15 * 60 * 1000) {
          return; // Already synced recently
        }
      }

      // Lazy-import adapter to avoid bundling in non-Whoop paths
      const { whoopAdapter } = await import('../lib/adapters/whoop/index');

      // Fetch recovery + sleep in parallel
      const [recoveryRec, sleepRec] = await Promise.all([
        whoopAdapter.fetchRecovery!(token, dateStr).catch(() => null),
        whoopAdapter.fetchSleep!(token, dateStr).catch(() => null),
      ]);

      if (!recoveryRec && !sleepRec) {
        setSyncError('No Whoop data available for today yet. Wear your Whoop and check back later.');
        return;
      }

      // Merge into a single canonical record
      const merged = mergeRecords(recoveryRec, sleepRec, [], dateStr);

      // Store in physiology store (persisted to file system)
      upsertRecords([merged]);

      // Also store import metadata
      usePhysiologyStore.getState().lastImport = {
        source: 'whoop',
        recordCount: 1,
        dateRange: { start: dateStr, end: dateStr },
        importedAt: new Date().toISOString(),
      };

      setLastDeviceSync(new Date().toISOString(), 'whoop');
      setDeviceSynced(true, 'whoop');
      lastSyncDate.current = dateStr;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Whoop sync failed';
      // Check for auth errors
      if (msg.includes('401') || msg.includes('403')) {
        setSyncError('Whoop session expired. Please reconnect in Profile > Connect Device.');
        // Clear invalid tokens
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        await SecureStore.deleteItemAsync(EXPIRY_KEY);
      } else {
        setSyncError(msg);
      }
    } finally {
      setSyncing(false);
      setSyncInProgress(false);
    }
  }, [syncing]);

  /**
   * Sync today's workout data from the Whoop API.
   */
  const syncPostWorkout = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const dateStr = today();

      const { whoopAdapter } = await import('../lib/adapters/whoop/index');
      const workoutRecords = await whoopAdapter.fetchWorkouts!(token, dateStr, dateStr);

      if (workoutRecords.length === 0) return;

      // Get the existing record for today and merge workouts into it
      const existing = usePhysiologyStore.getState().getRecord(dateStr);
      if (existing) {
        // Merge new workouts into existing record
        const allWorkouts = [...existing.workouts];
        for (const wr of workoutRecords) {
          for (const w of wr.workouts) {
            // Avoid duplicates by workout ID
            if (!allWorkouts.some(ew => ew.workoutId === w.workoutId)) {
              allWorkouts.push(w);
            }
          }
        }
        existing.workouts = allWorkouts;
        upsertRecords([existing]);
      } else {
        // No existing record — create one with just workouts
        const merged = mergeRecords(null, null, workoutRecords, dateStr);
        upsertRecords([merged]);
      }
    } catch (err) {
      console.warn('Post-workout sync error:', err);
    }
  }, []);

  /**
   * Backfill historical data from Whoop API (e.g. last 30 days).
   */
  const syncHistorical = useCallback(async (daysBack: number = 30) => {
    if (syncing) return;
    setSyncing(true);
    setSyncInProgress(true);
    setSyncError(null);

    try {
      const token = await getValidToken();
      if (!token) {
        setSyncError('Whoop not connected.');
        return;
      }

      const { WhoopApiClient, sportName } = await import('../lib/adapters/whoop/api-client');
      const { whoopAdapter } = await import('../lib/adapters/whoop/index');
      const client = new WhoopApiClient();

      const startDate = daysAgo(daysBack);
      const endDate = today();

      // Fetch all data types in parallel
      const [recoveries, sleeps, workouts] = await Promise.all([
        client.getRecovery(token, startDate, endDate),
        client.getSleep(token, startDate, endDate),
        client.getWorkouts(token, startDate, endDate),
      ]);

      // Group everything by date
      const byDate = new Map<string, {
        recovery: typeof recoveries[0] | null;
        sleep: typeof sleeps[0] | null;
        workouts: typeof workouts;
      }>();

      // Index recoveries by date
      for (const r of recoveries) {
        const date = r.created_at.slice(0, 10);
        if (!byDate.has(date)) byDate.set(date, { recovery: null, sleep: null, workouts: [] });
        byDate.get(date)!.recovery = r;
      }

      // Index sleeps by date (primary sleep only)
      for (const s of sleeps) {
        if (s.nap) continue;
        const date = s.start.slice(0, 10);
        if (!byDate.has(date)) byDate.set(date, { recovery: null, sleep: null, workouts: [] });
        byDate.get(date)!.sleep = s;
      }

      // Index workouts by date
      for (const w of workouts) {
        const date = w.start.slice(0, 10);
        if (!byDate.has(date)) byDate.set(date, { recovery: null, sleep: null, workouts: [] });
        byDate.get(date)!.workouts.push(w);
      }

      // Build canonical records — use adapter for individual fetches is too slow,
      // so we map raw API data directly
      const records: CanonicalPhysiologyRecord[] = [];

      for (const [date, data] of byDate.entries()) {
        const rec: CanonicalPhysiologyRecord = {
          date,
          source: 'whoop',
          dataQuality: 'medium',
          sleep: {
            totalSleepMs: null,
            sleepPerformancePct: null,
            sleepConsistencyPct: null,
            remSleepMs: null,
            deepSleepMs: null,
            lightSleepMs: null,
            awakeDuringMs: null,
            sleepLatencyMs: null,
            sleepOnsetTime: null,
            wakeTime: null,
            awakenings: null,
            respiratoryRate: null,
            spo2Pct: null,
            skinTempDeviation: null,
          },
          cardiovascular: {
            hrvRmssd: null,
            restingHeartRate: null,
            respiratoryRate: null,
            spo2Pct: null,
            skinTempDeviation: null,
          },
          recovery: {
            recoveryScore: null,
            hrvRmssd: null,
            restingHeartRate: null,
            spo2Pct: null,
            skinTempDeviation: null,
            respiratoryRate: null,
          },
          workouts: [],
        };

        // Map recovery
        if (data.recovery?.score) {
          const s = data.recovery.score;
          rec.recovery = {
            recoveryScore: s.recovery_score,
            hrvRmssd: s.hrv_rmssd_milli,
            restingHeartRate: s.resting_heart_rate,
            spo2Pct: s.spo2_percentage,
            skinTempDeviation: s.skin_temp_celsius,
            respiratoryRate: null,
          };
          rec.cardiovascular.hrvRmssd = s.hrv_rmssd_milli;
          rec.cardiovascular.restingHeartRate = s.resting_heart_rate;
          rec.cardiovascular.spo2Pct = s.spo2_percentage;
          rec.cardiovascular.skinTempDeviation = s.skin_temp_celsius;
        }

        // Map sleep
        if (data.sleep?.score) {
          const sc = data.sleep.score;
          const stages = sc.stage_summary;
          const totalSleepMs =
            stages.total_light_sleep_time_milli +
            stages.total_slow_wave_sleep_time_milli +
            stages.total_rem_sleep_time_milli;

          rec.sleep = {
            totalSleepMs,
            sleepPerformancePct: sc.sleep_performance_percentage,
            sleepConsistencyPct: sc.sleep_consistency_percentage,
            remSleepMs: stages.total_rem_sleep_time_milli,
            deepSleepMs: stages.total_slow_wave_sleep_time_milli,
            lightSleepMs: stages.total_light_sleep_time_milli,
            awakeDuringMs: stages.total_awake_time_milli,
            sleepLatencyMs: null,
            sleepOnsetTime: data.sleep.start,
            wakeTime: data.sleep.end,
            awakenings: stages.disturbance_count,
            respiratoryRate: sc.respiratory_rate,
            spo2Pct: null,
            skinTempDeviation: null,
          };

          if (sc.respiratory_rate != null) {
            rec.cardiovascular.respiratoryRate = sc.respiratory_rate;
          }
        }

        // Map workouts
        for (const w of data.workouts) {
          if (w.score) {
            const startMs = new Date(w.start).getTime();
            const endMs = new Date(w.end).getTime();
            rec.workouts.push({
              workoutId: String(w.id),
              workoutType: sportName(w.sport_id),
              startTime: w.start,
              endTime: w.end,
              durationMs: endMs - startMs,
              avgHeartRate: w.score.average_heart_rate,
              maxHeartRate: w.score.max_heart_rate,
              strainScore: w.score.strain,
              caloriesBurned: Math.round(w.score.kilojoule / 4.184),
              hrZones: {
                zone1Ms: w.score.zone_duration.zone_one_milli,
                zone2Ms: w.score.zone_duration.zone_two_milli,
                zone3Ms: w.score.zone_duration.zone_three_milli,
                zone4Ms: w.score.zone_duration.zone_four_milli,
                zone5Ms: w.score.zone_duration.zone_five_milli,
              },
            });
          }
        }

        // Quality assessment
        const hasRecovery = rec.recovery.recoveryScore != null;
        const hasSleep = rec.sleep.totalSleepMs != null;
        const hasHrv = rec.cardiovascular.hrvRmssd != null;
        rec.dataQuality = hasRecovery && hasSleep && hasHrv ? 'high' :
                          hasRecovery || hasSleep ? 'medium' : 'low';

        records.push(rec);
      }

      // Sort by date and store
      records.sort((a, b) => a.date.localeCompare(b.date));
      upsertRecords(records);

      // Update metadata
      if (records.length > 0) {
        usePhysiologyStore.setState({
          lastImport: {
            source: 'whoop',
            recordCount: records.length,
            dateRange: {
              start: records[0].date,
              end: records[records.length - 1].date,
            },
            importedAt: new Date().toISOString(),
          },
        });
      }

      setLastDeviceSync(new Date().toISOString(), 'whoop');
      setDeviceSynced(true, 'whoop');

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Historical sync failed';
      setSyncError(msg);
    } finally {
      setSyncing(false);
      setSyncInProgress(false);
    }
  }, [syncing]);

  return {
    syncMorningData,
    syncPostWorkout,
    syncHistorical,
    isConnected,
    syncing,
  };
}
