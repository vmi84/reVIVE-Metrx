import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, LayoutAnimation } from 'react-native';
import { router } from 'expo-router';
import { useDailyStore } from '../../store/daily-store';
import { useWorkoutLogger } from '../../hooks/use-workout-logger';
import { useTrainingRecommendations } from '../../hooks/use-training-recommendations';
import { TrainingCompatCard } from '../../components/dashboard/TrainingCompatCard';
import { RecoveryBetweenSessions } from '../../components/train/RecoveryBetweenSessions';
import { PlanInput } from '../../components/train/PlanInput';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';
import { Workout } from '../../lib/types/exercises';
import { TRAINING_RECOVERY_MAP } from '../../data/training-recovery-map';

// Quick-access categories for the train tab
const QUICK_CATEGORIES = [
  {
    label: 'Performance',
    icon: '🏋️',
    keys: ['zone1', 'zone2', 'intervals', 'tempo', 'strengthHeavy', 'strengthLight', 'techniqueDrill', 'plyometrics'],
  },
  {
    label: 'Recovery Training',
    icon: '💪',
    keys: ['eccentricRecovery', 'correctiveExercise', 'kettlebellRecovery', 'bodyweightRecovery', 'calisthenicsFlow'],
  },
  {
    label: 'Mind & Body',
    icon: '🧘',
    keys: ['yoga', 'taiChi', 'breathworkActive', 'meditation', 'mobilityFlow'],
  },
  {
    label: 'Active Recovery',
    icon: '🌿',
    keys: ['walkingRecovery', 'easyCycling', 'swimEasy', 'aquaticRecovery', 'hiking', 'gardening', 'massage', 'dancing', 'playRecreation'],
  },
];

export default function Train() {
  const { iaci, athleteMode } = useDailyStore();
  const isCompetitive = athleteMode === 'competitive';
  const { fetchRecentWorkouts, logWorkout, activeWorkout } = useWorkoutLogger();
  const trainingRecs = useTrainingRecommendations();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const toggleCat = (label: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchRecentWorkouts();
  }, []);

  // Filtered quick actions by search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return QUICK_CATEGORIES;
    const q = search.toLowerCase();
    return QUICK_CATEGORIES.map((cat) => ({
      ...cat,
      keys: cat.keys.filter((key) => {
        const profile = TRAINING_RECOVERY_MAP[key as keyof typeof TRAINING_RECOVERY_MAP];
        return profile?.label.toLowerCase().includes(q);
      }),
    })).filter((cat) => cat.keys.length > 0);
  }, [search]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ═══ STEP 1: Training Compatibility — What can you do today? ═══ */}
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

      {/* ═══ STEP 2: Log Training — What are you doing / did you do? ═══ */}
      {isCompetitive && <PlanInput />}

      {/* ═══ STEP 3: Recovery Recommendations — Based on your training ═══ */}
      {/* Competitive mode: plan-aware recovery between sessions */}
      {isCompetitive && iaci && <RecoveryBetweenSessions />}

      {/* IACI-recommended recovery/training */}
      {trainingRecs.hasData && trainingRecs.topPick && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            RECOMMENDED FOR YOU
          </ThemedText>
          <TouchableOpacity
            style={styles.topPickCard}
            onPress={() => router.push('/post-workout')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ThemedText variant="body" style={styles.topPickLabel}>
                {trainingRecs.topPick.label}
              </ThemedText>
              {trainingRecs.topPick.recommendedRPE && (
                <View style={{ backgroundColor: COLORS.primary + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <ThemedText variant="caption" style={{ color: COLORS.primary, fontWeight: '700', fontSize: 10 }}>
                    {trainingRecs.topPick.recommendedRPE}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={2}>
              {trainingRecs.topPick.recoveryFraming}
            </ThemedText>
          </TouchableOpacity>
        </Card>
      )}

      {/* Search */}
      <Card style={styles.section}>
        <TextInput
          placeholder="Search activities..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </Card>

      {/* Quick Log by Category */}
      {filteredCategories.map((cat) => {
        const isExpanded = expandedCats.has(cat.label);
        return (
          <Card key={cat.label} style={styles.section}>
            <TouchableOpacity
              style={styles.catHeader}
              onPress={() => toggleCat(cat.label)}
              activeOpacity={0.7}
            >
              <ThemedText variant="caption" style={styles.sectionHeader}>
                {cat.icon} {cat.label.toUpperCase()}
              </ThemedText>
              <View style={styles.catHeaderRight}>
                <View style={styles.catCount}>
                  <ThemedText variant="caption" style={styles.catCountText}>
                    {cat.keys.length}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" style={styles.chevron}>
                  {isExpanded ? '▼' : '▶'}
                </ThemedText>
              </View>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.quickActions}>
                {cat.keys.map((key) => {
                  const profile = TRAINING_RECOVERY_MAP[key as keyof typeof TRAINING_RECOVERY_MAP];
                  if (!profile) return null;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.quickAction}
                      onPress={() => router.push('/post-workout')}
                    >
                      <ThemedText variant="caption" style={styles.quickActionText}>
                        {profile.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Card>
        );
      })}

      {filteredCategories.length === 0 && search.trim() && (
        <Card style={styles.section}>
          <ThemedText variant="body" color={COLORS.textSecondary} style={styles.emptyText}>
            No activities match "{search}"
          </ThemedText>
        </Card>
      )}

      {/* Full log button */}
      <Button
        title="Log Full Workout"
        onPress={() => router.push('/post-workout')}
        style={styles.fullLogButton}
      />

      {/* Recent Workouts */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          RECENT WORKOUTS
        </ThemedText>
        {recentWorkouts.length === 0 ? (
          <ThemedText variant="body" color={COLORS.textSecondary}>
            No workouts logged yet.
          </ThemedText>
        ) : (
          recentWorkouts.slice(0, 5).map((w, i) => (
            <View key={i} style={styles.workoutRow}>
              <ThemedText variant="body">{w.workoutType}</ThemedText>
              <ThemedText variant="caption" color={COLORS.textSecondary}>
                {w.date}
              </ThemedText>
            </View>
          ))
        )}
      </Card>
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
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 0,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 0,
  },
  catHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catCount: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textMuted,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  quickAction: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  topPickCard: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    borderRadius: 10,
    padding: 14,
  },
  topPickLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  fullLogButton: {
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
});
