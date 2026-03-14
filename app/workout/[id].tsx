import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/lib/utils/constants';

interface WorkoutData {
  id: string;
  date: string;
  workout_type: string;
  exercise_id: string | null;
  start_time: string;
  end_time: string;
  duration_ms: number;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  strain_score: number | null;
  rpe: number | null;
  calories: number | null;
  body_systems_stressed: string[];
  notes: string | null;
  hr_zone_distribution: Record<string, number> | null;
  source: string;
}

const HR_ZONE_COLORS: Record<string, string> = {
  zone1: '#4DA6FF',
  zone2: COLORS.success,
  zone3: COLORS.warning,
  zone4: COLORS.orange,
  zone5: COLORS.error,
};

const HR_ZONE_LABELS: Record<string, string> = {
  zone1: 'Zone 1 - Recovery',
  zone2: 'Zone 2 - Aerobic',
  zone3: 'Zone 3 - Tempo',
  zone4: 'Zone 4 - Threshold',
  zone5: 'Zone 5 - VO2max',
};

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

function formatWorkoutType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkout() {
      if (!user?.id || !id) return;

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setWorkout(data as WorkoutData);
      }
      setLoading(false);
    }

    fetchWorkout();
  }, [id, user?.id]);

  const hrZones = workout?.hr_zone_distribution ?? {};
  const maxZoneValue = Math.max(...Object.values(hrZones), 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: workout ? formatWorkoutType(workout.workout_type) : 'Workout',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !workout ? (
          <View style={styles.loadingContainer}>
            <ThemedText variant="body" color={COLORS.textSecondary}>
              Workout not found.
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Header Info */}
            <Card style={styles.section}>
              <ThemedText variant="title" style={styles.workoutTitle}>
                {formatWorkoutType(workout.workout_type)}
              </ThemedText>
              <ThemedText variant="caption">{workout.date}</ThemedText>
            </Card>

            {/* Key Metrics */}
            <Card style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Key Metrics
              </ThemedText>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <ThemedText variant="caption">Duration</ThemedText>
                  <ThemedText variant="subtitle">
                    {formatDuration(workout.duration_ms)}
                  </ThemedText>
                </View>
                {workout.avg_heart_rate != null && (
                  <View style={styles.metricItem}>
                    <ThemedText variant="caption">Avg HR</ThemedText>
                    <ThemedText variant="subtitle">
                      {workout.avg_heart_rate} bpm
                    </ThemedText>
                  </View>
                )}
                {workout.max_heart_rate != null && (
                  <View style={styles.metricItem}>
                    <ThemedText variant="caption">Max HR</ThemedText>
                    <ThemedText variant="subtitle">
                      {workout.max_heart_rate} bpm
                    </ThemedText>
                  </View>
                )}
                {workout.strain_score != null && (
                  <View style={styles.metricItem}>
                    <ThemedText variant="caption">Strain</ThemedText>
                    <ThemedText variant="subtitle" color={COLORS.primary}>
                      {workout.strain_score.toFixed(1)}
                    </ThemedText>
                  </View>
                )}
                {workout.rpe != null && (
                  <View style={styles.metricItem}>
                    <ThemedText variant="caption">RPE</ThemedText>
                    <ThemedText variant="subtitle">{workout.rpe}/10</ThemedText>
                  </View>
                )}
                {workout.calories != null && (
                  <View style={styles.metricItem}>
                    <ThemedText variant="caption">Calories</ThemedText>
                    <ThemedText variant="subtitle">{workout.calories} kcal</ThemedText>
                  </View>
                )}
              </View>
            </Card>

            {/* HR Zone Distribution */}
            {Object.keys(hrZones).length > 0 && (
              <Card style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  HR Zone Distribution
                </ThemedText>
                {Object.entries(hrZones).map(([zone, value]) => {
                  const barWidth = (value / maxZoneValue) * 100;
                  const color = HR_ZONE_COLORS[zone] ?? COLORS.textSecondary;
                  const label = HR_ZONE_LABELS[zone] ?? zone;
                  return (
                    <View key={zone} style={styles.zoneRow}>
                      <ThemedText variant="caption" style={styles.zoneLabel}>
                        {label}
                      </ThemedText>
                      <View style={styles.zoneBarContainer}>
                        <View
                          style={[
                            styles.zoneBar,
                            { width: `${Math.max(barWidth, 2)}%`, backgroundColor: color },
                          ]}
                        />
                      </View>
                      <ThemedText variant="caption" style={styles.zoneValue}>
                        {typeof value === 'number' ? `${value.toFixed(0)}%` : value}
                      </ThemedText>
                    </View>
                  );
                })}
              </Card>
            )}

            {/* Body Systems Stressed */}
            {workout.body_systems_stressed.length > 0 && (
              <Card style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Body Systems Stressed
                </ThemedText>
                <View style={styles.tagRow}>
                  {workout.body_systems_stressed.map((system) => (
                    <View key={system} style={styles.tag}>
                      <ThemedText variant="caption" color={COLORS.primary} style={styles.tagText}>
                        {system.replace(/_/g, ' ')}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Notes */}
            {workout.notes && (
              <Card style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Notes
                </ThemedText>
                <ThemedText variant="body" color={COLORS.textSecondary}>
                  {workout.notes}
                </ThemedText>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  section: {
    marginBottom: 16,
  },
  workoutTitle: {
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    minWidth: '40%',
    gap: 2,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  zoneLabel: {
    width: 120,
    fontSize: 11,
  },
  zoneBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    overflow: 'hidden',
  },
  zoneBar: {
    height: '100%',
    borderRadius: 8,
  },
  zoneValue: {
    width: 40,
    textAlign: 'right',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
