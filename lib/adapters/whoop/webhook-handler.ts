/**
 * Whoop webhook event handler.
 *
 * Supported events:
 *   - recovery.updated
 *   - sleep.updated
 *   - workout.updated
 *
 * Validates the incoming payload structure and converts Whoop-specific
 * data into CanonicalPhysiologyRecord format.
 */

import {
  CanonicalPhysiologyRecord,
  SleepMetrics,
  CardiovascularMetrics,
  RecoveryMetrics,
  WorkoutMetrics,
} from '../../types/canonical';
import { assessQuality } from '../quality-scoring';
import {
  WhoopRecoveryRecord,
  WhoopSleepRecord,
  WhoopWorkoutRecord,
  sportName,
} from './api-client';

// ─── Webhook payload shapes ─────────────────────────────────────────────────

export type WhoopWebhookEventType =
  | 'recovery.updated'
  | 'sleep.updated'
  | 'workout.updated';

export interface WhoopWebhookPayload {
  user_id: number;
  id: number;
  type: WhoopWebhookEventType;
  trace_id: string;
  /** ISO-8601 timestamp */
  created_at: string;
  /**
   * The full record matching the event type.
   * Whoop sends the complete object in the `data` field.
   */
  data: WhoopRecoveryRecord | WhoopSleepRecord | WhoopWorkoutRecord;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function dateFromISO(iso: string): string {
  return iso.slice(0, 10);
}

// ─── Event handlers ──────────────────────────────────────────────────────────

function handleRecoveryUpdated(
  data: WhoopRecoveryRecord,
): CanonicalPhysiologyRecord {
  const date = dateFromISO(data.created_at);
  const record = emptyRecord(date);

  if (data.score) {
    const s = data.score;
    record.recovery = {
      recoveryScore: s.recovery_score,
      hrvRmssd: s.hrv_rmssd_milli,
      restingHeartRate: s.resting_heart_rate,
      spo2Pct: s.spo2_percentage,
      skinTempDeviation: s.skin_temp_celsius,
      respiratoryRate: null,
    };
    record.cardiovascular = {
      hrvRmssd: s.hrv_rmssd_milli,
      restingHeartRate: s.resting_heart_rate,
      spo2Pct: s.spo2_percentage,
      skinTempDeviation: s.skin_temp_celsius,
      respiratoryRate: null,
    };
  }

  record.dataQuality = assessQuality(record).tier;
  return record;
}

function handleSleepUpdated(
  data: WhoopSleepRecord,
): CanonicalPhysiologyRecord {
  const date = dateFromISO(data.start);
  const record = emptyRecord(date);

  record.sleep.sleepOnsetTime = data.start;
  record.sleep.wakeTime = data.end;

  if (data.score) {
    const s = data.score;
    const stages = s.stage_summary;

    const totalSleepMs =
      stages.total_light_sleep_time_milli +
      stages.total_slow_wave_sleep_time_milli +
      stages.total_rem_sleep_time_milli;

    record.sleep = {
      totalSleepMs,
      sleepPerformancePct: s.sleep_performance_percentage,
      sleepConsistencyPct: s.sleep_consistency_percentage,
      remSleepMs: stages.total_rem_sleep_time_milli,
      deepSleepMs: stages.total_slow_wave_sleep_time_milli,
      lightSleepMs: stages.total_light_sleep_time_milli,
      awakeDuringMs: stages.total_awake_time_milli,
      sleepLatencyMs: null, // Not provided in webhook payload
      sleepOnsetTime: data.start,
      wakeTime: data.end,
      awakenings: stages.disturbance_count,
      respiratoryRate: s.respiratory_rate,
      spo2Pct: null,
      skinTempDeviation: null,
    };

    if (s.respiratory_rate != null) {
      record.cardiovascular.respiratoryRate = s.respiratory_rate;
    }
  }

  record.dataQuality = assessQuality(record).tier;
  return record;
}

function handleWorkoutUpdated(
  data: WhoopWorkoutRecord,
): CanonicalPhysiologyRecord {
  const date = dateFromISO(data.start);
  const record = emptyRecord(date);

  if (data.score) {
    const s = data.score;
    const startMs = new Date(data.start).getTime();
    const endMs = new Date(data.end).getTime();

    const workout: WorkoutMetrics = {
      workoutId: String(data.id),
      workoutType: sportName(data.sport_id),
      startTime: data.start,
      endTime: data.end,
      durationMs: endMs - startMs,
      avgHeartRate: s.average_heart_rate,
      maxHeartRate: s.max_heart_rate,
      strainScore: s.strain,
      caloriesBurned: Math.round(s.kilojoule / 4.184), // kJ → kcal
      hrZones: {
        zone1Ms: s.zone_duration.zone_one_milli,
        zone2Ms: s.zone_duration.zone_two_milli,
        zone3Ms: s.zone_duration.zone_three_milli,
        zone4Ms: s.zone_duration.zone_four_milli,
        zone5Ms: s.zone_duration.zone_five_milli,
      },
    };

    record.workouts = [workout];
  }

  record.dataQuality = assessQuality(record).tier;
  return record;
}

// ─── Public API ──────────────────────────────────────────────────────────────

const VALID_EVENT_TYPES: Set<string> = new Set([
  'recovery.updated',
  'sleep.updated',
  'workout.updated',
]);

/**
 * Validate that the payload has the expected shape.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateWebhookPayload(
  payload: unknown,
): string | null {
  if (payload == null || typeof payload !== 'object') {
    return 'Payload must be a non-null object';
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.type !== 'string' || !VALID_EVENT_TYPES.has(p.type)) {
    return `Invalid event type: ${String(p.type)}`;
  }

  if (p.data == null || typeof p.data !== 'object') {
    return 'Payload must contain a "data" object';
  }

  if (typeof p.user_id !== 'number') {
    return 'Payload must contain a numeric "user_id"';
  }

  return null;
}

/**
 * Process a validated Whoop webhook payload into a canonical record.
 * Throws if the payload is invalid (call validateWebhookPayload first).
 */
export function processWebhookEvent(
  payload: WhoopWebhookPayload,
): CanonicalPhysiologyRecord {
  switch (payload.type) {
    case 'recovery.updated':
      return handleRecoveryUpdated(payload.data as WhoopRecoveryRecord);
    case 'sleep.updated':
      return handleSleepUpdated(payload.data as WhoopSleepRecord);
    case 'workout.updated':
      return handleWorkoutUpdated(payload.data as WhoopWorkoutRecord);
    default:
      throw new Error(`Unhandled webhook event type: ${String(payload.type)}`);
  }
}
