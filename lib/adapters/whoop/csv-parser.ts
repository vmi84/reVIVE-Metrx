/**
 * Whoop CSV export parser.
 *
 * Whoop data exports typically contain columns such as:
 *   Date, HRV (ms), RHR (bpm), Respiratory Rate, Recovery Score,
 *   Sleep Performance (%), Sleep Duration (min), REM Sleep (min),
 *   Deep (SWS) Sleep (min), Light Sleep (min), Awake Duration (min),
 *   Sleep Latency (min), SpO2 (%), Skin Temp (C), Sleep Consistency (%),
 *   Awakenings, Workout Strain, Calories Burned, Avg HR, Max HR
 *
 * Maps each row to a CanonicalPhysiologyRecord.
 */

import Papa from 'papaparse';
import {
  CanonicalPhysiologyRecord,
  SleepMetrics,
  CardiovascularMetrics,
  RecoveryMetrics,
} from '../../types/canonical';
import { assessQuality } from '../quality-scoring';

/** Mapping of possible CSV header variations to a normalized key. */
const HEADER_ALIASES: Record<string, string> = {
  date: 'date',
  'hrv (ms)': 'hrv',
  'hrv rmssd (ms)': 'hrv',
  hrv: 'hrv',
  'rhr (bpm)': 'rhr',
  'resting heart rate': 'rhr',
  rhr: 'rhr',
  'respiratory rate': 'respiratoryRate',
  'recovery score': 'recoveryScore',
  'recovery score (%)': 'recoveryScore',
  'sleep performance (%)': 'sleepPerformance',
  'sleep performance': 'sleepPerformance',
  'sleep duration (min)': 'sleepDuration',
  'sleep duration': 'sleepDuration',
  'rem sleep (min)': 'remSleep',
  'rem sleep': 'remSleep',
  'deep (sws) sleep (min)': 'deepSleep',
  'deep sleep (min)': 'deepSleep',
  'deep sleep': 'deepSleep',
  'light sleep (min)': 'lightSleep',
  'light sleep': 'lightSleep',
  'awake duration (min)': 'awakeDuration',
  'awake duration': 'awakeDuration',
  'sleep latency (min)': 'sleepLatency',
  'sleep latency': 'sleepLatency',
  'spo2 (%)': 'spo2',
  spo2: 'spo2',
  'skin temp (c)': 'skinTemp',
  'skin temp deviation': 'skinTemp',
  'skin temp': 'skinTemp',
  'sleep consistency (%)': 'sleepConsistency',
  'sleep consistency': 'sleepConsistency',
  awakenings: 'awakenings',
  'workout strain': 'strain',
  strain: 'strain',
  'calories burned': 'calories',
  calories: 'calories',
  'avg hr': 'avgHr',
  'average heart rate': 'avgHr',
  'max hr': 'maxHr',
  'max heart rate': 'maxHr',
};

/** Convert minutes to milliseconds (Whoop CSV exports often use minutes). */
function minToMs(val: number | null): number | null {
  return val != null ? Math.round(val * 60_000) : null;
}

/** Parse a numeric CSV cell, returning null for empty / unparseable values. */
function num(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === '' || raw.trim() === '--') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse Whoop CSV content into canonical records.
 */
export async function parseWhoopCSV(
  csvContent: string,
): Promise<CanonicalPhysiologyRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => {
        const key = h.trim().toLowerCase();
        return HEADER_ALIASES[key] ?? key;
      },
      complete(results) {
        try {
          const records = results.data
            .map(rowToRecord)
            .filter((r): r is CanonicalPhysiologyRecord => r !== null);
          resolve(records);
        } catch (err) {
          reject(err);
        }
      },
      error(err: Error) {
        reject(err);
      },
    });
  });
}

function rowToRecord(
  row: Record<string, string>,
): CanonicalPhysiologyRecord | null {
  const dateRaw = row.date?.trim();
  if (!dateRaw) return null;

  // Normalize date to YYYY-MM-DD
  const date = normalizeDate(dateRaw);
  if (!date) return null;

  const sleep: SleepMetrics = {
    totalSleepMs: minToMs(num(row.sleepDuration)),
    sleepPerformancePct: num(row.sleepPerformance),
    sleepConsistencyPct: num(row.sleepConsistency),
    remSleepMs: minToMs(num(row.remSleep)),
    deepSleepMs: minToMs(num(row.deepSleep)),
    lightSleepMs: minToMs(num(row.lightSleep)),
    awakeDuringMs: minToMs(num(row.awakeDuration)),
    sleepLatencyMs: minToMs(num(row.sleepLatency)),
    sleepOnsetTime: null,
    wakeTime: null,
    awakenings: num(row.awakenings) != null ? Math.round(num(row.awakenings)!) : null,
    respiratoryRate: num(row.respiratoryRate),
    spo2Pct: num(row.spo2),
    skinTempDeviation: num(row.skinTemp),
  };

  const cardiovascular: CardiovascularMetrics = {
    hrvRmssd: num(row.hrv),
    restingHeartRate: num(row.rhr),
    respiratoryRate: num(row.respiratoryRate),
    spo2Pct: num(row.spo2),
    skinTempDeviation: num(row.skinTemp),
  };

  const recovery: RecoveryMetrics = {
    recoveryScore: num(row.recoveryScore),
    hrvRmssd: num(row.hrv),
    restingHeartRate: num(row.rhr),
    spo2Pct: num(row.spo2),
    skinTempDeviation: num(row.skinTemp),
    respiratoryRate: num(row.respiratoryRate),
  };

  const record: CanonicalPhysiologyRecord = {
    date,
    source: 'whoop',
    dataQuality: 'medium', // placeholder, overwritten below
    sleep,
    cardiovascular,
    recovery,
    workouts: [], // CSV exports don't include per-workout detail
  };

  record.dataQuality = assessQuality(record).tier;

  return record;
}

/**
 * Accept common date formats from Whoop CSV exports and return YYYY-MM-DD.
 */
function normalizeDate(raw: string): string | null {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // MM/DD/YYYY or M/D/YYYY
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Fallback: let Date parse it
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}
