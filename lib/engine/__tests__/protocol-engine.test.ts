import { prescribeProtocol } from '../protocol-engine';
import { makeSubsystemScores } from './_test-helpers';
import { Phenotype, PhenotypeKey } from '../../types/iaci';

function makePhenotype(key: PhenotypeKey): Phenotype {
  return { key, label: key, description: '', primaryLimiters: [] };
}

describe('prescribeProtocol', () => {
  it('returns protocol class A for high IACI', () => {
    const result = prescribeProtocol(90, makePhenotype('fully_recovered'), makeSubsystemScores());
    expect(result.protocolClass).toBe('A');
    expect(result.readinessTier).toBe('perform');
  });

  it('returns protocol class B for score 65-79', () => {
    const result = prescribeProtocol(72, makePhenotype('fully_recovered'), makeSubsystemScores());
    expect(result.protocolClass).toBe('B');
    expect(result.readinessTier).toBe('train');
  });

  it('returns protocol class C for score 50-64', () => {
    const result = prescribeProtocol(55, makePhenotype('locally_fatigued'), makeSubsystemScores());
    expect(result.protocolClass).toBe('C');
  });

  it('returns protocol class D for score 35-49', () => {
    const result = prescribeProtocol(40, makePhenotype('accumulated_fatigue'), makeSubsystemScores({ autonomic: 40 }));
    expect(result.protocolClass).toBe('D');
  });

  it('returns protocol class E for score <35', () => {
    const result = prescribeProtocol(20, makePhenotype('illness_risk'), makeSubsystemScores({ autonomic: 20 }));
    expect(result.protocolClass).toBe('E');
    expect(result.readinessTier).toBe('protect');
  });

  it('includes recommended modalities from phenotype map', () => {
    const result = prescribeProtocol(90, makePhenotype('fully_recovered'), makeSubsystemScores());
    expect(result.recommendedModalities.length).toBeGreaterThan(0);
  });

  it('centrally_suppressed includes breathwork modalities', () => {
    const result = prescribeProtocol(50, makePhenotype('centrally_suppressed'), makeSubsystemScores({ autonomic: 30 }));
    expect(result.recommendedModalities.some(m => m.includes('breathing'))).toBe(true);
    expect(result.explanation).toContain('Breathwork');
  });

  it('illness_risk restricts training', () => {
    const result = prescribeProtocol(25, makePhenotype('illness_risk'), makeSubsystemScores({ autonomic: 20 }));
    expect(result.explanation).toContain('No meaningful training');
  });

  it('includes training compatibility', () => {
    const result = prescribeProtocol(90, makePhenotype('fully_recovered'), makeSubsystemScores());
    expect(result.trainingCompatibility).toBeDefined();
    expect(result.trainingCompatibility.zone1).toBeDefined();
  });

  it('includes recommended training modalities', () => {
    const result = prescribeProtocol(45, makePhenotype('accumulated_fatigue'), makeSubsystemScores({ autonomic: 40, musculoskeletal: 35 }));
    expect(result.recommendedTraining).toBeDefined();
    expect(Array.isArray(result.recommendedTraining)).toBe(true);
  });
});
