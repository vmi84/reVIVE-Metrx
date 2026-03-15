import { usePhysiologyStore } from '../physiology-store';
import { CanonicalPhysiologyRecord } from '../../lib/types/canonical';

// Mock file-storage to avoid native module deps
jest.mock('../../lib/utils/file-storage', () => ({
  fileStorage: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

function makeRecord(date: string): CanonicalPhysiologyRecord {
  return {
    date,
    source: 'whoop',
    dataQuality: 'medium',
    sleep: { totalSleepMs: 28800000, sleepPerformancePct: 85, sleepConsistencyPct: 90, remSleepMs: 7200000, deepSleepMs: 5400000, lightSleepMs: 14400000, awakeDuringMs: 1800000, sleepLatencyMs: 600000, sleepOnsetTime: null, wakeTime: null, awakenings: 2, respiratoryRate: 15, spo2Pct: 97, skinTempDeviation: 0.1 },
    cardiovascular: { hrvRmssd: 65, restingHeartRate: 55, respiratoryRate: 15, spo2Pct: 97, skinTempDeviation: 0.1 },
    recovery: { recoveryScore: 85, hrvRmssd: 65, restingHeartRate: 55, spo2Pct: 97, skinTempDeviation: 0.1, respiratoryRate: 15 },
    workouts: [],
  };
}

describe('usePhysiologyStore', () => {
  beforeEach(() => {
    usePhysiologyStore.getState().clear();
  });

  it('starts with no data', () => {
    const state = usePhysiologyStore.getState();
    expect(state.hasData).toBe(false);
    expect(state.records).toEqual({});
    expect(state.lastImport).toBeNull();
  });

  it('upserts records', () => {
    usePhysiologyStore.getState().upsertRecords([
      makeRecord('2024-01-15'),
      makeRecord('2024-01-16'),
    ]);
    const state = usePhysiologyStore.getState();
    expect(state.hasData).toBe(true);
    expect(Object.keys(state.records)).toHaveLength(2);
  });

  it('overwrites existing records by date', () => {
    usePhysiologyStore.getState().upsertRecords([makeRecord('2024-01-15')]);
    const updated = makeRecord('2024-01-15');
    updated.recovery.hrvRmssd = 99;
    usePhysiologyStore.getState().upsertRecords([updated]);

    const record = usePhysiologyStore.getState().records['2024-01-15'];
    expect(record.recovery.hrvRmssd).toBe(99);
  });

  it('getRecord returns record for date', () => {
    usePhysiologyStore.getState().upsertRecords([makeRecord('2024-01-15')]);
    const record = usePhysiologyStore.getState().getRecord('2024-01-15');
    expect(record).not.toBeNull();
    expect(record!.date).toBe('2024-01-15');
  });

  it('getRecord returns null for missing date', () => {
    expect(usePhysiologyStore.getState().getRecord('2024-01-01')).toBeNull();
  });

  it('getLatest returns most recent record', () => {
    usePhysiologyStore.getState().upsertRecords([
      makeRecord('2024-01-10'),
      makeRecord('2024-01-15'),
      makeRecord('2024-01-12'),
    ]);
    const latest = usePhysiologyStore.getState().getLatest();
    expect(latest).not.toBeNull();
    expect(latest!.date).toBe('2024-01-15');
  });

  it('getLatest returns null when empty', () => {
    expect(usePhysiologyStore.getState().getLatest()).toBeNull();
  });

  it('clear resets all state', () => {
    usePhysiologyStore.getState().upsertRecords([makeRecord('2024-01-15')]);
    usePhysiologyStore.getState().clear();
    const state = usePhysiologyStore.getState();
    expect(state.hasData).toBe(false);
    expect(state.records).toEqual({});
    expect(state.lastImport).toBeNull();
  });

  it('hasData flag tracks record presence', () => {
    expect(usePhysiologyStore.getState().hasData).toBe(false);
    usePhysiologyStore.getState().upsertRecords([makeRecord('2024-01-15')]);
    expect(usePhysiologyStore.getState().hasData).toBe(true);
    usePhysiologyStore.getState().clear();
    expect(usePhysiologyStore.getState().hasData).toBe(false);
  });
});
