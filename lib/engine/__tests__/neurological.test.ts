import { scoreNeurological, isConcussionActive, NeurologicalInputs } from '../subsystems/neurological';

function makeInputs(overrides: Partial<NeurologicalInputs> = {}): NeurologicalInputs {
  return {
    cognitiveClarity: null,
    reactionTimeSharpness: null,
    coordinationBalance: null,
    headachePressure: null,
    headacheSeverity: null,
    dizzinessVertigo: null,
    numbnessTingling: null,
    numbnessTinglingLocation: null,
    lightNoiseSensitivity: null,
    recentHeadImpact: null,
    daysSinceHeadImpact: null,
    visualDisturbance: null,
    ...overrides,
  };
}

describe('scoreNeurological', () => {
  it('returns default score (65) when no inputs provided', () => {
    const result = scoreNeurological(makeInputs());
    expect(result.score).toBe(65);
    expect(result.key).toBe('neurological');
  });

  it('scores healthy inputs in 85-95 range', () => {
    const result = scoreNeurological(makeInputs({
      cognitiveClarity: 5,
      reactionTimeSharpness: 5,
      coordinationBalance: 5,
      headachePressure: false,
      dizzinessVertigo: false,
      lightNoiseSensitivity: false,
      numbnessTingling: false,
      visualDisturbance: false,
    }));
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.limitingFactors).toHaveLength(0);
  });

  it('scores impaired inputs below 40', () => {
    const result = scoreNeurological(makeInputs({
      cognitiveClarity: 1,
      reactionTimeSharpness: 1,
      coordinationBalance: 1,
      headachePressure: true,
      headacheSeverity: 4,
      dizzinessVertigo: true,
      lightNoiseSensitivity: true,
      numbnessTingling: true,
      visualDisturbance: true,
    }));
    expect(result.score).toBeLessThan(35);
    expect(result.limitingFactors.length).toBeGreaterThan(3);
  });

  it('cognitive clarity 3 → score 60 component', () => {
    const result = scoreNeurological(makeInputs({ cognitiveClarity: 3 }));
    // Only cognitive clarity provided → score = 3 * 20 = 60
    expect(result.score).toBe(60);
  });

  it('headache without severity defaults to severity 2', () => {
    const result = scoreNeurological(makeInputs({
      headachePressure: true,
      headacheSeverity: null,
    }));
    // severity 2 → 85 - 2*15 = 55
    expect(result.score).toBe(55);
  });

  it('no headache scores 90', () => {
    const result = scoreNeurological(makeInputs({ headachePressure: false }));
    expect(result.score).toBe(90);
  });

  it('dizziness scores 25, no dizziness scores 90', () => {
    const dizzy = scoreNeurological(makeInputs({ dizzinessVertigo: true }));
    expect(dizzy.score).toBe(25);
    const noDizzy = scoreNeurological(makeInputs({ dizzinessVertigo: false }));
    expect(noDizzy.score).toBe(90);
  });

  it('visual disturbance scores 15', () => {
    const result = scoreNeurological(makeInputs({ visualDisturbance: true }));
    expect(result.score).toBe(15);
  });

  it('includes limiting factors for low scores', () => {
    const result = scoreNeurological(makeInputs({
      cognitiveClarity: 1,
      dizzinessVertigo: true,
    }));
    expect(result.limitingFactors).toContain('Cognitive fog or reduced clarity');
    expect(result.limitingFactors).toContain('Dizziness or vertigo');
  });

  it('band reflects score', () => {
    const high = scoreNeurological(makeInputs({ cognitiveClarity: 5 }));
    expect(high.band).toBe('highly_recovered');
    const low = scoreNeurological(makeInputs({ cognitiveClarity: 1 }));
    expect(low.band).toBe('impaired');
  });
});

describe('concussion protocol', () => {
  it('caps score at 25 when recent head impact within 7 days', () => {
    const result = scoreNeurological(makeInputs({
      cognitiveClarity: 5,
      reactionTimeSharpness: 5,
      coordinationBalance: 5,
      headachePressure: false,
      dizzinessVertigo: false,
      lightNoiseSensitivity: false,
      numbnessTingling: false,
      visualDisturbance: false,
      recentHeadImpact: true,
      daysSinceHeadImpact: 3,
    }));
    expect(result.score).toBeLessThanOrEqual(25);
    expect(result.limitingFactors[0]).toContain('concussion protocol');
  });

  it('caps score at 25 when head impact with dizziness (red flag)', () => {
    const result = scoreNeurological(makeInputs({
      cognitiveClarity: 4,
      recentHeadImpact: true,
      daysSinceHeadImpact: 10,
      dizzinessVertigo: true,
    }));
    expect(result.score).toBeLessThanOrEqual(25);
  });

  it('caps score at 25 when head impact with visual disturbance', () => {
    const result = scoreNeurological(makeInputs({
      recentHeadImpact: true,
      daysSinceHeadImpact: 14,
      visualDisturbance: true,
    }));
    expect(result.score).toBeLessThanOrEqual(25);
  });

  it('caps score at 25 when head impact with severe headache (>=3)', () => {
    const result = scoreNeurological(makeInputs({
      recentHeadImpact: true,
      daysSinceHeadImpact: 12,
      headachePressure: true,
      headacheSeverity: 3,
    }));
    expect(result.score).toBeLessThanOrEqual(25);
  });

  it('does NOT trigger concussion if head impact > 7 days and no red flags', () => {
    const result = scoreNeurological(makeInputs({
      cognitiveClarity: 5,
      reactionTimeSharpness: 5,
      recentHeadImpact: true,
      daysSinceHeadImpact: 10,
      dizzinessVertigo: false,
      visualDisturbance: false,
      headachePressure: false,
    }));
    expect(result.score).toBeGreaterThan(25);
  });

  it('does NOT trigger if no recent head impact', () => {
    const result = scoreNeurological(makeInputs({
      cognitiveClarity: 5,
      recentHeadImpact: false,
    }));
    expect(result.score).toBeGreaterThan(25);
  });
});

describe('isConcussionActive', () => {
  it('returns false when no head impact', () => {
    expect(isConcussionActive(makeInputs({ recentHeadImpact: false }))).toBe(false);
  });

  it('returns false when head impact is null', () => {
    expect(isConcussionActive(makeInputs())).toBe(false);
  });

  it('returns true when head impact within 7 days', () => {
    expect(isConcussionActive(makeInputs({
      recentHeadImpact: true,
      daysSinceHeadImpact: 3,
    }))).toBe(true);
  });

  it('returns true when head impact with dizziness', () => {
    expect(isConcussionActive(makeInputs({
      recentHeadImpact: true,
      daysSinceHeadImpact: 14,
      dizzinessVertigo: true,
    }))).toBe(true);
  });

  it('returns false when head impact > 7 days with no red flags', () => {
    expect(isConcussionActive(makeInputs({
      recentHeadImpact: true,
      daysSinceHeadImpact: 10,
      dizzinessVertigo: false,
      visualDisturbance: false,
      headachePressure: false,
    }))).toBe(false);
  });
});
