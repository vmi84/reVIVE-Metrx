import { getRecoveryForPlan } from '../plan-aware-recovery';
import type { PlannedSession } from '../../types/training-plan';

function session(overrides: Partial<PlannedSession> = {}): PlannedSession {
  return {
    date: '2026-03-17',
    slot: 'am',
    type: 'Easy Run',
    source: 'manual',
    ...overrides,
  };
}

describe('Plan-Aware Recovery Engine', () => {
  it('returns recommendations for empty sessions', () => {
    const recs = getRecoveryForPlan([], [], null);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].strategy).toBe('standard');
  });

  it('aggressive strategy when today hard + tomorrow hard', () => {
    const today = [session({ type: 'Intervals', intensityZone: 'VO2max' })];
    const tomorrow = [session({ type: 'Tempo Run', intensityZone: 'Threshold' })];
    const recs = getRecoveryForPlan(today, tomorrow, null);
    expect(recs[0].strategy).toBe('aggressive');
    expect(recs[0].rationale).toContain('tonight');
  });

  it('preparation strategy when today easy + tomorrow hard', () => {
    const today = [session({ type: 'Easy Run' })];
    const tomorrow = [session({ type: 'Intervals', intensityZone: 'VO2max' })];
    const recs = getRecoveryForPlan(today, tomorrow, null);
    expect(recs[0].strategy).toBe('preparation');
  });

  it('inter_session strategy when flagged', () => {
    const today = [session({ slot: 'am', type: 'Intervals' })];
    const recs = getRecoveryForPlan(today, [], null, null, true);
    expect(recs[0].strategy).toBe('inter_session');
    // Inter-session should have capped durations
    expect(recs[0].durationMin).toBeLessThanOrEqual(15);
  });

  it('standard strategy for easy → easy', () => {
    const today = [session({ type: 'Easy Run' })];
    const tomorrow = [session({ type: 'Easy Swim' })];
    const recs = getRecoveryForPlan(today, tomorrow, null);
    expect(recs[0].strategy).toBe('standard');
  });

  it('returns at most 5 recommendations', () => {
    const recs = getRecoveryForPlan(
      [session({ type: 'Intervals' })],
      [session({ type: 'Tempo Run' })],
      null,
    );
    expect(recs.length).toBeLessThanOrEqual(5);
  });

  it('each recommendation has required fields', () => {
    const recs = getRecoveryForPlan([], [], null);
    for (const rec of recs) {
      expect(rec.modalityKey).toBeTruthy();
      expect(rec.label).toBeTruthy();
      expect(rec.rationale).toBeTruthy();
      expect(rec.durationMin).toBeGreaterThan(0);
      expect(typeof rec.priority).toBe('number');
    }
  });
});
