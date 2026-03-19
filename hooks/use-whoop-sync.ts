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

// Refresh 10 minutes before expiry (aggressive to avoid edge cases)
const REFRESH_BUFFER_MS = 10 * 60 * 1000;

// Retry config
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s exponential backoff

// ─── Retry Helper ─────────────────────────────────────────────────────────────

/**
 * Retry a fetch-based operation with exponential backoff.
 * Only retries on transient errors (5xx, network). 4xx errors fail immediately.
 */
async function fetchWithRetry(
  url: string,
  opts: RequestInit,
  retries: number = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, opts);

      // Don't retry client errors (400, 401, 403, 404) — they won't change
      if (res.status >= 400 && res.status < 500) return res;

      // Retry server errors (500, 502, 503, 504)
      if (res.status >= 500 && attempt < retries) {
        console.warn(`[Whoop] Server error ${res.status}, retrying (${attempt + 1}/${retries})…`);
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }

      return res;
    } catch (err) {
      // Network error (offline, DNS, timeout)
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        console.warn(`[Whoop] Network error, retrying (${attempt + 1}/${retries}):`, lastError.message);
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error('Fetch failed after retries');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Token Management ─────────────────────────────────────────────────────────

/** Track whether a refresh is already in progress to avoid duplicate refreshes. */
let refreshInProgress: Promise<string | null> | null = null;

/**
 * Get a valid access token, refreshing if needed.
 * Deduplicates concurrent refresh attempts.
 */
async function getValidToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) {
    console.log('[Whoop] No token found');
    return null;
  }

  // Check if token needs refresh
  const expiryStr = await SecureStore.getItemAsync(EXPIRY_KEY);
  if (expiryStr) {
    const expiresAt = Number(expiryStr);
    const timeUntilExpiry = expiresAt - Date.now();

    if (timeUntilExpiry < REFRESH_BUFFER_MS) {
      console.log(`[Whoop] Token expires in ${Math.round(timeUntilExpiry / 1000)}s, refreshing…`);
      // Deduplicate concurrent refresh calls
      if (!refreshInProgress) {
        refreshInProgress = refreshToken().finally(() => { refreshInProgress = null; });
      }
      return refreshInProgress;
    }
  }

  return token;
}

/**
 * Refresh the access token using the refresh token.
 * Returns new access token or null if refresh fails.
 * Only clears stored tokens on definitive auth failure (401/403), not transient errors.
 */
async function refreshToken(): Promise<string | null> {
  const refreshTok = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshTok) {
    console.warn('[Whoop] No refresh token available');
    return null;
  }

  const extra = Constants.expoConfig?.extra ?? {};
  const clientId = extra.whoopClientId ?? '';
  const clientSecret = extra.whoopClientSecret ?? '';

  try {
    const res = await fetchWithRetry(WHOOP_TOKEN_URL, {
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
      const status = res.status;
      console.warn(`[Whoop] Token refresh failed: ${status}`);

      // Only clear tokens on definitive auth failures — not transient errors
      if (status === 401 || status === 403) {
        console.warn('[Whoop] Auth definitively revoked, clearing tokens');
        await clearTokens();
      }
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

    console.log(`[Whoop] Token refreshed, expires in ${data.expires_in}s`);
    return data.access_token;
  } catch (err) {
    // Network error after all retries — don't clear tokens (transient)
    console.warn('[Whoop] Token refresh network error:', err);
    // Fall back to existing token if it might still work
    const existing = await SecureStore.getItemAsync(TOKEN_KEY);
    return existing;
  }
}

/** Clear all stored tokens (only on definitive auth revocation). */
async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(EXPIRY_KEY);
}

/**
 * Validate token health by making a lightweight API call.
 * Returns true if token is valid, false if needs re-auth.
 * Attempts refresh first if token appears expired.
 */
export async function checkTokenHealth(): Promise<'valid' | 'refreshed' | 'expired' | 'disconnected'> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return 'disconnected';

  // Check expiry
  const expiryStr = await SecureStore.getItemAsync(EXPIRY_KEY);
  if (expiryStr) {
    const expiresAt = Number(expiryStr);
    if (Date.now() > expiresAt - REFRESH_BUFFER_MS) {
      // Try to refresh
      const refreshed = await refreshToken();
      if (refreshed) return 'refreshed';
      return 'expired';
    }
  }

  // Token looks good locally — optionally validate with a lightweight API call
  try {
    const { WHOOP_API_BASE } = await import('../lib/utils/constants');
    const res = await fetch(`${WHOOP_API_BASE}/v2/user/profile/basic`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return 'valid';
    if (res.status === 401 || res.status === 403) {
      // Token invalid — try refresh
      const refreshed = await refreshToken();
      if (refreshed) return 'refreshed';
      return 'expired';
    }
    // Server error — assume token is fine, transient issue
    return 'valid';
  } catch {
    // Network error — assume token is fine
    return 'valid';
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
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const lastSyncDate = useRef<string | null>(null);

  /**
   * Check if Whoop is connected (has valid token).
   */
  const isConnected = useCallback(async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log('[Whoop] isConnected check — token exists:', !!token);
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
      // Categorize errors — only prompt re-auth for definitive auth failures
      if (msg.includes('401') || msg.includes('403')) {
        // Try refresh one more time before giving up
        const refreshed = await refreshToken();
        if (refreshed) {
          setSyncError('Token refreshed — please try syncing again.');
        } else {
          setSyncError('Whoop session expired. Reconnect in Settings > Connect Device.');
          await clearTokens();
        }
      } else if (msg.includes('Network') || msg.includes('fetch') || msg.includes('timeout')) {
        setSyncError('Network error — check your connection and try again.');
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
   * Backfill historical data from Whoop API.
   * Pass daysBack=0 (or undefined) to fetch ALL available data.
   */
  const syncHistorical = useCallback(async (daysBack?: number) => {
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
      const client = new WhoopApiClient();

      const startDate = daysBack ? daysAgo(daysBack) : undefined;
      const endDate = today();

      setSyncProgress('Fetching recovery data…');
      console.log('[Whoop] syncHistorical: startDate=', startDate, 'endDate=', endDate);

      // Fetch all data types — each wrapped to fail gracefully
      setSyncProgress('Fetching recovery data…');
      let recoveries: Awaited<ReturnType<typeof client.getRecovery>> = [];
      try {
        recoveries = await client.getRecovery(token, startDate, endDate);
      } catch (e) {
        console.warn('[Whoop] Recovery fetch failed:', e);
      }

      setSyncProgress(`${recoveries.length} recoveries · Fetching sleep…`);
      let sleeps: Awaited<ReturnType<typeof client.getSleep>> = [];
      try {
        sleeps = await client.getSleep(token, startDate, endDate);
      } catch (e) {
        console.warn('[Whoop] Sleep fetch failed:', e);
      }

      setSyncProgress(`${recoveries.length} recoveries · ${sleeps.length} sleeps · Fetching workouts…`);
      let workouts: Awaited<ReturnType<typeof client.getWorkouts>> = [];
      try {
        workouts = await client.getWorkouts(token, startDate, endDate);
      } catch (e) {
        console.warn('[Whoop] Workout fetch failed:', e);
      }

      setSyncProgress(`Fetching daily strain cycles…`);
      let cycles: Awaited<ReturnType<typeof client.getCycles>> = [];
      try {
        cycles = await client.getCycles(token, startDate, endDate);
      } catch {
        console.warn('[Whoop] Cycle endpoint unavailable, skipping day strain');
      }

      // If we got zero data from all endpoints, report error
      if (recoveries.length === 0 && sleeps.length === 0 && workouts.length === 0) {
        setSyncError('No data returned from Whoop. Try again in a few minutes.');
        return;
      }
      setSyncProgress(`Processing ${recoveries.length + sleeps.length + workouts.length} records…`);

      // Index cycle strain by date
      const cycleStrainByDate = new Map<string, number>();
      for (const c of cycles) {
        if (c.score?.strain != null) {
          const date = c.start.slice(0, 10);
          cycleStrainByDate.set(date, c.score.strain);
        }
      }

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
              hrZones: w.score.zone_duration ? {
                zone1Ms: w.score.zone_duration.zone_one_milli ?? 0,
                zone2Ms: w.score.zone_duration.zone_two_milli ?? 0,
                zone3Ms: w.score.zone_duration.zone_three_milli ?? 0,
                zone4Ms: w.score.zone_duration.zone_four_milli ?? 0,
                zone5Ms: w.score.zone_duration.zone_five_milli ?? 0,
              } : null,
            });
          }
        }

        // Day strain from cycle data (more accurate than summing workouts)
        rec.dayStrain = cycleStrainByDate.get(date) ?? null;

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
      // Log recent dates to debug missing days
      const recentDates = records.filter(r => r.date >= daysAgo(7)).map(r => ({
        date: r.date,
        hasRecovery: r.recovery.recoveryScore != null,
        hasSleep: r.sleep.totalSleepMs != null,
        workouts: r.workouts.length,
      }));
      console.log('[Whoop] syncHistorical: storing', records.length, 'records',
        records.length > 0 ? `(${records[0].date} → ${records[records.length - 1].date})` : '',
        '\nRecent 7 days:', JSON.stringify(recentDates, null, 2));
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
      console.error('[Whoop] syncHistorical error:', msg, err);
      setSyncError(msg);
    } finally {
      setSyncing(false);
      setSyncInProgress(false);
      setSyncProgress(null);
    }
  }, [syncing]);

  return {
    syncMorningData,
    syncPostWorkout,
    syncHistorical,
    isConnected,
    syncing,
    syncProgress,
  };
}
