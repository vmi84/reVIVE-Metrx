/**
 * Effort Guide Tab
 *
 * Flow:
 * 1. Training Compatibility — what's safe today (from IACI)
 * 2. Log your workout — type, duration, zones
 * 3. Post-workout recovery options — ONLY shown after workout is entered,
 *    filtered by time, location, equipment, and linked to Exercise Library
 */

import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { router } from 'expo-router';
import { useDailyStore } from '../../store/daily-store';
import { useTrainingPlanStore } from '../../store/training-plan-store';
import { useSettingsStore } from '../../store/settings-store';
import { TrainingCompatCard } from '../../components/dashboard/TrainingCompatCard';
import { PlanInput } from '../../components/train/PlanInput';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { TRAINING_RECOVERY_MAP } from '../../data/training-recovery-map';
import { classifySessionIntensity } from '../../lib/types/training-plan';
import { today } from '../../lib/utils/date';
import type { PlannedSession } from '../../lib/types/training-plan';
import type { TrainingModalityKey } from '../../lib/types/iaci';

// ─── Recovery options by workout intensity ─────────────────────────────────

interface RecoveryOption {
  key: string;
  label: string;
  description: string;
  durationMin: number;
  category: string;
  rpe: string;
  examples: string[];
  environment: string[];
}

function getRecoveryOptionsForWorkout(
  sessions: PlannedSession[],
  userEnvironment: string[],
  userEquipment: string[],
): RecoveryOption[] {
  if (sessions.length === 0) return [];

  // Determine max intensity from today's sessions
  const intensities = sessions.map(s => classifySessionIntensity(s.type, s.intensityZone));
  const hasKey = intensities.includes('key');
  const hasHard = intensities.includes('hard');
  const hasModerate = intensities.includes('moderate');

  // Select recovery modality pools based on workout intensity
  let recoveryKeys: TrainingModalityKey[];
  if (hasKey || hasHard) {
    // High intensity → aggressive recovery
    recoveryKeys = [
      'coldExposure', 'massage', 'mobilityFlow', 'yoga', 'breathworkActive',
      'walkingRecovery', 'aquaticRecovery', 'meditation', 'sauna',
      'eccentricRecovery', 'correctiveExercise',
    ];
  } else if (hasModerate) {
    // Moderate → standard recovery
    recoveryKeys = [
      'mobilityFlow', 'yoga', 'walkingRecovery', 'breathworkActive',
      'massage', 'meditation', 'easyCycling', 'swimEasy',
      'correctiveExercise', 'taiChi',
    ];
  } else {
    // Easy/rest → light active recovery
    recoveryKeys = [
      'mobilityFlow', 'breathworkActive', 'meditation', 'yoga',
      'walkingRecovery', 'taiChi', 'correctiveExercise',
    ];
  }

  const envSet = userEnvironment.length > 0
    ? new Set(userEnvironment.map(e => e.toLowerCase()))
    : null;
  const equipSet = userEquipment.length > 0
    ? new Set(userEquipment.map(e => e.toLowerCase()))
    : null;

  const options: RecoveryOption[] = [];

  for (const key of recoveryKeys) {
    const profile = TRAINING_RECOVERY_MAP[key];
    if (!profile) continue;

    // Filter by environment
    if (envSet && profile.environment.length > 0) {
      const hasAccess = profile.environment.some(
        e => envSet.has(e.toLowerCase()) || e.toLowerCase() === 'anywhere',
      );
      if (!hasAccess) continue;
    }

    options.push({
      key,
      label: profile.label,
      description: profile.recoveryFraming,
      durationMin: profile.durationRange.sweet,
      category: profile.category,
      rpe: `RPE 1-3/10`,
      examples: profile.examples,
      environment: profile.environment,
    });
  }

  return options;
}

// ─── Time filter options ───────────────────────────────────────────────────

const TIME_FILTERS = [
  { label: 'All', maxMin: 999 },
  { label: '≤10 min', maxMin: 10 },
  { label: '≤20 min', maxMin: 20 },
  { label: '≤30 min', maxMin: 30 },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function Train() {
  const { iaci } = useDailyStore();
  const todaySessions = useTrainingPlanStore((s) => s.plannedSessions[today()] ?? []);
  const todayHasPlan = todaySessions.length > 0;
  const userEnvironment = useSettingsStore((s) => s.trainingEnvironment);
  const userEquipment = useSettingsStore((s) => s.availableEquipment);
  const [timeFilter, setTimeFilter] = useState(999);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  const toggleOption = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOption(prev => prev === key ? null : key);
  }, []);

  // Compute recovery options based on today's workout
  const recoveryOptions = useMemo(() => {
    return getRecoveryOptionsForWorkout(todaySessions, userEnvironment, userEquipment);
  }, [todaySessions, userEnvironment, userEquipment]);

  // Apply time filter
  const filteredOptions = useMemo(() => {
    if (timeFilter === 999) return recoveryOptions;
    return recoveryOptions.filter(o => o.durationMin <= timeFilter);
  }, [recoveryOptions, timeFilter]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ═══ STEP 1: Training Compatibility ═══ */}
      {iaci && (
        <View style={styles.section}>
          <TrainingCompatCard compatibility={iaci.protocol.trainingCompatibility} />
        </View>
      )}

      {!iaci && (
        <Card style={styles.section}>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            Complete your morning check-in to see what training is compatible today.
          </ThemedText>
        </Card>
      )}

      {/* ═══ STEP 2: Log Your Workout ═══ */}
      <PlanInput hasPlanForToday={todayHasPlan} />

      {/* Show today's plan summary if entered */}
      {todayHasPlan && (
        <Card style={styles.planSummary}>
          <ThemedText variant="caption" style={styles.sectionHeader}>TODAY'S TRAINING</ThemedText>
          {todaySessions.map((s, i) => (
            <View key={i} style={styles.sessionRow}>
              <ThemedText variant="caption" style={styles.sessionSlot}>
                {s.slot === 'am' ? 'AM' : s.slot === 'pm' ? 'PM' : ''}
              </ThemedText>
              <ThemedText variant="body" style={styles.sessionType}>{s.type}</ThemedText>
              {s.durationMin != null && (
                <ThemedText variant="caption" color={COLORS.textMuted}>{s.durationMin}min</ThemedText>
              )}
              {s.intensityZone && (
                <View style={styles.zoneBadge}>
                  <ThemedText variant="caption" style={styles.zoneText}>{s.intensityZone}</ThemedText>
                </View>
              )}
            </View>
          ))}
        </Card>
      )}

      {/* ═══ STEP 3: Post-Workout Recovery Options ═══ */}
      {todayHasPlan && filteredOptions.length > 0 && (
        <>
          <Card style={styles.recoveryHeader}>
            <ThemedText variant="caption" style={styles.sectionHeader}>
              RECOVERY OPTIONS
            </ThemedText>
            <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.recoverySubtext}>
              Based on your {todaySessions.map(s => s.type).join(' + ')} — filtered by your equipment and location
            </ThemedText>

            {/* Time filter */}
            <View style={styles.timeFilterRow}>
              {TIME_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.label}
                  style={[styles.timeChip, timeFilter === f.maxMin && styles.timeChipActive]}
                  onPress={() => setTimeFilter(f.maxMin)}
                >
                  <ThemedText
                    variant="caption"
                    style={timeFilter === f.maxMin ? styles.timeChipTextActive : styles.timeChipText}
                  >
                    {f.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {filteredOptions.map((option) => {
            const isExpanded = expandedOption === option.key;
            return (
              <Card key={option.key} style={styles.optionCard}>
                <TouchableOpacity
                  onPress={() => toggleOption(option.key)}
                  activeOpacity={0.7}
                  style={styles.optionHeader}
                >
                  <View style={styles.optionLeft}>
                    <ThemedText variant="body" style={styles.optionLabel}>
                      {option.label}
                    </ThemedText>
                    <View style={styles.optionMeta}>
                      <ThemedText variant="caption" color={COLORS.textMuted}>
                        {option.durationMin}min
                      </ThemedText>
                      <View style={styles.rpeBadge}>
                        <ThemedText variant="caption" style={styles.rpeText}>
                          {option.rpe}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <ThemedText variant="caption" style={styles.chevron}>
                    {isExpanded ? '▼' : '▶'}
                  </ThemedText>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.optionDetail}>
                    <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.optionDesc}>
                      {option.description}
                    </ThemedText>
                    {option.examples.length > 0 && (
                      <ThemedText variant="caption" color={COLORS.textMuted} style={styles.optionEquip}>
                        Examples: {option.examples.join(', ')}
                      </ThemedText>
                    )}
                    <TouchableOpacity
                      style={styles.libraryLink}
                      onPress={() => router.push(`/exercise-library?modality=${option.key}`)}
                    >
                      <ThemedText variant="caption" style={styles.libraryLinkText}>
                        View in Exercise Library →
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          })}
        </>
      )}

      {/* Empty state: no workout entered */}
      {!todayHasPlan && (
        <Card style={styles.emptyState}>
          <ThemedText variant="body" color={COLORS.textSecondary} style={styles.emptyText}>
            Enter your workout above to see personalized recovery options.
          </ThemedText>
        </Card>
      )}
    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  planSummary: {
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  sessionSlot: {
    width: 24,
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 10,
  },
  sessionType: {
    flex: 1,
    fontWeight: '600',
  },
  zoneBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  zoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  recoveryHeader: {
    marginBottom: 8,
  },
  recoverySubtext: {
    fontSize: 11,
    marginBottom: 8,
  },
  timeFilterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  timeChip: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
  },
  timeChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timeChipTextActive: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  optionCard: {
    marginBottom: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flex: 1,
  },
  optionLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  optionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  rpeBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rpeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textMuted,
    paddingLeft: 8,
  },
  optionDetail: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  optionDesc: {
    lineHeight: 18,
    marginBottom: 6,
  },
  optionEquip: {
    fontSize: 10,
    marginBottom: 8,
  },
  libraryLink: {
    paddingVertical: 6,
  },
  libraryLinkText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
