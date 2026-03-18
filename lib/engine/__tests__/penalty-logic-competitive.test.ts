import { computePenalties, totalPenaltyPoints } from '../penalty-logic';
import { makeSubsystemScores } from './_test-helpers';
import { PENALTIES } from '../../utils/constants';

describe('Penalty Logic — Competitive Scaling', () => {
  it('default scaling (1.0) returns full penalty points', () => {
    const scores = makeSubsystemScores({ autonomic: 35, musculoskeletal: 80, cardiometabolic: 70, sleep: 70, metabolic: 70, psychological: 70 });
    const penalties = computePenalties(scores);
    const suppression = penalties.find(p => p.name === 'systemic_suppression');
    expect(suppression).toBeDefined();
    expect(suppression!.points).toBe(PENALTIES.systemic_suppression); // 8
  });

  it('competitive scaling (0.6) reduces penalty points', () => {
    const scores = makeSubsystemScores({ autonomic: 35, musculoskeletal: 80, cardiometabolic: 70, sleep: 70, metabolic: 70, psychological: 70 });
    const penalties = computePenalties(scores, 0.6);
    const suppression = penalties.find(p => p.name === 'systemic_suppression');
    expect(suppression).toBeDefined();
    expect(suppression!.points).toBe(Math.round(PENALTIES.systemic_suppression * 0.6)); // 5
  });

  it('scaling reduces restoration_deficit penalty', () => {
    const scores = makeSubsystemScores({ autonomic: 70, musculoskeletal: 70, cardiometabolic: 70, sleep: 30, metabolic: 70, psychological: 70 });
    const full = computePenalties(scores, 1.0);
    const scaled = computePenalties(scores, 0.6);
    const fullPts = totalPenaltyPoints(full);
    const scaledPts = totalPenaltyPoints(scaled);
    expect(scaledPts).toBeLessThan(fullPts);
    expect(scaledPts).toBe(Math.round(PENALTIES.restoration_deficit * 0.6));
  });

  it('scaling applies to all triggered penalties', () => {
    // Trigger multiple penalties
    const scores = makeSubsystemScores({ autonomic: 35, musculoskeletal: 35, cardiometabolic: 35, sleep: 35, metabolic: 35, psychological: 35 });
    const full = computePenalties(scores, 1.0);
    const scaled = computePenalties(scores, 0.6);
    expect(full.length).toBeGreaterThan(1);
    expect(scaled.length).toBe(full.length); // Same number of penalties triggered
    expect(totalPenaltyPoints(scaled)).toBeLessThan(totalPenaltyPoints(full));
  });
});
