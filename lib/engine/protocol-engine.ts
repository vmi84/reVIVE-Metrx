/**
 * Protocol Engine (Level 5)
 *
 * Maps final score + phenotype + subsystem scores to protocol class
 * and recommends specific recovery modalities.
 */

import {
  SubsystemScores,
  Phenotype,
  PhenotypeKey,
  ProtocolClass,
  ProtocolPrescription,
  TrainingCompatibility,
  TrainingPermission,
  TrendContext,
  TrendDirection,
  DriverAnalysis,
  RecoveryDriver,
  getProtocolClass,
  getReadinessTier,
} from '../types/iaci';
import { getTrainingCompatibility, getRecoveryTrainingRecommendations } from './training-compatibility';
import { getSportRecoveryNeeds } from './sport-stress';
import type { AthleteModeConfig } from '../types/athlete-mode';

interface PhenotypeProtocolMap {
  focusAreas: string[];
  modalitySlugs: string[];
  explanation: string;
}

const PHENOTYPE_PROTOCOLS: Record<PhenotypeKey, PhenotypeProtocolMap> = {
  neurologically_compromised: {
    focusAreas: ['cognitive_rest', 'vestibular', 'cervical_mobility', 'red_light'],
    modalitySlugs: [
      'cognitive-rest-protocol', 'cervical-mobility-flow', 'gentle-walking',
      'vestibular-balance-drills', 'red-light-therapy-head', 'coherent-breathing',
      'body-scan-meditation', 'grounding-earthing',
    ],
    explanation: 'Neurological recovery protocol. Cognitive rest priority. Gentle vestibular rehabilitation if tolerated. Red light therapy for neuroinflammation. No impact, no complex coordination, no screens.',
  },
  fully_recovered: {
    focusAreas: ['dynamic_mobility', 'technique'],
    modalitySlugs: [
      'dynamic-warmup-flow', 'hip-circles', 'leg-swings',
      'foam-roll-quads', 'cat-cow-breathing',
    ],
    explanation: 'Standard training prep with dynamic mobility. All training types supported.',
  },
  locally_fatigued: {
    focusAreas: ['foam_roll', 'circulation', 'contrast'],
    modalitySlugs: [
      'foam-roll-quads', 'foam-roll-hamstrings', 'foam-roll-it-band',
      'contrast-shower', 'walking-recovery', 'gentle-cycling',
      'banded-hip-distraction', 'static-hamstring-stretch',
    ],
    explanation: 'Foam rolling and circulation work on affected regions. Avoid high-force loading on fatigued areas. Upper/lower split adjustment recommended.',
  },
  centrally_suppressed: {
    focusAreas: ['breathwork', 'vagus_nerve', 'parasympathetic'],
    modalitySlugs: [
      'extended-exhale-breathing', 'coherent-breathing', 'box-breathing',
      'legs-on-wall', 'cold-water-face-splash', 'gentle-walking',
      'body-scan-meditation', 'humming-bee-breath',
    ],
    explanation: 'Breathwork and parasympathetic downregulation priority. Easy movement only. No complex coordination or high-intensity work.',
  },
  sleep_driven_suppression: {
    focusAreas: ['sleep_support', 'breathwork', 'gentle_movement'],
    modalitySlugs: [
      'humming-bee-breath', '4-5-6-breathing', 'body-scan-meditation',
      'gentle-walking', 'legs-on-wall', 'static-stretching-full-body',
      'progressive-muscle-relaxation',
    ],
    explanation: 'Sleep restoration protocol priority. Gentle breathwork and easy movement. Early sleep time. Reduce cognitive complexity in training.',
  },
  accumulated_fatigue: {
    focusAreas: ['recovery', 'nutrition', 'sleep', 'gentle_movement'],
    modalitySlugs: [
      'normatec-compression', 'gentle-aquatic-recovery', 'walking-recovery',
      'static-stretching-full-body', 'foam-roll-full-body',
      'coherent-breathing', 'cold-water-immersion',
    ],
    explanation: 'Reduced training load. Compression and gentle movement for circulation. Prioritize sleep and nutrition. No high-intensity or high-force work.',
  },
  under_fueled: {
    focusAreas: ['nutrition', 'hydration', 'light_movement'],
    modalitySlugs: [
      'gentle-walking', 'walking-recovery', 'gentle-cycling',
      'coherent-breathing', 'static-stretching-full-body',
    ],
    explanation: 'Hydration and electrolyte protocol priority. Protein timing emphasis. Light walking only. Address fueling before training.',
  },
  illness_risk: {
    focusAreas: ['rest', 'sleep', 'symptom_monitoring'],
    modalitySlugs: [
      'cold-water-face-splash', 'gentle-walking',
      'legs-on-wall', 'body-scan-meditation',
    ],
    explanation: 'No meaningful training load. Rest and symptom monitoring. Hydration focus. Sleep priority. Consider medical evaluation if symptoms persist.',
  },
};

const TREND_EXPLANATIONS: Record<TrendDirection, string> = {
  improving: '7-day trend improving — slightly expanded training options.',
  stable: '',
  declining: '7-day declining trend — reduced load recommended. Focus on recovery.',
};

const DRIVER_EXPLANATION_SUFFIX: Partial<Record<RecoveryDriver, string>> = {
  sleep: ' Prioritize sleep: early bedtime, morning light, caffeine cutoff.',
  stress: ' Stress is your top limiter: breathwork, schedule protection, nature exposure.',
  activity_overload: ' Activity overload detected: deload, mobility, protein timing.',
  neurological: ' CNS fatigue priority: cognitive rest, screen-free time, gentle movement.',
  metabolic: ' Fuel gap detected: hydration, electrolytes, timed carbs.',
  illness: ' Illness risk: full rest and symptom monitoring. No training load.',
  multi_system: ' Multiple systems impaired: recovery day. Sleep, nutrition, gentle movement.',
};

export function prescribeProtocol(
  iaciScore: number,
  phenotype: Phenotype,
  subsystemScores: SubsystemScores,
  sportKeys?: string | string[] | null,
  athleteMode?: AthleteModeConfig | null,
  userEnvironment?: string[],
  preferredActivities?: string[],
  trendContext?: TrendContext | null,
  confidence?: number,
  driverAnalysis?: DriverAnalysis | null,
): ProtocolPrescription {
  const protocolClass = getProtocolClass(iaciScore);
  const readinessTier = getReadinessTier(iaciScore);
  const phenotypeMap = PHENOTYPE_PROTOCOLS[phenotype.key];
  const trainingCompat = getTrainingCompatibility(
    iaciScore, phenotype.key, subsystemScores, athleteMode, trendContext,
  );
  const sportNeeds = getSportRecoveryNeeds(sportKeys);
  const sportKeyArray = sportKeys
    ? (Array.isArray(sportKeys) ? sportKeys : [sportKeys])
    : undefined;
  const recommendedTraining = getRecoveryTrainingRecommendations(
    trainingCompat,
    subsystemScores,
    sportNeeds,
    8,
    userEnvironment,
    sportKeyArray,
    preferredActivities,
  );

  // Build explanation with trend + driver context
  let explanation = phenotypeMap.explanation;
  const trend = trendContext?.direction ?? null;

  if (trend && TREND_EXPLANATIONS[trend]) {
    explanation += ' ' + TREND_EXPLANATIONS[trend];
  }
  if (driverAnalysis) {
    const suffix = DRIVER_EXPLANATION_SUFFIX[driverAnalysis.primaryDriver];
    if (suffix) explanation += suffix;
  }

  // Confidence note
  let confidenceNote: string | null = null;
  if (confidence != null && confidence < 0.5) {
    confidenceNote = 'Low confidence — consider syncing wearable or completing full check-in for better accuracy.';
  } else if (confidence != null && confidence < 0.75) {
    confidenceNote = 'Moderate confidence — more data sources would improve recommendation precision.';
  }

  // Permutation key for analytics
  const permutationKey = `band_${protocolClass}_${trend ?? 'none'}_${
    confidence != null ? (confidence >= 0.75 ? 'high' : confidence >= 0.5 ? 'medium' : 'low') : 'unknown'
  }_${driverAnalysis?.primaryDriver ?? 'none'}`;

  return {
    protocolClass,
    readinessTier,
    recommendedModalities: phenotypeMap.modalitySlugs,
    trainingCompatibility: trainingCompat,
    recommendedTraining,
    explanation,
    trendModifier: trend,
    confidenceNote,
    driverInsight: driverAnalysis?.actionableInsight ?? null,
    permutationKey,
  };
}
