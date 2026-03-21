/**
 * Apple HealthKit adapter — implements the WearableAdapter interface.
 *
 * Reads health data locally from the iPhone's Health database.
 * No OAuth, no tokens, no API calls — just iOS permissions.
 * The Apple Watch syncs to iPhone Health automatically.
 *
 * Composes:
 *   - permissions     (availability check + permission request)
 *   - queries         (low-level HealthKit data access)
 *   - mappers         (HealthKit → CanonicalPhysiologyRecord)
 *   - assessQuality   (shared data quality scoring)
 */

import {
  CanonicalPhysiologyRecord,
  DataQualityReport,
} from '../../types/canonical';
import { WearableAdapter, AdapterConfig } from '../types';
import { assessQuality } from '../quality-scoring';
import { isHealthKitAvailable, requestHealthKitPermissions } from './permissions';
import {
  queryHRV,
  queryRestingHeartRate,
  queryOxygenSaturation,
  queryRespiratoryRate,
  queryHeartRate,
  querySleepAnalysis,
  queryWorkouts,
  queryBodyTemperature,
} from './queries';
import { assembleRecord } from './mappers';
import { dateRange } from '../../utils/date';

// ─── Config ──────────────────────────────────────────────────────────────────

const healthKitAdapterConfig: AdapterConfig = {
  deviceType: 'apple_health',
  label: 'Apple Health',
  supportsOAuth: false,
  supportsCSV: false,
  supportsWebhook: false,
  supportsLocalData: true,
};

// ─── Adapter ─────────────────────────────────────────────────────────────────

export const healthKitAdapter: WearableAdapter = {
  config: healthKitAdapterConfig,

  // ── Local Data Access ───────────────────────────────────────────────────

  isAvailable(): boolean {
    return isHealthKitAvailable();
  },

  async requestPermissions(): Promise<boolean> {
    return requestHealthKitPermissions();
  },

  /**
   * Fetch all health data for a date range and return canonical records.
   * All queries are local (no network) so this is fast even for 90 days.
   */
  async fetchLocalData(
    startDate: string,
    endDate: string,
  ): Promise<CanonicalPhysiologyRecord[]> {
    // Run all queries in parallel — they're all local reads
    const [
      hrvSamples,
      rhrSamples,
      spo2Samples,
      respRateSamples,
      hrSamples,
      sleepSamples,
      workoutSamples,
      tempSamples,
    ] = await Promise.all([
      queryHRV(startDate, endDate),
      queryRestingHeartRate(startDate, endDate),
      queryOxygenSaturation(startDate, endDate),
      queryRespiratoryRate(startDate, endDate),
      queryHeartRate(startDate, endDate),
      querySleepAnalysis(startDate, endDate),
      queryWorkouts(startDate, endDate),
      queryBodyTemperature(startDate, endDate),
    ]);

    console.log(`[HealthKit] Raw data: HRV=${hrvSamples.length} RHR=${rhrSamples.length} SpO2=${spo2Samples.length} Sleep=${sleepSamples.length} Workouts=${workoutSamples.length}`);

    // Build one canonical record per date in the range
    const dates = dateRange(startDate, endDate);
    const records: CanonicalPhysiologyRecord[] = [];

    for (const date of dates) {
      const record = assembleRecord(
        date,
        sleepSamples,
        hrvSamples,
        rhrSamples,
        spo2Samples,
        respRateSamples,
        tempSamples,
        workoutSamples,
        hrSamples,
        // maxHR: could be derived from profile age (220 - age) or passed in
        undefined,
      );

      // Assess data quality
      record.dataQuality = assessQuality(record).tier;

      // Only include dates that have at least some data
      const hasAnyData =
        record.recovery.hrvRmssd != null ||
        record.recovery.restingHeartRate != null ||
        record.sleep.totalSleepMs != null ||
        record.workouts.length > 0;

      if (hasAnyData) {
        records.push(record);
      }
    }

    console.log(`[HealthKit] Built ${records.length} canonical records for ${startDate} to ${endDate}`);
    return records;
  },

  // ── Data Quality ────────────────────────────────────────────────────────

  assessQuality(record: CanonicalPhysiologyRecord): DataQualityReport {
    return assessQuality(record);
  },
};
