/**
 * Whoop ZIP export parser.
 *
 * Whoop data exports are ZIP archives containing up to 4 CSV files:
 *   - physiological_cycles.csv — daily recovery, HRV, RHR, sleep summary, strain
 *   - sleeps.csv — sleep stages, naps, efficiency
 *   - workouts.csv — activity name, strain, HR zones, duration
 *   - journal_entries.csv — yes/no habit tracking
 *
 * This parser extracts all CSVs, merges them by cycle date, and returns
 * an array of CanonicalPhysiologyRecord objects with workout detail.
 */

import JSZip from 'jszip';
import {
  CanonicalPhysiologyRecord,
  SleepMetrics,
  CardiovascularMetrics,
  RecoveryMetrics,
  WorkoutMetrics,
  HrZoneDistribution,
} from '../../types/canonical';
import { assessQuality } from '../quality-scoring';

// ── Helpers ──────────────────────────────────────────────────────────

function num(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === '' || raw.trim() === '--') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function minToMs(val: number | null): number | null {
  return val != null ? Math.round(val * 60_000) : null;
}

/** Extract YYYY-MM-DD from a datetime like "2026-02-26 22:04:14" */
function extractDate(raw: string | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  // YYYY-MM-DD prefix
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  // Fallback Date parse
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Simple iterative CSV parser — avoids PapaParse stack overflow in React Native */
function parseCSV<T = Record<string, string>>(content: string): T[] {
  const lines = content.split('\n');
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row as T);
  }
  return rows;
}

/** Split a CSV line respecting quoted fields */
function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/** Find a file inside the ZIP by suffix (case-insensitive) */
async function findAndRead(zip: JSZip, suffix: string): Promise<string | null> {
  const lowerSuffix = suffix.toLowerCase();
  for (const path of Object.keys(zip.files)) {
    if (path.toLowerCase().endsWith(lowerSuffix) && !zip.files[path].dir) {
      return zip.files[path].async('text');
    }
  }
  return null;
}

// ── Raw CSV row types ────────────────────────────────────────────────

interface PhysioCycleRow {
  'Cycle start time': string;
  'Cycle end time': string;
  'Cycle timezone': string;
  'Recovery score %': string;
  'Resting heart rate (bpm)': string;
  'Heart rate variability (ms)': string;
  'Skin temp (celsius)': string;
  'Blood oxygen %': string;
  'Day Strain': string;
  'Energy burned (cal)': string;
  'Max HR (bpm)': string;
  'Average HR (bpm)': string;
  'Sleep onset': string;
  'Wake onset': string;
  'Sleep performance %': string;
  'Respiratory rate (rpm)': string;
  'Asleep duration (min)': string;
  'In bed duration (min)': string;
  'Light sleep duration (min)': string;
  'Deep (SWS) duration (min)': string;
  'REM duration (min)': string;
  'Awake duration (min)': string;
  'Sleep need (min)': string;
  'Sleep debt (min)': string;
  'Sleep efficiency %': string;
  'Sleep consistency %': string;
}

interface SleepRow {
  'Cycle start time': string;
  'Sleep onset': string;
  'Wake onset': string;
  'Sleep performance %': string;
  'Respiratory rate (rpm)': string;
  'Asleep duration (min)': string;
  'In bed duration (min)': string;
  'Light sleep duration (min)': string;
  'Deep (SWS) duration (min)': string;
  'REM duration (min)': string;
  'Awake duration (min)': string;
  'Sleep need (min)': string;
  'Sleep debt (min)': string;
  'Sleep efficiency %': string;
  'Sleep consistency %': string;
  Nap: string;
}

interface WorkoutRow {
  'Cycle start time': string;
  'Workout start time': string;
  'Workout end time': string;
  'Duration (min)': string;
  'Activity name': string;
  'Activity Strain': string;
  'Energy burned (cal)': string;
  'Max HR (bpm)': string;
  'Average HR (bpm)': string;
  'HR Zone 1 %': string;
  'HR Zone 2 %': string;
  'HR Zone 3 %': string;
  'HR Zone 4 %': string;
  'HR Zone 5 %': string;
}

// ── Public API ───────────────────────────────────────────────────────

export interface WhoopZipResult {
  records: CanonicalPhysiologyRecord[];
  workoutCount: number;
  journalCount: number;
  sleepCount: number;
  dateRange: { start: string; end: string } | null;
}

/**
 * Parse a Whoop ZIP export into canonical physiology records.
 * Accepts the ZIP file as an ArrayBuffer or base64 string.
 */
export async function parseWhoopZip(
  zipData: ArrayBuffer | string,
): Promise<WhoopZipResult> {
  const zip = await JSZip.loadAsync(zipData);

  // Read available CSVs (skip journal_entries — too large and not mapped to canonical records)
  const [physioCSV, sleepCSV, workoutCSV] = await Promise.all([
    findAndRead(zip, 'physiological_cycles.csv'),
    findAndRead(zip, 'sleeps.csv'),
    findAndRead(zip, 'workouts.csv'),
  ]);

  if (!physioCSV) {
    throw new Error('ZIP does not contain physiological_cycles.csv');
  }

  // Parse CSVs
  const physioRows = parseCSV<PhysioCycleRow>(physioCSV);
  const sleepRows = sleepCSV ? parseCSV<SleepRow>(sleepCSV) : [];
  const workoutRows = workoutCSV ? parseCSV<WorkoutRow>(workoutCSV) : [];

  // Index nap data by cycle date (exclude naps from primary sleep)
  const napsByDate = new Map<string, SleepRow[]>();
  const primarySleepByDate = new Map<string, SleepRow>();
  for (const row of sleepRows) {
    const date = extractDate(row['Cycle start time']);
    if (!date) continue;
    const isNap = row.Nap?.toLowerCase() === 'true';
    if (isNap) {
      const existing = napsByDate.get(date) ?? [];
      existing.push(row);
      napsByDate.set(date, existing);
    } else if (!primarySleepByDate.has(date)) {
      primarySleepByDate.set(date, row);
    }
  }

  // Index workouts by cycle date
  const workoutsByDate = new Map<string, WorkoutRow[]>();
  for (const row of workoutRows) {
    const date = extractDate(row['Cycle start time']);
    if (!date) continue;
    const existing = workoutsByDate.get(date) ?? [];
    existing.push(row);
    workoutsByDate.set(date, existing);
  }

  // Build records from physiological cycles
  const records: CanonicalPhysiologyRecord[] = [];
  for (const row of physioRows) {
    const date = extractDate(row['Cycle start time']);
    if (!date) continue;

    // Use detailed sleep data from sleeps.csv if available, fall back to physio cycle
    const sleepDetail = primarySleepByDate.get(date);

    const sleep: SleepMetrics = {
      totalSleepMs: minToMs(num(row['Asleep duration (min)'])),
      sleepPerformancePct: num(sleepDetail?.['Sleep performance %'] ?? row['Sleep performance %']),
      sleepConsistencyPct: num(sleepDetail?.['Sleep consistency %'] ?? row['Sleep consistency %']),
      remSleepMs: minToMs(num(row['REM duration (min)'])),
      deepSleepMs: minToMs(num(row['Deep (SWS) duration (min)'])),
      lightSleepMs: minToMs(num(row['Light sleep duration (min)'])),
      awakeDuringMs: minToMs(num(row['Awake duration (min)'])),
      sleepLatencyMs: null, // not in ZIP export
      sleepOnsetTime: row['Sleep onset']?.trim() || null,
      wakeTime: row['Wake onset']?.trim() || null,
      awakenings: null, // not in ZIP export
      respiratoryRate: num(row['Respiratory rate (rpm)']),
      spo2Pct: num(row['Blood oxygen %']),
      skinTempDeviation: num(row['Skin temp (celsius)']),
    };

    const cardiovascular: CardiovascularMetrics = {
      hrvRmssd: num(row['Heart rate variability (ms)']),
      restingHeartRate: num(row['Resting heart rate (bpm)']),
      respiratoryRate: num(row['Respiratory rate (rpm)']),
      spo2Pct: num(row['Blood oxygen %']),
      skinTempDeviation: num(row['Skin temp (celsius)']),
    };

    const recovery: RecoveryMetrics = {
      recoveryScore: num(row['Recovery score %']),
      hrvRmssd: num(row['Heart rate variability (ms)']),
      restingHeartRate: num(row['Resting heart rate (bpm)']),
      spo2Pct: num(row['Blood oxygen %']),
      skinTempDeviation: num(row['Skin temp (celsius)']),
      respiratoryRate: num(row['Respiratory rate (rpm)']),
    };

    // Map workouts for this date
    const dayWorkouts = workoutsByDate.get(date) ?? [];
    const workouts: WorkoutMetrics[] = dayWorkouts.map((w, i) => {
      const durationMin = num(w['Duration (min)']);
      const durationMs = durationMin != null ? Math.round(durationMin * 60_000) : 0;

      // Convert zone percentages to milliseconds
      const z1 = num(w['HR Zone 1 %']);
      const z2 = num(w['HR Zone 2 %']);
      const z3 = num(w['HR Zone 3 %']);
      const z4 = num(w['HR Zone 4 %']);
      const z5 = num(w['HR Zone 5 %']);
      const hasZones = z1 != null || z2 != null || z3 != null || z4 != null || z5 != null;
      const hrZones: HrZoneDistribution | null = hasZones
        ? {
            zone1Ms: Math.round(durationMs * ((z1 ?? 0) / 100)),
            zone2Ms: Math.round(durationMs * ((z2 ?? 0) / 100)),
            zone3Ms: Math.round(durationMs * ((z3 ?? 0) / 100)),
            zone4Ms: Math.round(durationMs * ((z4 ?? 0) / 100)),
            zone5Ms: Math.round(durationMs * ((z5 ?? 0) / 100)),
          }
        : null;

      return {
        workoutId: `whoop-${date}-${i}`,
        workoutType: w['Activity name']?.trim() || 'Unknown',
        startTime: w['Workout start time']?.trim() || '',
        endTime: w['Workout end time']?.trim() || '',
        durationMs,
        avgHeartRate: num(w['Average HR (bpm)']),
        maxHeartRate: num(w['Max HR (bpm)']),
        strainScore: num(w['Activity Strain']),
        caloriesBurned: num(w['Energy burned (cal)']),
        hrZones,
      };
    });

    const record: CanonicalPhysiologyRecord = {
      date,
      source: 'whoop',
      dataQuality: 'medium',
      sleep,
      cardiovascular,
      recovery,
      workouts,
    };

    record.dataQuality = assessQuality(record).tier;
    records.push(record);
  }

  // Sort by date
  records.sort((a, b) => a.date.localeCompare(b.date));

  const dateRange =
    records.length > 0
      ? { start: records[0].date, end: records[records.length - 1].date }
      : null;

  return {
    records,
    workoutCount: workoutRows.length,
    journalCount: 0,
    sleepCount: sleepRows.length,
    dateRange,
  };
}
