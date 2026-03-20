/**
 * Gathers device-agnostic user context from Zustand stores
 * for injection into the assistant's system prompt.
 */

import { useDailyStore } from '../../store/daily-store';
import { usePhysiologyStore } from '../../store/physiology-store';
import { useWorkoutStore } from '../../store/workout-store';
import { getHelpGuideAsContext } from '../../data/help-guide';

export interface AssistantContext {
  iaciScore: number | null;
  readinessTier: string | null;
  phenotype: string | null;
  subsystems: Record<string, number> | null;
  penalties: string[];
  limiters: string[];
  protocolClass: string | null;
  topModalities: string[];
  checkinCompleted: boolean;
  deviceSynced: boolean;
  deviceSource: string | null;
  hrv: number | null;
  rhr: number | null;
  recoveryScore: number | null;
  sleepHours: number | null;
  sportProfiles: string[];
  recentWorkoutCount: number;
  /** Full help guide content for AI training */
  helpGuide: string;
}

export function gatherAssistantContext(): AssistantContext {
  const daily = useDailyStore.getState();
  const physiology = usePhysiologyStore.getState();
  const workout = useWorkoutStore.getState();

  const iaci = daily.iaci;
  const latestPhysio = physiology.getLatest?.() ?? null;

  // Extract subsystem scores
  let subsystems: Record<string, number> | null = null;
  if (iaci?.subsystemScores) {
    subsystems = {};
    for (const [key, val] of Object.entries(iaci.subsystemScores)) {
      subsystems[key] = typeof val === 'object' && val !== null && 'score' in val
        ? (val as { score: number }).score
        : (val as number);
    }
  }

  // Extract wearable metrics (device-agnostic — works for Whoop, Garmin, Oura, etc.)
  const hrv = latestPhysio?.cardiovascular?.hrvRmssd
    ?? latestPhysio?.recovery?.hrvRmssd
    ?? null;
  const rhr = latestPhysio?.cardiovascular?.restingHeartRate
    ?? latestPhysio?.recovery?.restingHeartRate
    ?? null;
  const recoveryScore = latestPhysio?.recovery?.recoveryScore ?? null;
  const sleepHours = latestPhysio?.sleep?.totalSleepMs
    ? Math.round((latestPhysio.sleep.totalSleepMs / 3600000) * 10) / 10
    : null;

  return {
    iaciScore: iaci?.score ?? null,
    readinessTier: iaci?.readinessTier ?? null,
    phenotype: iaci?.phenotype?.label ?? null,
    subsystems,
    penalties: iaci?.penalties?.map((p: { name: string }) => p.name) ?? [],
    limiters: iaci?.phenotype?.primaryLimiters ?? [],
    protocolClass: iaci?.protocol?.protocolClass ?? null,
    topModalities: iaci?.protocol?.recommendedTraining
      ?.slice(0, 3)
      .map((m: { label: string }) => m.label) ?? [],
    checkinCompleted: daily.checkinCompleted,
    deviceSynced: daily.deviceSynced,
    deviceSource: daily.deviceSource,
    hrv,
    rhr,
    recoveryScore,
    sleepHours,
    sportProfiles: [], // TODO: read from profile store when available
    recentWorkoutCount: workout.recentWorkouts?.length ?? 0,
    helpGuide: getHelpGuideAsContext(),
  };
}
