import {
  getWeightsForSportProfile,
  computeSportAdjustments,
  applySportAdjustments,
  getSportRecoveryNeeds,
  getSportStressMarkers,
} from '../sport-stress';
import { makeSubsystemScores } from './_test-helpers';
import { DEFAULT_WEIGHTS, ENDURANCE_WEIGHTS, POWER_WEIGHTS } from '../../types/iaci';

describe('getWeightsForSportProfile', () => {
  it('returns default weights for null sport', () => {
    const result = getWeightsForSportProfile(null, null);
    expect(result).toEqual(DEFAULT_WEIGHTS);
  });

  it('returns endurance weights for running', () => {
    const result = getWeightsForSportProfile('running', null);
    expect(result).toEqual(ENDURANCE_WEIGHTS);
  });

  it('custom weights override sport profile', () => {
    const result = getWeightsForSportProfile('marathon', { autonomic: 0.5 });
    expect(result).not.toEqual(ENDURANCE_WEIGHTS);
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1.0, 3);
  });

  it('handles array of sport keys', () => {
    const result = getWeightsForSportProfile(['marathon', 'cycling'], null);
    expect(Object.values(result).reduce((s, v) => s + v, 0)).toBeCloseTo(1.0, 3);
  });

  it('handles unknown sport gracefully', () => {
    const result = getWeightsForSportProfile('unknown_sport', null);
    expect(result).toEqual(DEFAULT_WEIGHTS);
  });
});

describe('computeSportAdjustments', () => {
  it('returns all zeros for null sport', () => {
    const adj = computeSportAdjustments(null);
    Object.values(adj).forEach(v => expect(v).toBe(0));
  });

  it('returns all zeros for unknown sport', () => {
    const adj = computeSportAdjustments('nonexistent');
    Object.values(adj).forEach(v => expect(v).toBe(0));
  });

  it('returns negative adjustments for high-stress sports', () => {
    const adj = computeSportAdjustments('running');
    // Running has high autonomic and cardiometabolic stress
    const hasNegative = Object.values(adj).some(v => v < 0);
    expect(hasNegative).toBe(true);
  });

  it('adjustments are 0 or negative (penalties only)', () => {
    const adj = computeSportAdjustments('crossfit');
    Object.values(adj).forEach(v => {
      expect(v).toBeLessThanOrEqual(0);
    });
  });

  it('averages stress across multiple sports', () => {
    // Adding a low-stress sport should reduce or maintain penalties vs high-stress alone
    const single = computeSportAdjustments('crossfit');
    const multi = computeSportAdjustments(['crossfit', 'wellness_longevity']);
    const singleTotal = Object.values(single).reduce((s, v) => s + v, 0);
    const multiTotal = Object.values(multi).reduce((s, v) => s + v, 0);
    expect(multiTotal).toBeGreaterThanOrEqual(singleTotal);
  });
});

describe('applySportAdjustments', () => {
  it('returns adjusted scores clamped 0-100', () => {
    const scores = makeSubsystemScores({ autonomic: 5 }); // near zero
    const adjusted = applySportAdjustments(scores, 'running');
    expect(adjusted.autonomic.score).toBeGreaterThanOrEqual(0);
    expect(adjusted.autonomic.score).toBeLessThanOrEqual(100);
  });

  it('does not modify scores for null sport', () => {
    const scores = makeSubsystemScores({ autonomic: 75 });
    const adjusted = applySportAdjustments(scores, null);
    expect(adjusted.autonomic.score).toBe(75);
  });

  it('high-stress sport reduces relevant subsystem scores', () => {
    const scores = makeSubsystemScores({ autonomic: 75 });
    const adjusted = applySportAdjustments(scores, 'running');
    // Running stresses autonomic highly
    expect(adjusted.autonomic.score).toBeLessThanOrEqual(75);
  });
});

describe('getSportRecoveryNeeds', () => {
  it('returns empty for null sport', () => {
    expect(getSportRecoveryNeeds(null)).toEqual([]);
  });

  it('returns subsystem keys for known sport', () => {
    const needs = getSportRecoveryNeeds('running');
    expect(needs.length).toBeGreaterThan(0);
    needs.forEach(n => {
      expect(['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological']).toContain(n);
    });
  });

  it('unions needs across multiple sports', () => {
    const single = getSportRecoveryNeeds('running');
    const multi = getSportRecoveryNeeds(['running', 'crossfit']);
    expect(multi.length).toBeGreaterThanOrEqual(single.length);
  });
});

describe('getSportStressMarkers', () => {
  it('returns empty for null sport', () => {
    expect(getSportStressMarkers(null)).toEqual([]);
  });

  it('returns markers for known sport', () => {
    const markers = getSportStressMarkers('running');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('each marker has required fields', () => {
    const markers = getSportStressMarkers('crossfit');
    markers.forEach(m => {
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('subsystem');
    });
  });
});
