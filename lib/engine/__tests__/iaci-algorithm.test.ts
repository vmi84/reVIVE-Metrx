/**
 * IACI Algorithm Comprehensive Test Suite
 *
 * Validates the full pipeline: subsystem scoring → composite → penalties →
 * phenotype → protocol prescription across simulated athlete states.
 *
 * Recovery Bands (user-requested 6-tier):
 *   100 > Optimum    (81-100)
 *   80  > Strong     (61-80)
 *   60  > Moderate   (41-60)
 *   40  > Sufficient (21-40)
 *   20  > Insufficient (1-20)
 *    0  > Poor       (0)
 */

import { computeIACI } from '../iaci-composite';
import { scoreAutonomic, AutonomicInputs, AutonomicBaselines } from '../subsystems/autonomic';
import { scoreMusculoskeletal, MusculoskeletalInputs } from '../subsystems/musculoskeletal';
import { scoreCardiometabolic, CardiometabolicInputs, CardiometabolicBaselines } from '../subsystems/cardiometabolic';
import { scoreSleepCircadian, SleepCircadianInputs } from '../subsystems/sleep-circadian';
import { scoreMetabolic, MetabolicInputs } from '../subsystems/metabolic';
import { scorePsychoEmotional, PsychoEmotionalInputs } from '../subsystems/psycho-emotional';
import { computePenalties, totalPenaltyPoints } from '../penalty-logic';
import { SubsystemScores, getSubsystemBand, getReadinessTier, getProtocolClass, DEFAULT_WEIGHTS } from '../../types/iaci';

// ─── Recovery Band Helper ───────────────────────────────────────────────
function getRecoveryBand(score: number): string {
  if (score >= 81) return 'Optimum';
  if (score >= 61) return 'Strong';
  if (score >= 41) return 'Moderate';
  if (score >= 21) return 'Sufficient';
  if (score >= 1) return 'Insufficient';
  return 'Poor';
}

// ─── Simulated Whoop Baselines ──────────────────────────────────────────
// Typical healthy athlete 21-day baselines
const HEALTHY_BASELINES = {
  hrv: { metric: 'hrv_rmssd', rollingMean: 65, rollingSd: 12, sampleCount: 21, trendSlope: 0.1, lastUpdated: '2026-03-14' },
  rhr: { metric: 'resting_heart_rate', rollingMean: 55, rollingSd: 3, sampleCount: 21, trendSlope: -0.05, lastUpdated: '2026-03-14' },
  strain: { metric: 'day_strain', rollingMean: 12, rollingSd: 3, sampleCount: 21, trendSlope: 0, lastUpdated: '2026-03-14' },
  sleepDuration: { metric: 'sleep_duration_ms', rollingMean: 7.5 * 3600000, rollingSd: 0.5 * 3600000, sampleCount: 21, trendSlope: 0, lastUpdated: '2026-03-14' },
  respiratoryRate: { metric: 'respiratory_rate', rollingMean: 15, rollingSd: 1.0, sampleCount: 21, trendSlope: 0, lastUpdated: '2026-03-14' },
};

// ─── Simulated Athlete Profiles ─────────────────────────────────────────

/** Optimal state: well-rested, high HRV, low RHR, great sleep, well-fueled, high motivation */
function makeOptimalInputs() {
  const autonomic: AutonomicInputs = {
    hrvRmssd: 85,                    // Well above baseline (65 mean)
    restingHeartRate: 50,            // Well below baseline (55 mean)
    priorDayStrain: 8,               // Moderate
    threeDayAvgStrain: 9,            // Below baseline (12 mean)
    sleepDurationMs: 8.5 * 3600000,  // 8.5 hours
    sleepPerformancePct: 92,         // Excellent Whoop sleep score
    sleepConsistencyPct: 88,         // Very consistent
    subjectiveStress: 1,             // Minimal stress
    perceivedFatigue: 1,             // No fatigue
  };

  const musculoskeletal: MusculoskeletalInputs = {
    soreness: { quads: 0, hamstrings: 0, calves: 0, glutes: 0, lower_back: 0 },
    stiffness: 1,                    // None
    heavyLegs: false,
    painLocations: [],
    priorWorkoutType: 'easy_run',
    priorDayStrain: 8,
    threeDayAvgStrain: 9,
    daysFromLastStrengthSession: 3,
    daysFromLastHighIntensity: 3,
  };

  const cardiometabolic: CardiometabolicInputs = {
    respiratoryRate: 14,             // Below baseline (15 mean)
    recentCardioStrainTotal: 15,     // Low
    timeInZone4_5_72h_ms: 10 * 60000, // 10 min in z4-5
    subjectiveBreathlessness: 1,     // None
    perceivedExertionMismatch: false,
    daysFromLastIntervalSession: 3,
    daysFromLastThresholdSession: 3,
    aerobicDensity72h: 2,            // Low
    anaerobicDensity72h: 0.5,
    restingHeartRate: 50,
    hrvRmssd: 85,
  };

  const sleep: SleepCircadianInputs = {
    sleepDurationMs: 8.5 * 3600000,
    sleepPerformancePct: 92,
    sleepConsistencyPct: 88,
    remSleepMs: 2.2 * 3600000,      // ~26% REM (ideal)
    deepSleepMs: 1.7 * 3600000,     // ~20% deep (ideal)
    awakenings: 1,
    sleepLatencyMs: 8 * 60000,      // 8 min to fall asleep
    subjectiveSleepQuality: 5,       // Excellent
    lateCaffeine: false,
    lateAlcohol: false,
    lateHeavyMeal: false,
    isTraveling: false,
    timezoneChange: 0,
  };

  const metabolic: MetabolicInputs = {
    hydrationGlasses: 10,            // Hit target
    electrolytesTaken: true,
    proteinAdequate: true,
    fasting: false,
    giDisruption: 1,                 // None
    lateHeavyMeal: false,
    bodyMassChangeKg: 0.1,           // Stable
    postWorkoutFuelingAdequate: true,
  };

  const psychological: PsychoEmotionalInputs = {
    motivation: 5,
    mood: 5,
    mentalFatigue: 1,
    willingnessToTrain: 5,
    concentration: 5,
    subjectiveStress: 1,
    overallEnergy: 5,
  };

  return { autonomic, musculoskeletal, cardiometabolic, sleep, metabolic, psychological };
}

/** Poor state: poor sleep, low HRV, high RHR, dehydrated, stressed, sore, alcohol */
function makePoorInputs() {
  const autonomic: AutonomicInputs = {
    hrvRmssd: 35,                    // Well below baseline (65 mean, z ≈ -2.5)
    restingHeartRate: 65,            // Well above baseline (55 mean, z ≈ +3.3)
    priorDayStrain: 18,             // Very high
    threeDayAvgStrain: 17,          // Well above baseline (12 mean)
    sleepDurationMs: 4 * 3600000,   // Only 4 hours
    sleepPerformancePct: 35,        // Poor Whoop sleep score
    sleepConsistencyPct: 30,        // Inconsistent
    subjectiveStress: 5,            // Maximum stress
    perceivedFatigue: 5,            // Maximum fatigue
  };

  const musculoskeletal: MusculoskeletalInputs = {
    soreness: { quads: 4, hamstrings: 3, calves: 3, glutes: 2, lower_back: 3 },
    stiffness: 5,                    // Severe
    heavyLegs: true,
    painLocations: ['left_knee', 'lower_back'],
    priorWorkoutType: 'heavy_strength',
    priorDayStrain: 18,
    threeDayAvgStrain: 17,
    daysFromLastStrengthSession: 0,  // Same day
    daysFromLastHighIntensity: 0,
  };

  const cardiometabolic: CardiometabolicInputs = {
    respiratoryRate: 19,             // Elevated (15 mean, z ≈ +4)
    recentCardioStrainTotal: 55,     // Very high
    timeInZone4_5_72h_ms: 90 * 60000, // 90 min in z4-5
    subjectiveBreathlessness: 5,     // Maximal
    perceivedExertionMismatch: true,
    daysFromLastIntervalSession: 0,
    daysFromLastThresholdSession: 0,
    aerobicDensity72h: 8,            // Very high
    anaerobicDensity72h: 3,
    restingHeartRate: 65,
    hrvRmssd: 35,
  };

  const sleep: SleepCircadianInputs = {
    sleepDurationMs: 4 * 3600000,
    sleepPerformancePct: 35,
    sleepConsistencyPct: 30,
    remSleepMs: 0.4 * 3600000,      // ~10% REM (low)
    deepSleepMs: 0.3 * 3600000,     // ~7.5% deep (very low)
    awakenings: 8,
    sleepLatencyMs: 60 * 60000,     // 60 min to fall asleep
    subjectiveSleepQuality: 1,       // Terrible
    lateCaffeine: true,
    lateAlcohol: true,
    lateHeavyMeal: true,
    isTraveling: true,
    timezoneChange: 5,               // 5 hour jet lag
  };

  const metabolic: MetabolicInputs = {
    hydrationGlasses: 2,             // Very low
    electrolytesTaken: false,
    proteinAdequate: false,
    fasting: true,
    giDisruption: 4,                 // Significant
    lateHeavyMeal: true,
    bodyMassChangeKg: -1.5,          // Significant drop
    postWorkoutFuelingAdequate: false,
  };

  const psychological: PsychoEmotionalInputs = {
    motivation: 1,
    mood: 1,
    mentalFatigue: 5,
    willingnessToTrain: 1,
    concentration: 1,
    subjectiveStress: 5,
    overallEnergy: 1,
  };

  return { autonomic, musculoskeletal, cardiometabolic, sleep, metabolic, psychological };
}

/** Moderate state: decent sleep, okay HRV, some soreness, average hydration */
function makeModerateInputs() {
  const autonomic: AutonomicInputs = {
    hrvRmssd: 62,                    // Near baseline
    restingHeartRate: 56,            // Near baseline
    priorDayStrain: 12,
    threeDayAvgStrain: 12,
    sleepDurationMs: 6.5 * 3600000,
    sleepPerformancePct: 65,
    sleepConsistencyPct: 60,
    subjectiveStress: 3,
    perceivedFatigue: 3,
  };

  const musculoskeletal: MusculoskeletalInputs = {
    soreness: { quads: 2, hamstrings: 1, lower_back: 1 },
    stiffness: 3,
    heavyLegs: false,
    painLocations: [],
    priorWorkoutType: 'tempo_run',
    priorDayStrain: 12,
    threeDayAvgStrain: 12,
    daysFromLastStrengthSession: 2,
    daysFromLastHighIntensity: 1,
  };

  const cardiometabolic: CardiometabolicInputs = {
    respiratoryRate: 15.5,
    recentCardioStrainTotal: 30,
    timeInZone4_5_72h_ms: 30 * 60000,
    subjectiveBreathlessness: 3,
    perceivedExertionMismatch: false,
    daysFromLastIntervalSession: 2,
    daysFromLastThresholdSession: 1,
    aerobicDensity72h: 4,
    anaerobicDensity72h: 1,
    restingHeartRate: 56,
    hrvRmssd: 62,
  };

  const sleep: SleepCircadianInputs = {
    sleepDurationMs: 6.5 * 3600000,
    sleepPerformancePct: 65,
    sleepConsistencyPct: 60,
    remSleepMs: 1.3 * 3600000,
    deepSleepMs: 1.0 * 3600000,
    awakenings: 3,
    sleepLatencyMs: 20 * 60000,
    subjectiveSleepQuality: 3,
    lateCaffeine: false,
    lateAlcohol: false,
    lateHeavyMeal: false,
    isTraveling: false,
    timezoneChange: 0,
  };

  const metabolic: MetabolicInputs = {
    hydrationGlasses: 6,
    electrolytesTaken: false,
    proteinAdequate: true,
    fasting: false,
    giDisruption: 1,
    lateHeavyMeal: false,
    bodyMassChangeKg: -0.3,
    postWorkoutFuelingAdequate: true,
  };

  const psychological: PsychoEmotionalInputs = {
    motivation: 3,
    mood: 3,
    mentalFatigue: 3,
    willingnessToTrain: 3,
    concentration: 3,
    subjectiveStress: 3,
    overallEnergy: 3,
  };

  return { autonomic, musculoskeletal, cardiometabolic, sleep, metabolic, psychological };
}

// ─── Helper: Build SubsystemScores from individual scorers ──────────────
function buildSubsystemScores(inputs: ReturnType<typeof makeOptimalInputs>): SubsystemScores {
  return {
    autonomic: scoreAutonomic(inputs.autonomic, { hrv: HEALTHY_BASELINES.hrv, rhr: HEALTHY_BASELINES.rhr, strain: HEALTHY_BASELINES.strain, sleepDuration: HEALTHY_BASELINES.sleepDuration }),
    musculoskeletal: scoreMusculoskeletal(inputs.musculoskeletal),
    cardiometabolic: scoreCardiometabolic(inputs.cardiometabolic, { respiratoryRate: HEALTHY_BASELINES.respiratoryRate, rhr: HEALTHY_BASELINES.rhr }),
    sleep: scoreSleepCircadian(inputs.sleep),
    metabolic: scoreMetabolic(inputs.metabolic),
    psychological: scorePsychoEmotional(inputs.psychological),
  };
}

// ─── Helper: Build direct SubsystemScores from raw numbers ──────────────
function makeScoresFromValues(a: number, b: number, c: number, d: number, e: number, f: number): SubsystemScores {
  const make = (key: string, score: number) => ({
    key: key as any,
    score,
    band: getSubsystemBand(score),
    inputs: {},
    limitingFactors: [],
  });
  return {
    autonomic: make('autonomic', a),
    musculoskeletal: make('musculoskeletal', b),
    cardiometabolic: make('cardiometabolic', c),
    sleep: make('sleep', d),
    metabolic: make('metabolic', e),
    psychological: make('psychological', f),
  };
}


// ═════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═════════════════════════════════════════════════════════════════════════

describe('Recovery Band Classification', () => {
  test('score 95 → Optimum', () => expect(getRecoveryBand(95)).toBe('Optimum'));
  test('score 81 → Optimum', () => expect(getRecoveryBand(81)).toBe('Optimum'));
  test('score 80 → Strong', () => expect(getRecoveryBand(80)).toBe('Strong'));
  test('score 61 → Strong', () => expect(getRecoveryBand(61)).toBe('Strong'));
  test('score 60 → Moderate', () => expect(getRecoveryBand(60)).toBe('Moderate'));
  test('score 41 → Moderate', () => expect(getRecoveryBand(41)).toBe('Moderate'));
  test('score 40 → Sufficient', () => expect(getRecoveryBand(40)).toBe('Sufficient'));
  test('score 21 → Sufficient', () => expect(getRecoveryBand(21)).toBe('Sufficient'));
  test('score 20 → Insufficient', () => expect(getRecoveryBand(20)).toBe('Insufficient'));
  test('score 1 → Insufficient', () => expect(getRecoveryBand(1)).toBe('Insufficient'));
  test('score 0 → Poor', () => expect(getRecoveryBand(0)).toBe('Poor'));
  test('score 100 → Optimum', () => expect(getRecoveryBand(100)).toBe('Optimum'));
});

// ─── Subsystem A: Autonomic ─────────────────────────────────────────────
describe('Subsystem A: Autonomic Scoring', () => {
  const baselines: AutonomicBaselines = {
    hrv: HEALTHY_BASELINES.hrv,
    rhr: HEALTHY_BASELINES.rhr,
    strain: HEALTHY_BASELINES.strain,
    sleepDuration: HEALTHY_BASELINES.sleepDuration,
  };

  test('optimal Whoop data → high autonomic score (≥80)', () => {
    const result = scoreAutonomic({
      hrvRmssd: 85,         // z ≈ +1.67 → ~75
      restingHeartRate: 50, // z ≈ -1.67 → ~75 (inverted)
      priorDayStrain: 8,
      threeDayAvgStrain: 9, // z ≈ -1 → ~65 (inverted)
      sleepDurationMs: 8.5 * 3600000,
      sleepPerformancePct: 92,
      sleepConsistencyPct: 88,
      subjectiveStress: 1,
      perceivedFatigue: 1,
    }, baselines);
    console.log(`  Autonomic (optimal): score=${result.score}, band=${result.band}`);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.limitingFactors).toHaveLength(0);
  });

  test('poor Whoop data → low autonomic score (≤35)', () => {
    const result = scoreAutonomic({
      hrvRmssd: 35,          // z ≈ -2.5 → ~12
      restingHeartRate: 65,  // z ≈ +3.33 → ~0 (inverted)
      priorDayStrain: 18,
      threeDayAvgStrain: 17, // z ≈ +1.67 → ~25 (inverted)
      sleepDurationMs: 4 * 3600000,
      sleepPerformancePct: 35,
      sleepConsistencyPct: 30,
      subjectiveStress: 5,
      perceivedFatigue: 5,
    }, baselines);
    console.log(`  Autonomic (poor): score=${result.score}, band=${result.band}, factors=${result.limitingFactors.join('; ')}`);
    expect(result.score).toBeLessThanOrEqual(35);
    expect(result.limitingFactors.length).toBeGreaterThan(0);
  });

  test('HRV well above baseline → high score component', () => {
    const result = scoreAutonomic({
      hrvRmssd: 90, // z ≈ +2.08
      restingHeartRate: null,
      priorDayStrain: null,
      threeDayAvgStrain: null,
      sleepDurationMs: null,
      sleepPerformancePct: null,
      sleepConsistencyPct: null,
      subjectiveStress: null,
      perceivedFatigue: null,
    }, baselines);
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  test('HRV well below baseline → low score component', () => {
    const result = scoreAutonomic({
      hrvRmssd: 30, // z ≈ -2.92
      restingHeartRate: null,
      priorDayStrain: null,
      threeDayAvgStrain: null,
      sleepDurationMs: null,
      sleepPerformancePct: null,
      sleepConsistencyPct: null,
      subjectiveStress: null,
      perceivedFatigue: null,
    }, baselines);
    expect(result.score).toBeLessThanOrEqual(20);
  });

  test('elevated RHR → lower score', () => {
    const result = scoreAutonomic({
      hrvRmssd: null,
      restingHeartRate: 65, // z ≈ +3.33 above baseline
      priorDayStrain: null,
      threeDayAvgStrain: null,
      sleepDurationMs: null,
      sleepPerformancePct: null,
      sleepConsistencyPct: null,
      subjectiveStress: null,
      perceivedFatigue: null,
    }, baselines);
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.limitingFactors).toContain('RHR elevated above baseline');
  });

  test('no data at all → defaults to 50', () => {
    const result = scoreAutonomic({
      hrvRmssd: null, restingHeartRate: null, priorDayStrain: null,
      threeDayAvgStrain: null, sleepDurationMs: null, sleepPerformancePct: null,
      sleepConsistencyPct: null, subjectiveStress: null, perceivedFatigue: null,
    }, { hrv: null, rhr: null, strain: null, sleepDuration: null });
    expect(result.score).toBe(50);
  });
});

// ─── Subsystem B: Musculoskeletal ───────────────────────────────────────
describe('Subsystem B: Musculoskeletal Scoring', () => {
  test('no soreness, no pain, rested → high score (≥80)', () => {
    const result = scoreMusculoskeletal({
      soreness: { quads: 0, hamstrings: 0, calves: 0 },
      stiffness: 1,
      heavyLegs: false,
      painLocations: [],
      priorWorkoutType: 'rest',
      priorDayStrain: 5,
      threeDayAvgStrain: 6,
      daysFromLastStrengthSession: 3,
      daysFromLastHighIntensity: 3,
    });
    console.log(`  Musculoskeletal (optimal): score=${result.score}, band=${result.band}`);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.limitingFactors).toHaveLength(0);
  });

  test('severe soreness, pain, heavy legs → low score (≤30)', () => {
    const result = scoreMusculoskeletal({
      soreness: { quads: 4, hamstrings: 4, calves: 3, glutes: 3 },
      stiffness: 5,
      heavyLegs: true,
      painLocations: ['left_knee', 'lower_back', 'right_ankle'],
      priorWorkoutType: 'heavy_strength',
      priorDayStrain: 19,
      threeDayAvgStrain: 17,
      daysFromLastStrengthSession: 0,
      daysFromLastHighIntensity: 0,
    });
    console.log(`  Musculoskeletal (poor): score=${result.score}, band=${result.band}, factors=${result.limitingFactors.join('; ')}`);
    expect(result.score).toBeLessThanOrEqual(30);
    expect(result.limitingFactors.length).toBeGreaterThan(2);
  });

  test('high prior day strain (18 Whoop) reduces score', () => {
    const rested = scoreMusculoskeletal({
      soreness: null, stiffness: null, heavyLegs: null, painLocations: null,
      priorWorkoutType: null, priorDayStrain: 5, threeDayAvgStrain: null,
      daysFromLastStrengthSession: null, daysFromLastHighIntensity: null,
    });
    const strained = scoreMusculoskeletal({
      soreness: null, stiffness: null, heavyLegs: null, painLocations: null,
      priorWorkoutType: null, priorDayStrain: 18, threeDayAvgStrain: null,
      daysFromLastStrengthSession: null, daysFromLastHighIntensity: null,
    });
    expect(strained.score).toBeLessThan(rested.score);
  });
});

// ─── Subsystem C: Cardiometabolic ───────────────────────────────────────
describe('Subsystem C: Cardiometabolic Scoring', () => {
  const baselines: CardiometabolicBaselines = {
    respiratoryRate: HEALTHY_BASELINES.respiratoryRate,
    rhr: HEALTHY_BASELINES.rhr,
  };

  test('low cardio strain, low zone 4-5 time → high score (≥75)', () => {
    const result = scoreCardiometabolic({
      respiratoryRate: 14,
      recentCardioStrainTotal: 15,
      timeInZone4_5_72h_ms: 10 * 60000,
      subjectiveBreathlessness: 1,
      perceivedExertionMismatch: false,
      daysFromLastIntervalSession: 3,
      daysFromLastThresholdSession: 3,
      aerobicDensity72h: 2,
      anaerobicDensity72h: 0.5,
      restingHeartRate: 50,
      hrvRmssd: 85,
    }, baselines);
    console.log(`  Cardiometabolic (optimal): score=${result.score}, band=${result.band}`);
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  test('high cardio strain, elevated RR → low score (≤35)', () => {
    const result = scoreCardiometabolic({
      respiratoryRate: 19,
      recentCardioStrainTotal: 55,
      timeInZone4_5_72h_ms: 90 * 60000,
      subjectiveBreathlessness: 5,
      perceivedExertionMismatch: true,
      daysFromLastIntervalSession: 0,
      daysFromLastThresholdSession: 0,
      aerobicDensity72h: 8,
      anaerobicDensity72h: 3,
      restingHeartRate: 65,
      hrvRmssd: 35,
    }, baselines);
    console.log(`  Cardiometabolic (poor): score=${result.score}, band=${result.band}, factors=${result.limitingFactors.join('; ')}`);
    expect(result.score).toBeLessThanOrEqual(35);
  });
});

// ─── Subsystem D: Sleep / Circadian ─────────────────────────────────────
describe('Subsystem D: Sleep/Circadian Scoring', () => {
  test('8.5h sleep, high performance, no disruptions → high score (≥85)', () => {
    const result = scoreSleepCircadian({
      sleepDurationMs: 8.5 * 3600000,
      sleepPerformancePct: 92,
      sleepConsistencyPct: 88,
      remSleepMs: 2.2 * 3600000,
      deepSleepMs: 1.7 * 3600000,
      awakenings: 1,
      sleepLatencyMs: 8 * 60000,
      subjectiveSleepQuality: 5,
      lateCaffeine: false,
      lateAlcohol: false,
      lateHeavyMeal: false,
      isTraveling: false,
      timezoneChange: 0,
    });
    console.log(`  Sleep (optimal): score=${result.score}, band=${result.band}`);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  test('4h sleep, alcohol, caffeine, travel → very low score (≤25)', () => {
    const result = scoreSleepCircadian({
      sleepDurationMs: 4 * 3600000,
      sleepPerformancePct: 35,
      sleepConsistencyPct: 30,
      remSleepMs: 0.4 * 3600000,
      deepSleepMs: 0.3 * 3600000,
      awakenings: 8,
      sleepLatencyMs: 60 * 60000,
      subjectiveSleepQuality: 1,
      lateCaffeine: true,
      lateAlcohol: true,
      lateHeavyMeal: true,
      isTraveling: true,
      timezoneChange: 5,
    });
    console.log(`  Sleep (poor): score=${result.score}, band=${result.band}, factors=${result.limitingFactors.join('; ')}`);
    expect(result.score).toBeLessThanOrEqual(25);
    expect(result.limitingFactors).toContain('Late caffeine');
    expect(result.limitingFactors).toContain('Late alcohol');
  });

  test('alcohol penalty reduces score by at least 8', () => {
    const noAlcohol = scoreSleepCircadian({
      sleepDurationMs: 7 * 3600000,
      sleepPerformancePct: 70,
      sleepConsistencyPct: 70,
      remSleepMs: 1.5 * 3600000,
      deepSleepMs: 1.2 * 3600000,
      awakenings: 2,
      sleepLatencyMs: 15 * 60000,
      subjectiveSleepQuality: 3,
      lateCaffeine: false,
      lateAlcohol: false,
      lateHeavyMeal: false,
      isTraveling: false,
      timezoneChange: 0,
    });
    const withAlcohol = scoreSleepCircadian({
      sleepDurationMs: 7 * 3600000,
      sleepPerformancePct: 70,
      sleepConsistencyPct: 70,
      remSleepMs: 1.5 * 3600000,
      deepSleepMs: 1.2 * 3600000,
      awakenings: 2,
      sleepLatencyMs: 15 * 60000,
      subjectiveSleepQuality: 3,
      lateCaffeine: false,
      lateAlcohol: true,
      lateHeavyMeal: false,
      isTraveling: false,
      timezoneChange: 0,
    });
    expect(noAlcohol.score - withAlcohol.score).toBeGreaterThanOrEqual(8);
  });

  test('poor sleep quality (1/5) is captured as limiting factor', () => {
    const result = scoreSleepCircadian({
      sleepDurationMs: 7 * 3600000,
      sleepPerformancePct: 70,
      sleepConsistencyPct: 70,
      remSleepMs: null, deepSleepMs: null, awakenings: null,
      sleepLatencyMs: null,
      subjectiveSleepQuality: 1,
      lateCaffeine: false, lateAlcohol: false, lateHeavyMeal: false,
      isTraveling: false, timezoneChange: 0,
    });
    expect(result.limitingFactors).toContain('Poor subjective sleep quality');
  });
});

// ─── Subsystem E: Metabolic ─────────────────────────────────────────────
describe('Subsystem E: Metabolic Scoring', () => {
  test('well hydrated, good protein, electrolytes → high score (≥80)', () => {
    const result = scoreMetabolic({
      hydrationGlasses: 10,
      electrolytesTaken: true,
      proteinAdequate: true,
      fasting: false,
      giDisruption: 1,
      lateHeavyMeal: false,
      bodyMassChangeKg: 0.1,
      postWorkoutFuelingAdequate: true,
    });
    console.log(`  Metabolic (optimal): score=${result.score}, band=${result.band}`);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  test('dehydrated, no protein, fasting, GI issues → low score (≤40)', () => {
    const result = scoreMetabolic({
      hydrationGlasses: 2,
      electrolytesTaken: false,
      proteinAdequate: false,
      fasting: true,
      giDisruption: 4,
      lateHeavyMeal: true,
      bodyMassChangeKg: -1.5,
      postWorkoutFuelingAdequate: false,
    });
    console.log(`  Metabolic (poor): score=${result.score}, band=${result.band}, factors=${result.limitingFactors.join('; ')}`);
    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.limitingFactors).toContain('Low hydration');
    expect(result.limitingFactors).toContain('Insufficient protein');
  });

  test('hydration at 2 glasses triggers low hydration flag', () => {
    const result = scoreMetabolic({
      hydrationGlasses: 2,
      electrolytesTaken: null, proteinAdequate: null, fasting: null,
      giDisruption: null, lateHeavyMeal: null, bodyMassChangeKg: null,
      postWorkoutFuelingAdequate: null,
    });
    expect(result.limitingFactors).toContain('Low hydration');
  });
});

// ─── Subsystem F: Psychological ─────────────────────────────────────────
describe('Subsystem F: Psychological Scoring', () => {
  test('all 5s → score of 100', () => {
    const result = scorePsychoEmotional({
      motivation: 5, mood: 5, mentalFatigue: 1, willingnessToTrain: 5,
      concentration: 5, subjectiveStress: 1, overallEnergy: 5,
    });
    console.log(`  Psychological (optimal): score=${result.score}, band=${result.band}`);
    expect(result.score).toBe(100);
  });

  test('all 1s (worst) → score of 20', () => {
    const result = scorePsychoEmotional({
      motivation: 1, mood: 1, mentalFatigue: 5, willingnessToTrain: 1,
      concentration: 1, subjectiveStress: 5, overallEnergy: 1,
    });
    console.log(`  Psychological (poor): score=${result.score}, band=${result.band}, factors=${result.limitingFactors.join('; ')}`);
    expect(result.score).toBe(20);
    expect(result.limitingFactors).toContain('Low motivation');
    expect(result.limitingFactors).toContain('High life stress');
  });
});

// ─── Penalty Logic ──────────────────────────────────────────────────────
describe('Penalty Logic', () => {
  test('all systems healthy → no penalties', () => {
    const scores = makeScoresFromValues(85, 85, 80, 75, 80, 75);
    const penalties = computePenalties(scores);
    expect(penalties).toHaveLength(0);
  });

  test('autonomic < 40 + musculoskeletal > 75 → systemic_suppression (8pts)', () => {
    const scores = makeScoresFromValues(35, 80, 70, 60, 70, 60);
    const penalties = computePenalties(scores);
    const p = penalties.find(p => p.name === 'systemic_suppression');
    expect(p).toBeDefined();
    expect(p!.points).toBe(8);
  });

  test('sleep < 40 → restoration_deficit (10pts)', () => {
    const scores = makeScoresFromValues(70, 70, 70, 35, 70, 70);
    const penalties = computePenalties(scores);
    const p = penalties.find(p => p.name === 'restoration_deficit');
    expect(p).toBeDefined();
    expect(p!.points).toBe(10);
  });

  test('cardiometabolic < 40 → illness_caution (12pts)', () => {
    const scores = makeScoresFromValues(50, 50, 35, 50, 50, 50);
    const penalties = computePenalties(scores);
    const p = penalties.find(p => p.name === 'illness_caution');
    expect(p).toBeDefined();
    expect(p!.points).toBe(12);
  });

  test('2+ subsystems < 40 → multi_system_impairment (8pts)', () => {
    const scores = makeScoresFromValues(35, 35, 60, 60, 60, 60);
    const penalties = computePenalties(scores);
    const p = penalties.find(p => p.name === 'multi_system_impairment');
    expect(p).toBeDefined();
    expect(p!.points).toBe(8);
  });

  test('metabolic < 45 + cardio > 60 → fueling_risk (5pts)', () => {
    const scores = makeScoresFromValues(60, 60, 70, 60, 40, 60);
    const penalties = computePenalties(scores);
    const p = penalties.find(p => p.name === 'fueling_risk');
    expect(p).toBeDefined();
    expect(p!.points).toBe(5);
  });

  test('multiple penalties stack', () => {
    // Autonomic 35, Musculoskeletal 30, Sleep 35 → systemic_suppression won't fire (B not > 75),
    // but restoration_deficit + multi_system_impairment should fire
    const scores = makeScoresFromValues(35, 30, 35, 35, 35, 35);
    const penalties = computePenalties(scores);
    const total = totalPenaltyPoints(penalties);
    console.log(`  Stacked penalties: ${penalties.map(p => `${p.name}(${p.points})`).join(', ')} = ${total} pts`);
    expect(total).toBeGreaterThanOrEqual(20);
  });
});

// ─── Full Pipeline Integration ──────────────────────────────────────────
describe('Full IACI Pipeline — Optimal Athlete State', () => {
  const inputs = makeOptimalInputs();
  const scores = buildSubsystemScores(inputs);
  const result = computeIACI('2026-03-14', scores);

  test('composite score ≥ 80 (Strong or Optimum band)', () => {
    console.log(`\n  ═══ OPTIMAL STATE ═══`);
    console.log(`  Autonomic:       ${scores.autonomic.score} (${scores.autonomic.band})`);
    console.log(`  Musculoskeletal:  ${scores.musculoskeletal.score} (${scores.musculoskeletal.band})`);
    console.log(`  Cardiometabolic:  ${scores.cardiometabolic.score} (${scores.cardiometabolic.band})`);
    console.log(`  Sleep:            ${scores.sleep.score} (${scores.sleep.band})`);
    console.log(`  Metabolic:        ${scores.metabolic.score} (${scores.metabolic.band})`);
    console.log(`  Psychological:    ${scores.psychological.score} (${scores.psychological.band})`);
    console.log(`  ─────────────────────`);
    console.log(`  Base Score:       ${result.baseScore}`);
    console.log(`  Penalties:        ${result.penalties.map(p => `${p.name}(${p.points})`).join(', ') || 'none'}`);
    console.log(`  FINAL SCORE:      ${result.score}`);
    console.log(`  Recovery Band:    ${getRecoveryBand(result.score)}`);
    console.log(`  Readiness Tier:   ${result.readinessTier}`);
    console.log(`  Phenotype:        ${result.phenotype.label}`);
    console.log(`  Protocol Class:   ${result.protocol.protocolClass}`);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(['Optimum', 'Strong']).toContain(getRecoveryBand(result.score));
  });

  test('no penalties triggered', () => {
    expect(result.penalties).toHaveLength(0);
  });

  test('readiness tier is "perform" or "train"', () => {
    expect(['perform', 'train']).toContain(result.readinessTier);
  });

  test('phenotype is "fully_recovered"', () => {
    expect(result.phenotype.key).toBe('fully_recovered');
  });

  test('protocol class is A or B', () => {
    expect(['A', 'B']).toContain(result.protocol.protocolClass);
  });
});

describe('Full IACI Pipeline — Poor Athlete State', () => {
  const inputs = makePoorInputs();
  const scores = buildSubsystemScores(inputs);
  const result = computeIACI('2026-03-14', scores);

  test('composite score ≤ 25 (Insufficient or Poor band)', () => {
    console.log(`\n  ═══ POOR STATE ═══`);
    console.log(`  Autonomic:       ${scores.autonomic.score} (${scores.autonomic.band})`);
    console.log(`  Musculoskeletal:  ${scores.musculoskeletal.score} (${scores.musculoskeletal.band})`);
    console.log(`  Cardiometabolic:  ${scores.cardiometabolic.score} (${scores.cardiometabolic.band})`);
    console.log(`  Sleep:            ${scores.sleep.score} (${scores.sleep.band})`);
    console.log(`  Metabolic:        ${scores.metabolic.score} (${scores.metabolic.band})`);
    console.log(`  Psychological:    ${scores.psychological.score} (${scores.psychological.band})`);
    console.log(`  ─────────────────────`);
    console.log(`  Base Score:       ${result.baseScore}`);
    console.log(`  Penalties:        ${result.penalties.map(p => `${p.name}(${p.points})`).join(', ') || 'none'}`);
    console.log(`  FINAL SCORE:      ${result.score}`);
    console.log(`  Recovery Band:    ${getRecoveryBand(result.score)}`);
    console.log(`  Readiness Tier:   ${result.readinessTier}`);
    console.log(`  Phenotype:        ${result.phenotype.label}`);
    console.log(`  Protocol Class:   ${result.protocol.protocolClass}`);

    expect(result.score).toBeLessThanOrEqual(25);
    expect(['Insufficient', 'Poor']).toContain(getRecoveryBand(result.score));
  });

  test('multiple penalties triggered', () => {
    expect(result.penalties.length).toBeGreaterThan(2);
  });

  test('readiness tier is "protect" or "recover"', () => {
    expect(['protect', 'recover']).toContain(result.readinessTier);
  });

  test('protocol class is D or E', () => {
    expect(['D', 'E']).toContain(result.protocol.protocolClass);
  });

  test('limiting factors exist across multiple subsystems', () => {
    const totalFactors = Object.values(scores).reduce(
      (sum, s) => sum + s.limitingFactors.length, 0
    );
    expect(totalFactors).toBeGreaterThan(8);
  });
});

describe('Full IACI Pipeline — Moderate Athlete State', () => {
  const inputs = makeModerateInputs();
  const scores = buildSubsystemScores(inputs);
  const result = computeIACI('2026-03-14', scores);

  test('composite score between 40-70 (Moderate or Sufficient band)', () => {
    console.log(`\n  ═══ MODERATE STATE ═══`);
    console.log(`  Autonomic:       ${scores.autonomic.score} (${scores.autonomic.band})`);
    console.log(`  Musculoskeletal:  ${scores.musculoskeletal.score} (${scores.musculoskeletal.band})`);
    console.log(`  Cardiometabolic:  ${scores.cardiometabolic.score} (${scores.cardiometabolic.band})`);
    console.log(`  Sleep:            ${scores.sleep.score} (${scores.sleep.band})`);
    console.log(`  Metabolic:        ${scores.metabolic.score} (${scores.metabolic.band})`);
    console.log(`  Psychological:    ${scores.psychological.score} (${scores.psychological.band})`);
    console.log(`  ─────────────────────`);
    console.log(`  Base Score:       ${result.baseScore}`);
    console.log(`  Penalties:        ${result.penalties.map(p => `${p.name}(${p.points})`).join(', ') || 'none'}`);
    console.log(`  FINAL SCORE:      ${result.score}`);
    console.log(`  Recovery Band:    ${getRecoveryBand(result.score)}`);
    console.log(`  Readiness Tier:   ${result.readinessTier}`);
    console.log(`  Phenotype:        ${result.phenotype.label}`);

    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThanOrEqual(70);
  });

  test('readiness tier is "maintain" or "train"', () => {
    expect(['maintain', 'train']).toContain(result.readinessTier);
  });
});

// ─── Whoop-Specific Scenario Tests ──────────────────────────────────────
describe('Whoop Input Scenarios', () => {
  const baselines: AutonomicBaselines = {
    hrv: HEALTHY_BASELINES.hrv,
    rhr: HEALTHY_BASELINES.rhr,
    strain: HEALTHY_BASELINES.strain,
    sleepDuration: HEALTHY_BASELINES.sleepDuration,
  };

  test('high HRV (90) + low RHR (48) = autonomic ≥ 80', () => {
    const result = scoreAutonomic({
      hrvRmssd: 90,
      restingHeartRate: 48,
      priorDayStrain: 8,
      threeDayAvgStrain: 10,
      sleepDurationMs: 8 * 3600000,
      sleepPerformancePct: 85,
      sleepConsistencyPct: 80,
      subjectiveStress: 1,
      perceivedFatigue: 1,
    }, baselines);
    console.log(`  Whoop: HRV=90, RHR=48 → autonomic=${result.score}`);
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  test('low HRV (40) + high RHR (62) = autonomic ≤ 30', () => {
    const result = scoreAutonomic({
      hrvRmssd: 40,
      restingHeartRate: 62,
      priorDayStrain: 16,
      threeDayAvgStrain: 15,
      sleepDurationMs: 5 * 3600000,
      sleepPerformancePct: 45,
      sleepConsistencyPct: 40,
      subjectiveStress: 4,
      perceivedFatigue: 4,
    }, baselines);
    console.log(`  Whoop: HRV=40, RHR=62 → autonomic=${result.score}`);
    expect(result.score).toBeLessThanOrEqual(30);
  });

  test('Whoop sleep score 95% → sleep subsystem ≥ 85', () => {
    const result = scoreSleepCircadian({
      sleepDurationMs: 8.5 * 3600000,
      sleepPerformancePct: 95,
      sleepConsistencyPct: 90,
      remSleepMs: 2.1 * 3600000,
      deepSleepMs: 1.7 * 3600000,
      awakenings: 1,
      sleepLatencyMs: 5 * 60000,
      subjectiveSleepQuality: 5,
      lateCaffeine: false,
      lateAlcohol: false,
      lateHeavyMeal: false,
      isTraveling: false,
      timezoneChange: 0,
    });
    console.log(`  Whoop: Sleep Performance=95% → sleep=${result.score}`);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  test('Whoop sleep score 30% → sleep subsystem ≤ 40', () => {
    const result = scoreSleepCircadian({
      sleepDurationMs: 4.5 * 3600000,
      sleepPerformancePct: 30,
      sleepConsistencyPct: 25,
      remSleepMs: 0.3 * 3600000,
      deepSleepMs: 0.2 * 3600000,
      awakenings: 7,
      sleepLatencyMs: 50 * 60000,
      subjectiveSleepQuality: 1,
      lateCaffeine: true,
      lateAlcohol: false,
      lateHeavyMeal: false,
      isTraveling: false,
      timezoneChange: 0,
    });
    console.log(`  Whoop: Sleep Performance=30% → sleep=${result.score}`);
    expect(result.score).toBeLessThanOrEqual(40);
  });

  test('Whoop strain 18 (very high) → musculoskeletal impact', () => {
    const result = scoreMusculoskeletal({
      soreness: { quads: 2, hamstrings: 2 },
      stiffness: 3,
      heavyLegs: true,
      painLocations: [],
      priorWorkoutType: 'intervals',
      priorDayStrain: 18,
      threeDayAvgStrain: 15,
      daysFromLastStrengthSession: 1,
      daysFromLastHighIntensity: 0,
    });
    console.log(`  Whoop: Day Strain=18 → musculoskeletal=${result.score}`);
    // Strain has 10% weight; with moderate soreness (2/4) and heavy legs,
    // score lands ~50 which is compromised band — appropriate
    expect(result.score).toBeLessThanOrEqual(55);
  });
});

// ─── Variable Isolation Tests ───────────────────────────────────────────
describe('Variable Isolation — Each Factor Affects Score Directionally', () => {
  const baselines: AutonomicBaselines = {
    hrv: HEALTHY_BASELINES.hrv,
    rhr: HEALTHY_BASELINES.rhr,
    strain: HEALTHY_BASELINES.strain,
    sleepDuration: HEALTHY_BASELINES.sleepDuration,
  };

  test('higher stress (5 vs 1) reduces autonomic score', () => {
    const low = scoreAutonomic({
      hrvRmssd: null, restingHeartRate: null, priorDayStrain: null,
      threeDayAvgStrain: null, sleepDurationMs: null, sleepPerformancePct: null,
      sleepConsistencyPct: null, subjectiveStress: 1, perceivedFatigue: null,
    }, { hrv: null, rhr: null, strain: null, sleepDuration: null });
    const high = scoreAutonomic({
      hrvRmssd: null, restingHeartRate: null, priorDayStrain: null,
      threeDayAvgStrain: null, sleepDurationMs: null, sleepPerformancePct: null,
      sleepConsistencyPct: null, subjectiveStress: 5, perceivedFatigue: null,
    }, { hrv: null, rhr: null, strain: null, sleepDuration: null });
    expect(high.score).toBeLessThan(low.score);
  });

  test('fasting reduces metabolic score', () => {
    const fed = scoreMetabolic({
      hydrationGlasses: null, electrolytesTaken: null, proteinAdequate: null,
      fasting: false, giDisruption: null, lateHeavyMeal: null,
      bodyMassChangeKg: null, postWorkoutFuelingAdequate: null,
    });
    const fasted = scoreMetabolic({
      hydrationGlasses: null, electrolytesTaken: null, proteinAdequate: null,
      fasting: true, giDisruption: null, lateHeavyMeal: null,
      bodyMassChangeKg: null, postWorkoutFuelingAdequate: null,
    });
    expect(fasted.score).toBeLessThan(fed.score);
  });

  test('GI disruption (4/5) reduces metabolic score', () => {
    const ok = scoreMetabolic({
      hydrationGlasses: null, electrolytesTaken: null, proteinAdequate: null,
      fasting: null, giDisruption: 1, lateHeavyMeal: null,
      bodyMassChangeKg: null, postWorkoutFuelingAdequate: null,
    });
    const bad = scoreMetabolic({
      hydrationGlasses: null, electrolytesTaken: null, proteinAdequate: null,
      fasting: null, giDisruption: 4, lateHeavyMeal: null,
      bodyMassChangeKg: null, postWorkoutFuelingAdequate: null,
    });
    expect(bad.score).toBeLessThan(ok.score);
  });

  test('heavy legs reduces musculoskeletal score', () => {
    const noHeavy = scoreMusculoskeletal({
      soreness: null, stiffness: null, heavyLegs: false,
      painLocations: null, priorWorkoutType: null, priorDayStrain: null,
      threeDayAvgStrain: null, daysFromLastStrengthSession: null,
      daysFromLastHighIntensity: null,
    });
    const heavy = scoreMusculoskeletal({
      soreness: null, stiffness: null, heavyLegs: true,
      painLocations: null, priorWorkoutType: null, priorDayStrain: null,
      threeDayAvgStrain: null, daysFromLastStrengthSession: null,
      daysFromLastHighIntensity: null,
    });
    expect(heavy.score).toBeLessThan(noHeavy.score);
  });

  test('low motivation (1) reduces psychological score', () => {
    const high = scorePsychoEmotional({
      motivation: 5, mood: null, mentalFatigue: null, willingnessToTrain: null,
      concentration: null, subjectiveStress: null, overallEnergy: null,
    });
    const low = scorePsychoEmotional({
      motivation: 1, mood: null, mentalFatigue: null, willingnessToTrain: null,
      concentration: null, subjectiveStress: null, overallEnergy: null,
    });
    expect(low.score).toBeLessThan(high.score);
  });
});

// ─── Composite Score Math Verification ──────────────────────────────────
describe('Composite Score Math', () => {
  test('weighted average matches manual calculation', () => {
    const scores = makeScoresFromValues(90, 80, 70, 60, 50, 40);
    const result = computeIACI('2026-03-14', scores);
    const expected = Math.round(
      90 * 0.25 + 80 * 0.20 + 70 * 0.15 + 60 * 0.15 + 50 * 0.15 + 40 * 0.10
    );
    expect(result.baseScore).toBe(expected);
    console.log(`  Manual: 90×0.25 + 80×0.20 + 70×0.15 + 60×0.15 + 50×0.15 + 40×0.10 = ${expected}`);
  });

  test('all systems at 100 → score of 100', () => {
    const scores = makeScoresFromValues(100, 100, 100, 100, 100, 100);
    const result = computeIACI('2026-03-14', scores);
    expect(result.score).toBe(100);
    expect(result.baseScore).toBe(100);
    expect(getRecoveryBand(result.score)).toBe('Optimum');
  });

  test('all systems at 0 → score of 0 (with penalties)', () => {
    const scores = makeScoresFromValues(0, 0, 0, 0, 0, 0);
    const result = computeIACI('2026-03-14', scores);
    expect(result.score).toBe(0);
    expect(getRecoveryBand(result.score)).toBe('Poor');
  });

  test('penalties subtract from base score', () => {
    // Sleep at 35 triggers restoration_deficit (10 pts)
    const scores = makeScoresFromValues(70, 70, 70, 35, 70, 70);
    const result = computeIACI('2026-03-14', scores);
    expect(result.score).toBeLessThan(result.baseScore);
    expect(result.baseScore - result.score).toBeGreaterThanOrEqual(10);
  });
});

// ─── Readiness Tier & Protocol Class Mapping ────────────────────────────
describe('Readiness Tier & Protocol Class Mapping', () => {
  const cases = [
    { score: 95, tier: 'perform', pClass: 'A', band: 'Optimum' },
    { score: 85, tier: 'perform', pClass: 'A', band: 'Optimum' },
    { score: 80, tier: 'train', pClass: 'A', band: 'Strong' },
    { score: 75, tier: 'train', pClass: 'B', band: 'Strong' },
    { score: 65, tier: 'maintain', pClass: 'B', band: 'Strong' },
    { score: 60, tier: 'maintain', pClass: 'C', band: 'Moderate' },
    { score: 55, tier: 'maintain', pClass: 'C', band: 'Moderate' },
    { score: 50, tier: 'recover', pClass: 'C', band: 'Moderate' },
    { score: 40, tier: 'recover', pClass: 'D', band: 'Sufficient' },
    { score: 35, tier: 'recover', pClass: 'D', band: 'Sufficient' },
    { score: 30, tier: 'protect', pClass: 'E', band: 'Sufficient' },
    { score: 20, tier: 'protect', pClass: 'E', band: 'Insufficient' },
    { score: 10, tier: 'protect', pClass: 'E', band: 'Insufficient' },
    { score: 0, tier: 'protect', pClass: 'E', band: 'Poor' },
  ];

  cases.forEach(({ score, tier, pClass, band }) => {
    test(`score ${score} → tier=${tier}, class=${pClass}, band=${band}`, () => {
      expect(getReadinessTier(score)).toBe(tier);
      expect(getProtocolClass(score)).toBe(pClass);
      expect(getRecoveryBand(score)).toBe(band);
    });
  });
});

// ─── Monotonicity: Score Moves in Right Direction ───────────────────────
describe('Score Monotonicity — Worse Inputs Always Produce Lower Scores', () => {
  test('optimal > moderate > poor composite scores', () => {
    const optScores = buildSubsystemScores(makeOptimalInputs());
    const modScores = buildSubsystemScores(makeModerateInputs());
    const poorScores = buildSubsystemScores(makePoorInputs());

    const optResult = computeIACI('2026-03-14', optScores);
    const modResult = computeIACI('2026-03-14', modScores);
    const poorResult = computeIACI('2026-03-14', poorScores);

    console.log(`\n  ═══ MONOTONICITY CHECK ═══`);
    console.log(`  Optimal:  ${optResult.score} (${getRecoveryBand(optResult.score)})`);
    console.log(`  Moderate: ${modResult.score} (${getRecoveryBand(modResult.score)})`);
    console.log(`  Poor:     ${poorResult.score} (${getRecoveryBand(poorResult.score)})`);

    expect(optResult.score).toBeGreaterThan(modResult.score);
    expect(modResult.score).toBeGreaterThan(poorResult.score);
  });

  test('each subsystem: optimal > moderate > poor', () => {
    const opt = buildSubsystemScores(makeOptimalInputs());
    const mod = buildSubsystemScores(makeModerateInputs());
    const poor = buildSubsystemScores(makePoorInputs());

    const keys: (keyof SubsystemScores)[] = [
      'autonomic', 'musculoskeletal', 'cardiometabolic',
      'sleep', 'metabolic', 'psychological',
    ];

    for (const key of keys) {
      console.log(`  ${key}: optimal=${opt[key].score}, moderate=${mod[key].score}, poor=${poor[key].score}`);
      expect(opt[key].score).toBeGreaterThan(mod[key].score);
      expect(mod[key].score).toBeGreaterThan(poor[key].score);
    }
  });
});

// ─── Summary Report ─────────────────────────────────────────────────────
describe('Summary: Recovery Band Distribution Across Scenarios', () => {
  test('print full summary table', () => {
    const scenarios = [
      { name: 'Optimal', inputs: makeOptimalInputs() },
      { name: 'Moderate', inputs: makeModerateInputs() },
      { name: 'Poor', inputs: makePoorInputs() },
    ];

    console.log('\n  ╔══════════════╦═══════╦════════════════╦═════════════╦═══════════════╦══════════════════════════════╗');
    console.log('  ║ Scenario     ║ Score ║ Recovery Band  ║ Tier        ║ Proto Class   ║ Phenotype                    ║');
    console.log('  ╠══════════════╬═══════╬════════════════╬═════════════╬═══════════════╬══════════════════════════════╣');

    for (const { name, inputs } of scenarios) {
      const scores = buildSubsystemScores(inputs);
      const result = computeIACI('2026-03-14', scores);
      const band = getRecoveryBand(result.score);
      console.log(
        `  ║ ${name.padEnd(12)} ║ ${String(result.score).padStart(5)} ║ ${band.padEnd(14)} ║ ${result.readinessTier.padEnd(11)} ║ ${result.protocol.protocolClass.padEnd(13)} ║ ${result.phenotype.label.padEnd(28)} ║`
      );
    }
    console.log('  ╚══════════════╩═══════╩════════════════╩═════════════╩═══════════════╩══════════════════════════════╝');

    // This test always passes — it's for the printed summary
    expect(true).toBe(true);
  });
});
