import { getWeightsForAthlete, AthleteType } from '../personalization';
import { DEFAULT_WEIGHTS, ENDURANCE_WEIGHTS, POWER_WEIGHTS, OLDER_ATHLETE_WEIGHTS, SubsystemWeights } from '../../types/iaci';

function sumWeights(w: SubsystemWeights): number {
  return Object.values(w).reduce((s, v) => s + v, 0);
}

describe('getWeightsForAthlete', () => {
  it('returns DEFAULT_WEIGHTS for null athlete type', () => {
    expect(getWeightsForAthlete(null, null)).toEqual(DEFAULT_WEIGHTS);
  });

  it('returns ENDURANCE_WEIGHTS for endurance type', () => {
    expect(getWeightsForAthlete('endurance', null)).toEqual(ENDURANCE_WEIGHTS);
  });

  it('returns POWER_WEIGHTS for power type', () => {
    expect(getWeightsForAthlete('power', null)).toEqual(POWER_WEIGHTS);
  });

  it('returns OLDER_ATHLETE_WEIGHTS for older_athlete', () => {
    expect(getWeightsForAthlete('older_athlete', null)).toEqual(OLDER_ATHLETE_WEIGHTS);
  });

  it('returns DEFAULT_WEIGHTS for hybrid type', () => {
    expect(getWeightsForAthlete('hybrid', null)).toEqual(DEFAULT_WEIGHTS);
  });

  it('custom weights override athlete type', () => {
    const custom = { autonomic: 0.5 };
    const result = getWeightsForAthlete('endurance', custom);
    expect(result).not.toEqual(ENDURANCE_WEIGHTS);
    // autonomic should be higher than default
    expect(result.autonomic).toBeGreaterThan(DEFAULT_WEIGHTS.autonomic);
  });

  it('custom weights are normalized to sum to 1.0', () => {
    const custom = { autonomic: 0.5, musculoskeletal: 0.5 };
    const result = getWeightsForAthlete(null, custom);
    expect(sumWeights(result)).toBeCloseTo(1.0, 5);
  });

  it('partial custom weights merge with defaults', () => {
    const custom = { psychological: 0.3 };
    const result = getWeightsForAthlete(null, custom);
    expect(sumWeights(result)).toBeCloseTo(1.0, 5);
    // psychological should be relatively higher
    const ratio = result.psychological / DEFAULT_WEIGHTS.psychological;
    expect(ratio).toBeGreaterThan(1);
  });
});
