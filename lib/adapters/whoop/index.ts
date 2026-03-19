/**
 * Whoop adapter — implements the WearableAdapter interface.
 *
 * Composes:
 *   - WhoopApiClient   (OAuth + API data fetching)
 *   - parseWhoopCSV     (CSV import)
 *   - assessQuality     (data quality scoring)
 *   - webhook handler   (real-time event processing)
 */

import {
  CanonicalPhysiologyRecord,
  DataQualityReport,
  SleepMetrics,
  CardiovascularMetrics,
  RecoveryMetrics,
  WorkoutMetrics,
} from '../../types/canonical';
import { WearableAdapter, AdapterConfig, TokenPair } from '../types';
import { assessQuality } from '../quality-scoring';
import { WhoopApiClient, sportName } from './api-client';
import { parseWhoopCSV } from './csv-parser';

export {
  validateWebhookPayload,
  processWebhookEvent,
} from './webhook-handler';

export type { WhoopWebhookPayload, WhoopWebhookEventType } from './webhook-handler';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptySleep(): SleepMetrics {
  return {
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
  };
}

function emptyCardiovascular(): CardiovascularMetrics {
  return {
    hrvRmssd: null,
    restingHeartRate: null,
    respiratoryRate: null,
    spo2Pct: null,
    skinTempDeviation: null,
  };
}

function emptyRecovery(): RecoveryMetrics {
  return {
    recoveryScore: null,
    hrvRmssd: null,
    restingHeartRate: null,
    spo2Pct: null,
    skinTempDeviation: null,
    respiratoryRate: null,
  };
}

function emptyRecord(date: string): CanonicalPhysiologyRecord {
  return {
    date,
    source: 'whoop',
    dataQuality: 'low',
    sleep: emptySleep(),
    cardiovascular: emptyCardiovascular(),
    recovery: emptyRecovery(),
    workouts: [],
  };
}

function dateFromISO(iso: string): string {
  return iso.slice(0, 10);
}

// ─── Adapter implementation ──────────────────────────────────────────────────

const client = new WhoopApiClient();

const whoopAdapterConfig: AdapterConfig = {
  deviceType: 'whoop',
  label: 'WHOOP',
  supportsOAuth: true,
  supportsCSV: true,
  supportsWebhook: true,
};

export const whoopAdapter: WearableAdapter = {
  config: whoopAdapterConfig,

  // ── OAuth ────────────────────────────────────────────────────────────────

  getAuthUrl(): string {
    return client.getAuthUrl();
  },

  async handleAuthCallback(code: string): Promise<TokenPair> {
    return client.exchangeCode(code);
  },

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    return client.refreshAccessToken(refreshToken);
  },

  // ── Data fetching ────────────────────────────────────────────────────────

  async fetchRecovery(
    token: string,
    date: string,
  ): Promise<CanonicalPhysiologyRecord> {
    const nextDay = nextDate(date);
    const recoveries = await client.getRecovery(token, date, nextDay);
    const record = emptyRecord(date);

    if (recoveries.length > 0) {
      const r = recoveries[0];
      if (r.score) {
        record.recovery = {
          recoveryScore: r.score.recovery_score,
          hrvRmssd: r.score.hrv_rmssd_milli,
          restingHeartRate: r.score.resting_heart_rate,
          spo2Pct: r.score.spo2_percentage,
          skinTempDeviation: r.score.skin_temp_celsius,
          respiratoryRate: null,
        };
        record.cardiovascular = {
          hrvRmssd: r.score.hrv_rmssd_milli,
          restingHeartRate: r.score.resting_heart_rate,
          spo2Pct: r.score.spo2_percentage,
          skinTempDeviation: r.score.skin_temp_celsius,
          respiratoryRate: null,
        };
      }
    }

    record.dataQuality = assessQuality(record).tier;
    return record;
  },

  async fetchSleep(
    token: string,
    date: string,
  ): Promise<CanonicalPhysiologyRecord> {
    const nextDay = nextDate(date);
    const sleeps = await client.getSleep(token, date, nextDay);
    const record = emptyRecord(date);

    // Use the primary sleep session (non-nap)
    const primarySleep = sleeps.find((s) => !s.nap) ?? sleeps[0];
    if (primarySleep) {
      record.sleep.sleepOnsetTime = primarySleep.start;
      record.sleep.wakeTime = primarySleep.end;

      if (primarySleep.score) {
        const sc = primarySleep.score;
        const stages = sc.stage_summary;

        const totalSleepMs =
          stages.total_light_sleep_time_milli +
          stages.total_slow_wave_sleep_time_milli +
          stages.total_rem_sleep_time_milli;

        record.sleep = {
          totalSleepMs,
          sleepPerformancePct: sc.sleep_performance_percentage,
          sleepConsistencyPct: sc.sleep_consistency_percentage,
          remSleepMs: stages.total_rem_sleep_time_milli,
          deepSleepMs: stages.total_slow_wave_sleep_time_milli,
          lightSleepMs: stages.total_light_sleep_time_milli,
          awakeDuringMs: stages.total_awake_time_milli,
          sleepLatencyMs: null,
          sleepOnsetTime: primarySleep.start,
          wakeTime: primarySleep.end,
          awakenings: stages.disturbance_count,
          respiratoryRate: sc.respiratory_rate,
          spo2Pct: null,
          skinTempDeviation: null,
        };

        if (sc.respiratory_rate != null) {
          record.cardiovascular.respiratoryRate = sc.respiratory_rate;
        }
      }
    }

    record.dataQuality = assessQuality(record).tier;
    return record;
  },

  async fetchWorkouts(
    token: string,
    startDate: string,
    endDate: string,
  ): Promise<CanonicalPhysiologyRecord[]> {
    const workouts = await client.getWorkouts(token, startDate, endDate);

    // Group workouts by date
    const byDate = new Map<string, CanonicalPhysiologyRecord>();

    for (const w of workouts) {
      const date = dateFromISO(w.start);
      let record = byDate.get(date);
      if (!record) {
        record = emptyRecord(date);
        byDate.set(date, record);
      }

      if (w.score) {
        const startMs = new Date(w.start).getTime();
        const endMs = new Date(w.end).getTime();

        const workout: WorkoutMetrics = {
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
        };

        record.workouts.push(workout);
      }
    }

    // Finalize quality scores
    for (const record of byDate.values()) {
      record.dataQuality = assessQuality(record).tier;
    }

    return Array.from(byDate.values());
  },

  // ── CSV import ───────────────────────────────────────────────────────────

  async parseCSV(csvContent: string): Promise<CanonicalPhysiologyRecord[]> {
    return parseWhoopCSV(csvContent);
  },

  // ── Data quality ─────────────────────────────────────────────────────────

  assessQuality(record: CanonicalPhysiologyRecord): DataQualityReport {
    return assessQuality(record);
  },
};

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Return the next calendar day in YYYY-MM-DD format. */
function nextDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
