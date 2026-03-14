/**
 * Data quality assessment for CanonicalPhysiologyRecords.
 *
 * Determines a quality tier (high / medium / low / estimated) based on
 * which metrics are present versus missing.
 */

import {
  CanonicalPhysiologyRecord,
  DataQualityReport,
  DataQualityTier,
} from '../types/canonical';

/** Metrics grouped by importance for quality scoring. */
const CRITICAL_METRICS = [
  'recovery.hrvRmssd',
  'recovery.restingHeartRate',
  'sleep.totalSleepMs',
  'recovery.recoveryScore',
] as const;

const IMPORTANT_METRICS = [
  'sleep.sleepPerformancePct',
  'sleep.remSleepMs',
  'sleep.deepSleepMs',
  'cardiovascular.respiratoryRate',
  'cardiovascular.spo2Pct',
] as const;

const SUPPLEMENTAL_METRICS = [
  'sleep.sleepConsistencyPct',
  'sleep.lightSleepMs',
  'sleep.awakeDuringMs',
  'sleep.sleepLatencyMs',
  'cardiovascular.skinTempDeviation',
  'sleep.awakenings',
  'sleep.respiratoryRate',
  'sleep.spo2Pct',
] as const;

type MetricPath =
  | (typeof CRITICAL_METRICS)[number]
  | (typeof IMPORTANT_METRICS)[number]
  | (typeof SUPPLEMENTAL_METRICS)[number];

const ALL_METRICS: MetricPath[] = [
  ...CRITICAL_METRICS,
  ...IMPORTANT_METRICS,
  ...SUPPLEMENTAL_METRICS,
];

/**
 * Resolve a dot-path like `recovery.hrvRmssd` against a record.
 * Returns true when the value is non-null.
 */
function metricPresent(
  record: CanonicalPhysiologyRecord,
  path: string,
): boolean {
  const [section, field] = path.split('.') as [
    keyof CanonicalPhysiologyRecord,
    string,
  ];
  const group = record[section];
  if (group == null || typeof group !== 'object' || Array.isArray(group)) return false;
  return (group as unknown as Record<string, unknown>)[field] != null;
}

/**
 * Assess the quality tier and confidence of a record.
 */
export function assessQuality(
  record: CanonicalPhysiologyRecord,
): DataQualityReport {
  const present: string[] = [];
  const missing: string[] = [];

  for (const path of ALL_METRICS) {
    if (metricPresent(record, path)) {
      present.push(path);
    } else {
      missing.push(path);
    }
  }

  const criticalPresent = CRITICAL_METRICS.filter((m) =>
    metricPresent(record, m),
  ).length;
  const importantPresent = IMPORTANT_METRICS.filter((m) =>
    metricPresent(record, m),
  ).length;

  const criticalRatio = criticalPresent / CRITICAL_METRICS.length;
  const importantRatio = importantPresent / IMPORTANT_METRICS.length;
  const overallRatio = present.length / ALL_METRICS.length;

  let tier: DataQualityTier;

  if (criticalRatio >= 1 && importantRatio >= 0.8) {
    tier = 'high';
  } else if (criticalRatio >= 0.75 && importantRatio >= 0.5) {
    tier = 'medium';
  } else if (criticalRatio >= 0.5) {
    tier = 'low';
  } else {
    tier = 'estimated';
  }

  // Confidence is a weighted blend: critical 50%, important 30%, supplemental 20%
  const confidence = Math.round(
    (criticalRatio * 0.5 + importantRatio * 0.3 + overallRatio * 0.2) * 100,
  ) / 100;

  return {
    tier,
    metricsPresent: present,
    metricsMissing: missing,
    confidence: Math.min(confidence, 1),
  };
}
