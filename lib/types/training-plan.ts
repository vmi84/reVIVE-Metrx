/**
 * Training Plan Types
 *
 * Supports external coaching plan ingestion via manual entry,
 * weekly templates, calendar import, or future API sync.
 */

/** A single planned training session for a specific date. */
export interface PlannedSession {
  /** Date in YYYY-MM-DD format. */
  date: string;
  /** Time slot for the session. */
  slot: 'am' | 'pm' | 'any';
  /** Workout type (e.g., 'tempo run', 'easy swim', 'intervals', 'strength', 'rest'). */
  type: string;
  /** Free-text description from coach or athlete. */
  description?: string;
  /** Planned duration in minutes. */
  durationMin?: number;
  /** Intensity zone (e.g., 'Z1', 'Z2', 'threshold', 'VO2max'). */
  intensityZone?: string;
  /** How this session was entered. */
  source: 'manual' | 'template' | 'trainingpeaks' | 'ical' | 'other';
}

/** A recurring weekly training structure. */
export interface WeeklyTemplate {
  /** Template name (e.g., 'Base Phase', 'Build Week'). */
  name: string;
  /** Sessions that repeat every week. */
  sessions: WeeklyTemplateSession[];
}

export interface WeeklyTemplateSession {
  /** Day of the week: 0=Sunday, 1=Monday, ..., 6=Saturday. */
  dayOfWeek: number;
  /** Time slot. */
  slot: 'am' | 'pm' | 'any';
  /** Workout type. */
  type: string;
  /** Planned duration in minutes. */
  durationMin?: number;
  /** Intensity zone. */
  intensityZone?: string;
}

/**
 * Classifies a planned session's intensity for recovery planning.
 * Used by the plan-aware recovery engine.
 */
export type SessionIntensity = 'rest' | 'easy' | 'moderate' | 'hard' | 'key';

/** Map workout type strings to intensity classification. */
export function classifySessionIntensity(type: string, intensityZone?: string): SessionIntensity {
  const t = type.toLowerCase();

  // Rest days
  if (t === 'rest' || t === 'off' || t === 'recovery') return 'rest';

  // High intensity
  if (
    t.includes('interval') || t.includes('tempo') || t.includes('threshold') ||
    t.includes('vo2') || t.includes('race') || t.includes('time trial') ||
    t.includes('speed') || t.includes('sprint') || t.includes('heavy')
  ) return 'key';

  // Zone-based classification
  if (intensityZone) {
    const z = intensityZone.toLowerCase();
    if (z === 'z4' || z === 'z5' || z === 'vo2max' || z === 'threshold') return 'key';
    if (z === 'z3') return 'hard';
    if (z === 'z2') return 'moderate';
    if (z === 'z1') return 'easy';
  }

  // Moderate by default for structured training
  if (t.includes('strength') || t.includes('gym') || t.includes('weights')) return 'hard';
  if (t.includes('easy') || t.includes('recovery') || t.includes('walk')) return 'easy';

  return 'moderate';
}
