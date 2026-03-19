import { useDailyStore } from '../daily-store';

describe('useDailyStore', () => {
  beforeEach(() => {
    useDailyStore.getState().reset();
  });

  it('starts with default state', () => {
    const state = useDailyStore.getState();
    expect(state.date).toBeNull();
    expect(state.iaci).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.checkinCompleted).toBe(false);
    expect(state.deviceSynced).toBe(false);
    expect(state.deviceSource).toBeNull();
    expect(state.checkinData).toBeNull();
  });

  it('setDate updates date', () => {
    useDailyStore.getState().setDate('2024-01-15');
    expect(useDailyStore.getState().date).toBe('2024-01-15');
  });

  it('setIACI sets result and clears loading', () => {
    useDailyStore.getState().setLoading(true);
    const mockIACI = { score: 75, readinessTier: 'train' } as any;
    useDailyStore.getState().setIACI(mockIACI);
    const state = useDailyStore.getState();
    expect(state.iaci).toEqual(mockIACI);
    expect(state.loading).toBe(false);
  });

  it('setCheckinCompleted updates flag', () => {
    useDailyStore.getState().setCheckinCompleted(true);
    expect(useDailyStore.getState().checkinCompleted).toBe(true);
  });

  it('setDeviceSynced sets synced and source', () => {
    useDailyStore.getState().setDeviceSynced(true, 'whoop' as any);
    const state = useDailyStore.getState();
    expect(state.deviceSynced).toBe(true);
    expect(state.deviceSource).toBe('whoop');
  });

  it('setDeviceSynced without source sets null', () => {
    useDailyStore.getState().setDeviceSynced(true);
    expect(useDailyStore.getState().deviceSource).toBeNull();
  });

  it('setLoading updates loading state', () => {
    useDailyStore.getState().setLoading(true);
    expect(useDailyStore.getState().loading).toBe(true);
    useDailyStore.getState().setLoading(false);
    expect(useDailyStore.getState().loading).toBe(false);
  });

  it('setCheckinData stores check-in data', () => {
    const data = {
      overallEnergy: 4, sleepQuality: 4, soreness: { quads: 2 },
      stiffness: 2, heavyLegs: false, motivation: 4, stress: 2,
      mentalFatigue: 2, hydrationLiters: 2.5, electrolytes: true,
      proteinAdequate: true, lateCaffeine: false, lateAlcohol: false,
      isTraveling: false, giIssues: 1,
      readiness: 3, quickCheckInOnly: false,
    };
    useDailyStore.getState().setCheckinData(data);
    expect(useDailyStore.getState().checkinData).toEqual(data);
  });

  it('reset clears all state', () => {
    useDailyStore.getState().setDate('2024-01-15');
    useDailyStore.getState().setCheckinCompleted(true);
    useDailyStore.getState().setDeviceSynced(true, 'whoop' as any);
    useDailyStore.getState().reset();
    const state = useDailyStore.getState();
    expect(state.date).toBeNull();
    expect(state.checkinCompleted).toBe(false);
    expect(state.deviceSynced).toBe(false);
  });
});
