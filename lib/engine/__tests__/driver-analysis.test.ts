import { identifyDrivers } from '../driver-analysis';
import { makeSubsystemScores } from './_test-helpers';
import { PenaltyResult, Phenotype } from '../../types/iaci';

const defaultPhenotype: Phenotype = {
  key: 'fully_recovered',
  label: 'Fully Recovered',
  description: '',
  primaryLimiters: [],
};

describe('identifyDrivers', () => {
  it('identifies sleep as primary driver when sleep is lowest', () => {
    const scores = makeSubsystemScores({ sleep: 30, autonomic: 80, musculoskeletal: 75 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('sleep');
    expect(result.driverScore).toBe(70); // 100 - 30
    expect(result.driverExplanation).toContain('Sleep');
    expect(result.actionableInsight).toContain('8+ hours');
  });

  it('identifies stress when autonomic is lowest', () => {
    const scores = makeSubsystemScores({ autonomic: 25, sleep: 70, musculoskeletal: 80 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('stress');
  });

  it('identifies stress when psychological is lowest', () => {
    const scores = makeSubsystemScores({ psychological: 20, autonomic: 70, sleep: 70 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('stress');
  });

  it('identifies activity_overload when musculoskeletal is lowest', () => {
    const scores = makeSubsystemScores({ musculoskeletal: 28, autonomic: 80, sleep: 70 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('activity_overload');
  });

  it('identifies neurological driver', () => {
    const scores = makeSubsystemScores({ neurological: 22, autonomic: 80, sleep: 70 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('neurological');
    expect(result.actionableInsight).toContain('Cognitive rest');
  });

  it('identifies metabolic driver', () => {
    const scores = makeSubsystemScores({ metabolic: 25, autonomic: 80, sleep: 70 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('metabolic');
  });

  it('returns multi_system when 3+ subsystems below 50', () => {
    const scores = makeSubsystemScores({
      autonomic: 40, sleep: 35, musculoskeletal: 45, metabolic: 70,
    });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('multi_system');
  });

  it('returns illness when illness penalty active', () => {
    const penalties: PenaltyResult[] = [
      { name: 'illness_caution', points: 10, reason: 'Illness reported', triggeredBy: ['autonomic'] },
    ];
    const scores = makeSubsystemScores({ autonomic: 80, sleep: 80 });
    const result = identifyDrivers(scores, penalties, defaultPhenotype);
    expect(result.primaryDriver).toBe('illness');
    expect(result.driverScore).toBe(90);
  });

  it('identifies secondary driver when different category and low', () => {
    const scores = makeSubsystemScores({ sleep: 30, musculoskeletal: 45, autonomic: 80 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.primaryDriver).toBe('sleep');
    expect(result.secondaryDriver).toBe('activity_overload');
  });

  it('no secondary driver when next lowest is same category or above 55', () => {
    const scores = makeSubsystemScores({ sleep: 30, autonomic: 80, musculoskeletal: 80 });
    const result = identifyDrivers(scores, [], defaultPhenotype);
    expect(result.secondaryDriver).toBeNull();
  });
});
