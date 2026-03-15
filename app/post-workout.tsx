import { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useWorkoutLogger } from '../hooks/use-workout-logger';
import { useWhoopSync } from '../hooks/use-whoop-sync';
import { useRecoveryPlan } from '../hooks/use-recovery-plan';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Slider';
import { Card } from '../components/ui/Card';
import { RecoveryPlanCard } from '../components/feed/RecoveryPlanCard';
import { COLORS } from '../lib/utils/constants';
import { RecoveryPlan } from '../lib/types/load-capacity';
import { TRAINING_RECOVERY_MAP } from '../data/training-recovery-map';
import { TrainingCategory } from '../lib/types/iaci';

// Build categorized activity list from the training recovery map
interface ActivityOption {
  key: string;
  label: string;
  category: TrainingCategory;
}

const ALL_ACTIVITIES: ActivityOption[] = Object.entries(TRAINING_RECOVERY_MAP).map(
  ([key, profile]) => ({
    key,
    label: profile.label,
    category: profile.category,
  }),
);

const CATEGORY_ORDER: { key: TrainingCategory; label: string; icon: string }[] = [
  { key: 'aerobic', label: 'Aerobic', icon: '🏃' },
  { key: 'strength', label: 'Strength', icon: '🏋️' },
  { key: 'bodyweight', label: 'Bodyweight', icon: '💪' },
  { key: 'agt', label: 'Anti-Glycolytic', icon: '⚡' },
  { key: 'mitochondrial', label: 'Mitochondrial', icon: '🧬' },
  { key: 'mind_body', label: 'Mind & Body', icon: '🧘' },
  { key: 'mobility', label: 'Mobility', icon: '🤸' },
  { key: 'aquatic', label: 'Aquatic & Low Impact', icon: '🏊' },
  { key: 'low_impact', label: 'Low Impact', icon: '🚶' },
  { key: 'lifestyle', label: 'Lifestyle & Recovery', icon: '🌿' },
  { key: 'skill', label: 'Skill Work', icon: '🎯' },
];

// Recent activities stored in memory (persists for session)
let recentActivityKeys: string[] = [];

function addToRecent(key: string) {
  recentActivityKeys = [key, ...recentActivityKeys.filter((k) => k !== key)].slice(0, 5);
}

export default function PostWorkout() {
  const { logWorkout } = useWorkoutLogger();
  const { syncPostWorkout } = useWhoopSync();
  const { generatePlan } = useRecoveryPlan();
  const [selectedKey, setSelectedKey] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [search, setSearch] = useState('');

  // Filter activities by search
  const filteredActivities = useMemo(() => {
    if (!search.trim()) return ALL_ACTIVITIES;
    const q = search.toLowerCase();
    return ALL_ACTIVITIES.filter(
      (a) => a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
    );
  }, [search]);

  // Group filtered activities by category
  const groupedActivities = useMemo(() => {
    const groups: { key: TrainingCategory; label: string; icon: string; items: ActivityOption[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = filteredActivities.filter((a) => a.category === cat.key);
      if (items.length > 0) {
        groups.push({ ...cat, items });
      }
    }
    return groups;
  }, [filteredActivities]);

  // Recent activities
  const recentActivities = useMemo(
    () =>
      recentActivityKeys
        .map((k) => ALL_ACTIVITIES.find((a) => a.key === k))
        .filter(Boolean) as ActivityOption[],
    [selectedKey], // re-derive when selection changes
  );

  const selectedLabel = ALL_ACTIVITIES.find((a) => a.key === selectedKey)?.label ?? '';

  async function handleSubmit() {
    if (!selectedKey || !durationMin) return;
    setSubmitting(true);

    try {
      const duration = parseInt(durationMin);

      await logWorkout({
        workoutType: selectedKey,
        durationMs: duration * 60000,
        rpe,
        notes: notes || undefined,
      });

      addToRecent(selectedKey);

      await syncPostWorkout();

      const result = generatePlan({
        type: selectedKey,
        durationMin: duration,
        strain: null,
        rpe,
        bodyAreasLoaded: [],
        hrZones: {},
      });

      if (result?.plan) {
        setPlan(result.plan);
        setShowPlan(true);
      } else {
        router.back();
      }
    } catch (err) {
      console.error('Post-workout error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // Show recovery plan after logging
  if (showPlan && plan) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedText variant="title" style={styles.planTitle}>
          Your Recovery Plan
        </ThemedText>
        <RecoveryPlanCard plan={plan} />
        <Button title="Done" onPress={() => router.back()} style={styles.submit} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Search bar */}
      <Card>
        <TextInput
          placeholder="Search activities..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </Card>

      {/* Recent activities */}
      {recentActivities.length > 0 && !search.trim() && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            RECENTLY USED
          </ThemedText>
          <View style={styles.chipRow}>
            {recentActivities.map((a) => (
              <TouchableOpacity
                key={a.key}
                style={[styles.chip, selectedKey === a.key && styles.chipSelected]}
                onPress={() => setSelectedKey(a.key)}
                activeOpacity={0.7}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.chipText, selectedKey === a.key && styles.chipTextSelected]}
                >
                  {a.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Activity selection by category */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          {search.trim() ? `RESULTS (${filteredActivities.length})` : 'SELECT ACTIVITY'}
        </ThemedText>

        {groupedActivities.map((group) => (
          <View key={group.key} style={styles.categoryGroup}>
            <ThemedText variant="body" style={styles.categoryLabel}>
              {group.icon} {group.label}
            </ThemedText>
            <View style={styles.chipRow}>
              {group.items.map((a) => (
                <TouchableOpacity
                  key={a.key}
                  style={[styles.chip, selectedKey === a.key && styles.chipSelected]}
                  onPress={() => setSelectedKey(a.key)}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    variant="caption"
                    style={[styles.chipText, selectedKey === a.key && styles.chipTextSelected]}
                  >
                    {a.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {filteredActivities.length === 0 && (
          <ThemedText variant="body" color={COLORS.textSecondary} style={styles.emptyText}>
            No activities match "{search}"
          </ThemedText>
        )}
      </Card>

      {/* Duration */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.title}>Duration</ThemedText>
        <TextInput
          placeholder="Minutes"
          placeholderTextColor={COLORS.textMuted}
          value={durationMin}
          onChangeText={setDurationMin}
          keyboardType="numeric"
          style={styles.input}
        />
      </Card>

      {/* RPE */}
      <Card style={styles.section}>
        <Slider
          label={`RPE (Rate of Perceived Exertion): ${rpe}/10`}
          value={rpe}
          min={1}
          max={10}
          onChange={setRpe}
          labels={['Very Easy', 'Maximal']}
        />
      </Card>

      {/* Notes */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.title}>Notes (Optional)</ThemedText>
        <TextInput
          placeholder="How did it feel?"
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />
      </Card>

      <Button
        title={selectedLabel ? `Log ${selectedLabel}` : 'Log Workout'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!selectedKey || !durationMin}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 15,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  categoryGroup: {
    marginBottom: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  title: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: 24,
  },
  planTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
});
