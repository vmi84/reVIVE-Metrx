/**
 * Progress Tracker — stall detection, ACWR, training monotony.
 */

import { ACWR, StallType } from '../types/progress';
import { rollingMean, rollingSd } from '../utils/math';
import { ACWR_ZONES, MONOTONY_THRESHOLD } from '../utils/constants';

export function computeACWR(
  dailyLoads: number[], // most recent 28 days, newest last
): ACWR {
  if (dailyLoads.length < 28) {
    const acute = rollingMean(dailyLoads.slice(-7));
    const chronic = rollingMean(dailyLoads);
    const ratio = chronic > 0 ? acute / chronic : 1.0;
    return { acute, chronic, ratio, zone: categorizeACWR(ratio) };
  }

  const acute = rollingMean(dailyLoads.slice(-7));
  const chronic = rollingMean(dailyLoads.slice(-28));
  const ratio = chronic > 0 ? acute / chronic : 1.0;

  return { acute, chronic, ratio, zone: categorizeACWR(ratio) };
}

function categorizeACWR(ratio: number): ACWR['zone'] {
  if (ratio < ACWR_ZONES.undertraining.max) return 'undertraining';
  if (ratio < ACWR_ZONES.sweet_spot.max) return 'sweet_spot';
  if (ratio < ACWR_ZONES.danger.max) return 'danger';
  return 'overreaching';
}

export function computeMonotony(dailyLoads: number[]): number {
  if (dailyLoads.length < 7) return 0;
  const recent = dailyLoads.slice(-7);
  const mean = rollingMean(recent);
  const sd = rollingSd(recent);
  return sd > 0 ? mean / sd : 0;
}

export function detectStall(params: {
  vo2maxHistory: number[];
  paceHistory: number[];
  hrvBaselineHistory: number[];
  acwr: ACWR;
  monotony: number;
  daysSinceImprovement: number;
}): { stallType: StallType; alternativeApproaches: string[] } {
  const { vo2maxHistory, paceHistory, hrvBaselineHistory, acwr, monotony, daysSinceImprovement } = params;

  // VO2Max plateau: no improvement in 8+ weeks
  if (vo2maxHistory.length >= 8) {
    const recentTrend = vo2maxHistory.slice(-8);
    const change = recentTrend[recentTrend.length - 1] - recentTrend[0];
    if (Math.abs(change) < 0.5) {
      return {
        stallType: 'vo2max_plateau',
        alternativeApproaches: [
          'Increase interval intensity (shorter, faster efforts)',
          'Add hill repeats or incline work',
          'Introduce polarized training distribution',
          'Add cross-training modality (cycling, swimming)',
          'Reduce volume, increase intensity density',
        ],
      };
    }
  }

  // Pace stagnation
  if (paceHistory.length >= 6 && daysSinceImprovement > 42) {
    return {
      stallType: 'pace_stagnation',
      alternativeApproaches: [
        'Add tempo/threshold-specific blocks',
        'Include race-pace simulation sessions',
        'Try neuromuscular development (strides, short hill sprints)',
        'Address running economy (drills, strength)',
        'Consider altitude training or heat acclimation block',
      ],
    };
  }

  // Training monotony
  if (monotony > MONOTONY_THRESHOLD) {
    return {
      stallType: 'training_monotony',
      alternativeApproaches: [
        'Vary training intensity distribution',
        'Add easy recovery days between hard sessions',
        'Include unstructured play/sport sessions',
        'Change training environment (trails, track, pool)',
        'Block periodization with distinct phases',
      ],
    };
  }

  // Overreaching
  if (acwr.zone === 'overreaching' || acwr.zone === 'danger') {
    return {
      stallType: 'overreaching',
      alternativeApproaches: [
        'Reduce training volume by 30-50% for 1-2 weeks',
        'Increase sleep by 1 hour per night',
        'Prioritize recovery protocols (compression, cold water)',
        'Add extra rest day per week',
        'Focus on quality over quantity',
      ],
    };
  }

  // HRV stagnation
  if (hrvBaselineHistory.length >= 14) {
    const recentHRV = hrvBaselineHistory.slice(-14);
    const change = recentHRV[recentHRV.length - 1] - recentHRV[0];
    if (change < -2) {
      return {
        stallType: 'hrv_stagnation',
        alternativeApproaches: [
          'Increase parasympathetic activity (breathwork, meditation)',
          'Improve sleep hygiene and consistency',
          'Reduce life stress where possible',
          'Consider deload week',
          'Review nutrition and hydration adequacy',
        ],
      };
    }
  }

  return { stallType: 'none', alternativeApproaches: [] };
}
