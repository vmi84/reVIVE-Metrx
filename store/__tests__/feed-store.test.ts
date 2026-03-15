import { useFeedStore } from '../feed-store';

function makeFeedDay(date: string) {
  return {
    date,
    iaci: null,
    loadCapacity: null,
    recoveryPlan: null,
    recoveryDayPlan: null,
    metricValidations: {},
  } as any;
}

describe('useFeedStore', () => {
  beforeEach(() => {
    useFeedStore.getState().reset();
  });

  it('starts with default state', () => {
    const state = useFeedStore.getState();
    expect(state.days).toEqual([]);
    expect(state.cursor).toBeNull();
    expect(state.hasMore).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.loadingMore).toBe(false);
    expect(state.expandedCardDate).toBeNull();
  });

  it('setDays replaces days', () => {
    const days = [makeFeedDay('2024-01-15'), makeFeedDay('2024-01-14')];
    useFeedStore.getState().setDays(days);
    expect(useFeedStore.getState().days).toHaveLength(2);
  });

  it('appendDays adds to existing', () => {
    useFeedStore.getState().setDays([makeFeedDay('2024-01-15')]);
    useFeedStore.getState().appendDays([makeFeedDay('2024-01-14')]);
    expect(useFeedStore.getState().days).toHaveLength(2);
  });

  it('setCursor updates cursor', () => {
    useFeedStore.getState().setCursor('2024-01-10');
    expect(useFeedStore.getState().cursor).toBe('2024-01-10');
  });

  it('setHasMore updates flag', () => {
    useFeedStore.getState().setHasMore(false);
    expect(useFeedStore.getState().hasMore).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useFeedStore.getState().setLoading(true);
    expect(useFeedStore.getState().loading).toBe(true);
  });

  it('setExpandedCard updates expanded date', () => {
    useFeedStore.getState().setExpandedCard('2024-01-15');
    expect(useFeedStore.getState().expandedCardDate).toBe('2024-01-15');
  });

  it('updateDay modifies specific day', () => {
    useFeedStore.getState().setDays([makeFeedDay('2024-01-15'), makeFeedDay('2024-01-14')]);
    useFeedStore.getState().updateDay('2024-01-15', { iaci: { score: 80 } as any });
    const day = useFeedStore.getState().days.find(d => d.date === '2024-01-15');
    expect(day!.iaci!.score).toBe(80);
  });

  it('updateDayIACI sets IACI for date', () => {
    useFeedStore.getState().setDays([makeFeedDay('2024-01-15')]);
    const mockIACI = { score: 75, readinessTier: 'train' } as any;
    useFeedStore.getState().updateDayIACI('2024-01-15', mockIACI);
    expect(useFeedStore.getState().days[0].iaci).toEqual(mockIACI);
  });

  it('updateDayLoadCapacity sets load capacity', () => {
    useFeedStore.getState().setDays([makeFeedDay('2024-01-15')]);
    const mockLC = { stressLevel: 'low' } as any;
    useFeedStore.getState().updateDayLoadCapacity('2024-01-15', mockLC);
    expect(useFeedStore.getState().days[0].loadCapacity).toEqual(mockLC);
  });

  it('setMetricValidation updates specific metric', () => {
    useFeedStore.getState().setDays([makeFeedDay('2024-01-15')]);
    const validation = { status: 'confirmed', source: 'user' } as any;
    useFeedStore.getState().setMetricValidation('2024-01-15', 'hrv', validation);
    expect(useFeedStore.getState().days[0].metricValidations.hrv).toEqual(validation);
  });

  it('reset clears all state', () => {
    useFeedStore.getState().setDays([makeFeedDay('2024-01-15')]);
    useFeedStore.getState().setLoading(true);
    useFeedStore.getState().setExpandedCard('2024-01-15');
    useFeedStore.getState().reset();
    const state = useFeedStore.getState();
    expect(state.days).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.expandedCardDate).toBeNull();
  });
});
