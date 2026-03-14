import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useDailyStore } from '../../store/daily-store';
import { useWorkoutLogger } from '../../hooks/use-workout-logger';
import { TrainingCompatCard } from '../../components/dashboard/TrainingCompatCard';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';
import { Workout } from '../../lib/types/exercises';

export default function Train() {
  const { iaci } = useDailyStore();
  const { fetchRecentWorkouts, logWorkout, activeWorkout } = useWorkoutLogger();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    fetchRecentWorkouts();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Training compatibility from IACI */}
      {iaci && (
        <View style={styles.section}>
          <TrainingCompatCard compatibility={iaci.protocol.trainingCompatibility} />
        </View>
      )}

      {!iaci && (
        <Card style={styles.section}>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            Complete your morning check-in to see training recommendations.
          </ThemedText>
        </Card>
      )}

      {/* Quick Log */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          LOG WORKOUT
        </ThemedText>
        <View style={styles.quickActions}>
          {['Easy Run', 'Tempo Run', 'Interval', 'Long Run', 'Cycling', 'Swimming', 'Strength', 'Mobility'].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.quickAction}
              onPress={() => router.push('/post-workout')}
            >
              <ThemedText variant="caption" style={styles.quickActionText}>
                {type}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

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
    marginBottom: 16,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
