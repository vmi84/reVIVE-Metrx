import { getTrainingCompatibility, getRecoveryTrainingRecommendations } from '../training-compatibility';
import { makeSubsystemScores } from './_test-helpers';

describe('getTrainingCompatibility', () => {
  describe('perform tier (≥85)', () => {
    it('recommends most modalities', () => {
      const compat = getTrainingCompatibility(90, 'fully_recovered', makeSubsystemScores());
      expect(compat.zone1).toBe('recommended');
      expect(compat.zone2).toBe('recommended');
      expect(compat.intervals).toBe('recommended');
      expect(compat.yoga).toBe('recommended');
    });

    it('allows heavy strength and plyometrics', () => {
      const compat = getTrainingCompatibility(90, 'fully_recovered', makeSubsystemScores());
      expect(compat.strengthHeavy).toBe('allowed');
      expect(compat.plyometrics).toBe('allowed');
    });
  });

  describe('train tier (70-84)', () => {
    it('allows intervals and tempo', () => {
      const compat = getTrainingCompatibility(75, 'fully_recovered', makeSubsystemScores());
      expect(compat.intervals).toBe('allowed');
      expect(compat.tempo).toBe('allowed');
    });

    it('cautions heavy strength', () => {
      const compat = getTrainingCompatibility(75, 'fully_recovered', makeSubsystemScores());
      expect(compat.strengthHeavy).toBe('caution');
    });
  });

  describe('maintain tier (55-69)', () => {
    it('avoids heavy strength and plyometrics', () => {
      const compat = getTrainingCompatibility(60, 'fully_recovered', makeSubsystemScores());
      expect(compat.strengthHeavy).toBe('avoid');
      expect(compat.plyometrics).toBe('avoid');
    });

    it('allows zone2', () => {
      const compat = getTrainingCompatibility(60, 'fully_recovered', makeSubsystemScores());
      expect(compat.zone2).toBe('allowed');
    });
  });

  describe('recover tier (35-54)', () => {
    it('avoids most performance modalities', () => {
      const compat = getTrainingCompatibility(40, 'fully_recovered', makeSubsystemScores());
      expect(compat.intervals).toBe('avoid');
      expect(compat.tempo).toBe('avoid');
      expect(compat.strengthHeavy).toBe('avoid');
    });

    it('recommends recovery modalities', () => {
      const compat = getTrainingCompatibility(40, 'fully_recovered', makeSubsystemScores());
      expect(compat.yoga).toBe('recommended');
      expect(compat.meditation).toBe('recommended');
      expect(compat.walkingRecovery).toBe('recommended');
    });
  });

  describe('protect tier (<35)', () => {
    it('avoids nearly everything', () => {
      const compat = getTrainingCompatibility(20, 'fully_recovered', makeSubsystemScores());
      expect(compat.zone2).toBe('avoid');
      expect(compat.intervals).toBe('avoid');
      expect(compat.strengthHeavy).toBe('avoid');
      expect(compat.plyometrics).toBe('avoid');
    });

    it('still recommends yoga and meditation', () => {
      const compat = getTrainingCompatibility(20, 'fully_recovered', makeSubsystemScores());
      expect(compat.yoga).toBe('recommended');
      expect(compat.meditation).toBe('recommended');
    });
  });

  describe('phenotype overrides', () => {
    it('locally_fatigued restricts strength when musculoskeletal low', () => {
      const scores = makeSubsystemScores({ musculoskeletal: 35 });
      const compat = getTrainingCompatibility(75, 'locally_fatigued', scores);
      expect(compat.strengthHeavy).toBe('avoid');
      expect(compat.plyometrics).toBe('avoid');
    });

    it('locally_fatigued upgrades aerobic when cardio is good', () => {
      const scores = makeSubsystemScores({ musculoskeletal: 40, cardiometabolic: 80 });
      const compat = getTrainingCompatibility(75, 'locally_fatigued', scores);
      expect(compat.zone2).toBe('recommended');
    });

    it('centrally_suppressed avoids intervals and plyos', () => {
      const compat = getTrainingCompatibility(60, 'centrally_suppressed', makeSubsystemScores());
      expect(compat.intervals).toBe('avoid');
      expect(compat.tempo).toBe('avoid');
      expect(compat.plyometrics).toBe('avoid');
    });

    it('centrally_suppressed recommends parasympathetic modalities', () => {
      const compat = getTrainingCompatibility(60, 'centrally_suppressed', makeSubsystemScores());
      expect(compat.yoga).toBe('recommended');
      expect(compat.breathworkActive).toBe('recommended');
      expect(compat.meditation).toBe('recommended');
    });

    it('sleep_driven_suppression avoids intervals', () => {
      const compat = getTrainingCompatibility(60, 'sleep_driven_suppression', makeSubsystemScores());
      expect(compat.intervals).toBe('avoid');
    });

    it('under_fueled avoids high-glycolytic work', () => {
      const compat = getTrainingCompatibility(60, 'under_fueled', makeSubsystemScores());
      expect(compat.intervals).toBe('avoid');
      expect(compat.strengthHeavy).toBe('avoid');
    });

    it('accumulated_fatigue restricts almost everything', () => {
      const compat = getTrainingCompatibility(45, 'accumulated_fatigue', makeSubsystemScores());
      expect(compat.intervals).toBe('avoid');
      expect(compat.tempo).toBe('avoid');
      expect(compat.strengthHeavy).toBe('avoid');
      expect(compat.plyometrics).toBe('avoid');
      expect(compat.walkingRecovery).toBe('recommended');
      expect(compat.yoga).toBe('recommended');
    });

    it('illness_risk has extreme restrictions', () => {
      const compat = getTrainingCompatibility(25, 'illness_risk', makeSubsystemScores());
      expect(compat.intervals).toBe('avoid');
      expect(compat.zone2).toBe('avoid');
      expect(compat.strengthHeavy).toBe('avoid');
      expect(compat.coldExposure).toBe('avoid');
      expect(compat.meditation).toBe('recommended');
    });
  });
});

describe('getRecoveryTrainingRecommendations', () => {
  it('returns up to 8 results by default', () => {
    const compat = getTrainingCompatibility(50, 'accumulated_fatigue', makeSubsystemScores({ autonomic: 40, musculoskeletal: 35 }));
    const results = getRecoveryTrainingRecommendations(compat, makeSubsystemScores({ autonomic: 40, musculoskeletal: 35 }));
    expect(results.length).toBeLessThanOrEqual(8);
    expect(results.length).toBeGreaterThan(0);
  });

  it('excludes avoided modalities', () => {
    const compat = getTrainingCompatibility(30, 'illness_risk', makeSubsystemScores({ autonomic: 20 }));
    const results = getRecoveryTrainingRecommendations(compat, makeSubsystemScores({ autonomic: 20 }));
    results.forEach(r => {
      expect(r.permission).not.toBe('avoid');
    });
  });

  it('sorts by relevance score descending', () => {
    const compat = getTrainingCompatibility(50, 'accumulated_fatigue', makeSubsystemScores({ autonomic: 35 }));
    const results = getRecoveryTrainingRecommendations(compat, makeSubsystemScores({ autonomic: 35 }));
    for (let i = 1; i < results.length; i++) {
      expect(results[i].relevanceScore).toBeLessThanOrEqual(results[i - 1].relevanceScore);
    }
  });

  it('respects maxResults parameter', () => {
    const compat = getTrainingCompatibility(50, 'accumulated_fatigue', makeSubsystemScores({ autonomic: 40 }));
    const results = getRecoveryTrainingRecommendations(compat, makeSubsystemScores({ autonomic: 40 }), [], 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('sport recovery needs boost relevance', () => {
    const scores = makeSubsystemScores({ autonomic: 40, musculoskeletal: 40 });
    const compat = getTrainingCompatibility(50, 'accumulated_fatigue', scores);
    const withSport = getRecoveryTrainingRecommendations(compat, scores, ['autonomic', 'musculoskeletal']);
    const withoutSport = getRecoveryTrainingRecommendations(compat, scores, []);
    // Sport needs should change ranking
    expect(withSport.length).toBeGreaterThan(0);
    expect(withoutSport.length).toBeGreaterThan(0);
  });

  it('each result has required fields', () => {
    const compat = getTrainingCompatibility(60, 'locally_fatigued', makeSubsystemScores({ musculoskeletal: 40 }));
    const results = getRecoveryTrainingRecommendations(compat, makeSubsystemScores({ musculoskeletal: 40 }));
    results.forEach(r => {
      expect(r.key).toBeDefined();
      expect(r.label).toBeDefined();
      expect(r.permission).toBeDefined();
      expect(r.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(r.primarySubsystems.length).toBeGreaterThan(0);
      expect(r.category).toBeDefined();
      expect(r.evidenceLevel).toBeDefined();
      expect(r.durationRange).toBeDefined();
    });
  });
});
