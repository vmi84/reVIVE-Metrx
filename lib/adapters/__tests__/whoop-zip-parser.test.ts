/**
 * Tests for Whoop ZIP parser — CSV parsing, date extraction, canonical record mapping.
 *
 * These tests cover the iterative CSV parser, field mapping, workout zone conversion,
 * and edge cases (missing fields, empty values, nap detection).
 */

// We test the internal helpers by importing the module and testing the public API
// with known CSV content. Since we can't create real ZIPs easily, we test parseCSV
// and the mapping logic directly.

// Mock JSZip since we can't create real ZIP files in tests
jest.mock('jszip', () => {
  return {
    __esModule: true,
    default: {
      loadAsync: jest.fn(),
    },
  };
});

// Mock quality scoring
jest.mock('../../adapters/quality-scoring', () => ({
  assessQuality: () => ({ tier: 'high' }),
}));

import JSZip from 'jszip';
import { parseWhoopZip } from '../whoop/zip-parser';

function makeZipMock(files: Record<string, string>) {
  const zipFiles: Record<string, { dir: boolean; async: () => Promise<string> }> = {};
  for (const [path, content] of Object.entries(files)) {
    zipFiles[path] = {
      dir: false,
      async: () => Promise.resolve(content),
    };
  }
  return { files: zipFiles };
}

describe('Whoop ZIP Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses physiological_cycles.csv into canonical records', async () => {
    const physioCSV = [
      'Cycle start time,Cycle end time,Cycle timezone,Recovery score %,Resting heart rate (bpm),Heart rate variability (ms),Skin temp (celsius),Blood oxygen %,Day Strain,Energy burned (cal),Max HR (bpm),Average HR (bpm),Sleep onset,Wake onset,Sleep performance %,Respiratory rate (rpm),Asleep duration (min),In bed duration (min),Light sleep duration (min),Deep (SWS) duration (min),REM duration (min),Awake duration (min),Sleep need (min),Sleep debt (min),Sleep efficiency %,Sleep consistency %',
      '2026-03-14 04:00:00,2026-03-15 04:00:00,America/New_York,72,54,68,0.2,97,12.5,2100,175,72,2026-03-13 22:30:00,2026-03-14 06:15:00,85,15.2,420,450,180,120,100,20,480,30,93,88',
    ].join('\n');

    (JSZip.loadAsync as jest.Mock).mockResolvedValue(
      makeZipMock({ 'physiological_cycles.csv': physioCSV }),
    );

    const result = await parseWhoopZip(new ArrayBuffer(0));

    expect(result.records).toHaveLength(1);
    const rec = result.records[0];

    expect(rec.date).toBe('2026-03-14');
    expect(rec.source).toBe('whoop');
    expect(rec.cardiovascular.hrvRmssd).toBe(68);
    expect(rec.cardiovascular.restingHeartRate).toBe(54);
    expect(rec.cardiovascular.respiratoryRate).toBe(15.2);
    expect(rec.cardiovascular.spo2Pct).toBe(97);
    expect(rec.cardiovascular.skinTempDeviation).toBe(0.2);
    expect(rec.recovery.recoveryScore).toBe(72);
    expect(rec.sleep.totalSleepMs).toBe(420 * 60_000);
    expect(rec.sleep.remSleepMs).toBe(100 * 60_000);
    expect(rec.sleep.deepSleepMs).toBe(120 * 60_000);
    expect(rec.sleep.lightSleepMs).toBe(180 * 60_000);
    expect(rec.sleep.sleepPerformancePct).toBe(85);
    expect(result.dateRange).toEqual({ start: '2026-03-14', end: '2026-03-14' });
  });

  it('parses workouts and converts HR zone percentages to milliseconds', async () => {
    const physioCSV = [
      'Cycle start time,Cycle end time,Cycle timezone,Recovery score %,Resting heart rate (bpm),Heart rate variability (ms),Skin temp (celsius),Blood oxygen %,Day Strain,Energy burned (cal),Max HR (bpm),Average HR (bpm),Sleep onset,Wake onset,Sleep performance %,Respiratory rate (rpm),Asleep duration (min),In bed duration (min),Light sleep duration (min),Deep (SWS) duration (min),REM duration (min),Awake duration (min),Sleep need (min),Sleep debt (min),Sleep efficiency %,Sleep consistency %',
      '2026-03-14 04:00:00,2026-03-15 04:00:00,America/New_York,72,54,68,0.2,97,12.5,2100,175,72,,,85,15.2,420,450,180,120,100,20,480,30,93,88',
    ].join('\n');

    const workoutCSV = [
      'Cycle start time,Workout start time,Workout end time,Duration (min),Activity name,Activity Strain,Energy burned (cal),Max HR (bpm),Average HR (bpm),HR Zone 1 %,HR Zone 2 %,HR Zone 3 %,HR Zone 4 %,HR Zone 5 %',
      '2026-03-14 04:00:00,2026-03-14 07:00:00,2026-03-14 08:00:00,60,Running,14.2,650,185,145,10,25,30,25,10',
    ].join('\n');

    (JSZip.loadAsync as jest.Mock).mockResolvedValue(
      makeZipMock({
        'physiological_cycles.csv': physioCSV,
        'workouts.csv': workoutCSV,
      }),
    );

    const result = await parseWhoopZip(new ArrayBuffer(0));
    expect(result.workoutCount).toBe(1);

    const workout = result.records[0].workouts[0];
    expect(workout.workoutType).toBe('Running');
    expect(workout.strainScore).toBe(14.2);
    expect(workout.durationMs).toBe(60 * 60_000);

    // Zone percentages × duration
    expect(workout.hrZones!.zone1Ms).toBe(Math.round(3600000 * 0.10));
    expect(workout.hrZones!.zone2Ms).toBe(Math.round(3600000 * 0.25));
    expect(workout.hrZones!.zone3Ms).toBe(Math.round(3600000 * 0.30));
    expect(workout.hrZones!.zone4Ms).toBe(Math.round(3600000 * 0.25));
    expect(workout.hrZones!.zone5Ms).toBe(Math.round(3600000 * 0.10));
  });

  it('distinguishes naps from primary sleep', async () => {
    const physioCSV = [
      'Cycle start time,Cycle end time,Cycle timezone,Recovery score %,Resting heart rate (bpm),Heart rate variability (ms),Skin temp (celsius),Blood oxygen %,Day Strain,Energy burned (cal),Max HR (bpm),Average HR (bpm),Sleep onset,Wake onset,Sleep performance %,Respiratory rate (rpm),Asleep duration (min),In bed duration (min),Light sleep duration (min),Deep (SWS) duration (min),REM duration (min),Awake duration (min),Sleep need (min),Sleep debt (min),Sleep efficiency %,Sleep consistency %',
      '2026-03-14 04:00:00,2026-03-15 04:00:00,America/New_York,72,54,68,0.2,97,12.5,2100,175,72,,,85,15.2,420,450,180,120,100,20,480,30,93,88',
    ].join('\n');

    const sleepCSV = [
      'Cycle start time,Sleep onset,Wake onset,Sleep performance %,Respiratory rate (rpm),Asleep duration (min),In bed duration (min),Light sleep duration (min),Deep (SWS) duration (min),REM duration (min),Awake duration (min),Sleep need (min),Sleep debt (min),Sleep efficiency %,Sleep consistency %,Nap',
      '2026-03-14 04:00:00,2026-03-13 22:30:00,2026-03-14 06:15:00,85,15.2,420,450,180,120,100,20,480,30,93,88,false',
      '2026-03-14 04:00:00,2026-03-14 13:00:00,2026-03-14 13:30:00,50,14.0,25,30,15,5,5,5,480,30,83,88,true',
    ].join('\n');

    (JSZip.loadAsync as jest.Mock).mockResolvedValue(
      makeZipMock({
        'physiological_cycles.csv': physioCSV,
        'sleeps.csv': sleepCSV,
      }),
    );

    const result = await parseWhoopZip(new ArrayBuffer(0));
    // Sleep performance should come from primary sleep, not nap
    expect(result.records[0].sleep.sleepPerformancePct).toBe(85);
    expect(result.sleepCount).toBe(2);
  });

  it('throws when physiological_cycles.csv is missing', async () => {
    (JSZip.loadAsync as jest.Mock).mockResolvedValue(
      makeZipMock({ 'workouts.csv': 'header\nrow' }),
    );

    await expect(parseWhoopZip(new ArrayBuffer(0)))
      .rejects.toThrow('ZIP does not contain physiological_cycles.csv');
  });

  it('handles empty/null metric values gracefully', async () => {
    const physioCSV = [
      'Cycle start time,Cycle end time,Cycle timezone,Recovery score %,Resting heart rate (bpm),Heart rate variability (ms),Skin temp (celsius),Blood oxygen %,Day Strain,Energy burned (cal),Max HR (bpm),Average HR (bpm),Sleep onset,Wake onset,Sleep performance %,Respiratory rate (rpm),Asleep duration (min),In bed duration (min),Light sleep duration (min),Deep (SWS) duration (min),REM duration (min),Awake duration (min),Sleep need (min),Sleep debt (min),Sleep efficiency %,Sleep consistency %',
      '2026-03-14 04:00:00,2026-03-15 04:00:00,America/New_York,--,,--,,,--,,,,,,,,,,,,,,,,',
    ].join('\n');

    (JSZip.loadAsync as jest.Mock).mockResolvedValue(
      makeZipMock({ 'physiological_cycles.csv': physioCSV }),
    );

    const result = await parseWhoopZip(new ArrayBuffer(0));
    expect(result.records).toHaveLength(1);
    const rec = result.records[0];
    expect(rec.cardiovascular.hrvRmssd).toBeNull();
    expect(rec.cardiovascular.restingHeartRate).toBeNull();
    expect(rec.recovery.recoveryScore).toBeNull();
    expect(rec.sleep.totalSleepMs).toBeNull();
  });

  it('sorts records by date', async () => {
    const physioCSV = [
      'Cycle start time,Cycle end time,Cycle timezone,Recovery score %,Resting heart rate (bpm),Heart rate variability (ms),Skin temp (celsius),Blood oxygen %,Day Strain,Energy burned (cal),Max HR (bpm),Average HR (bpm),Sleep onset,Wake onset,Sleep performance %,Respiratory rate (rpm),Asleep duration (min),In bed duration (min),Light sleep duration (min),Deep (SWS) duration (min),REM duration (min),Awake duration (min),Sleep need (min),Sleep debt (min),Sleep efficiency %,Sleep consistency %',
      '2026-03-16 04:00:00,,,72,54,68,,,,,,,,,,,,,,,,,,,,',
      '2026-03-14 04:00:00,,,65,52,55,,,,,,,,,,,,,,,,,,,,',
      '2026-03-15 04:00:00,,,80,50,75,,,,,,,,,,,,,,,,,,,,',
    ].join('\n');

    (JSZip.loadAsync as jest.Mock).mockResolvedValue(
      makeZipMock({ 'physiological_cycles.csv': physioCSV }),
    );

    const result = await parseWhoopZip(new ArrayBuffer(0));
    expect(result.records.map(r => r.date)).toEqual(['2026-03-14', '2026-03-15', '2026-03-16']);
    expect(result.dateRange).toEqual({ start: '2026-03-14', end: '2026-03-16' });
  });
});
