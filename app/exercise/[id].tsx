import { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/lib/utils/constants';
import exercisesData from '@/data/exercises.json';

interface Exercise {
  id: string;
  name: string;
  category: string;
  energySystem: string;
  environment: string[];
  equipment: string[];
  hrZoneTarget: string | null;
  strainEstimate: number;
  recoveryCost: number;
  travelFriendly: boolean;
  bodySystemsStressed: string[];
  description: string;
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStrainColor(strain: number): string {
  if (strain <= 5) return COLORS.success;
  if (strain <= 10) return COLORS.primary;
  if (strain <= 15) return COLORS.warning;
  return COLORS.error;
}

function getRecoveryCostColor(cost: number): string {
  if (cost <= 2) return COLORS.success;
  if (cost <= 5) return COLORS.warning;
  return COLORS.error;
}

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const exercise = useMemo<Exercise | undefined>(
    () => (exercisesData as Exercise[]).find((e) => e.id === id),
    [id]
  );

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Exercise' }} />
        <View style={styles.notFoundContainer}>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            Exercise not found.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: exercise.name,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <Card style={styles.section}>
          <View style={styles.headerRow}>
            <ThemedText variant="title" style={styles.exerciseName}>
              {exercise.name}
            </ThemedText>
            {exercise.travelFriendly && (
              <View style={styles.travelBadge}>
                <ThemedText variant="caption" color={COLORS.success} style={styles.travelBadgeText}>
                  Travel-Friendly
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText variant="body" color={COLORS.textSecondary} style={styles.description}>
            {exercise.description}
          </ThemedText>
        </Card>

        {/* Category & Energy System */}
        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Overview
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText variant="caption">Category</ThemedText>
            <ThemedText variant="body">{formatLabel(exercise.category)}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText variant="caption">Energy System</ThemedText>
            <ThemedText variant="body">{formatLabel(exercise.energySystem)}</ThemedText>
          </View>
          {exercise.hrZoneTarget && (
            <View style={styles.infoRow}>
              <ThemedText variant="caption">HR Zone Target</ThemedText>
              <ThemedText variant="body" color={COLORS.primary}>
                {exercise.hrZoneTarget}
              </ThemedText>
            </View>
          )}
        </Card>

        {/* Strain & Recovery */}
        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Load Estimates
          </ThemedText>
          <View style={styles.estimateRow}>
            <View style={styles.estimateItem}>
              <ThemedText variant="caption">Strain Estimate</ThemedText>
              <ThemedText
                variant="score"
                color={getStrainColor(exercise.strainEstimate)}
                style={styles.estimateScore}
              >
                {exercise.strainEstimate}
              </ThemedText>
              <ThemedText variant="caption">/ 21</ThemedText>
            </View>
            <View style={styles.estimateDivider} />
            <View style={styles.estimateItem}>
              <ThemedText variant="caption">Recovery Cost</ThemedText>
              <ThemedText
                variant="score"
                color={getRecoveryCostColor(exercise.recoveryCost)}
                style={styles.estimateScore}
              >
                {exercise.recoveryCost}
              </ThemedText>
              <ThemedText variant="caption">/ 10</ThemedText>
            </View>
          </View>
        </Card>

        {/* Equipment & Environment */}
        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Requirements
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText variant="caption">Equipment</ThemedText>
            <ThemedText variant="body">
              {exercise.equipment.length > 0
                ? exercise.equipment.map(formatLabel).join(', ')
                : 'None'}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText variant="caption">Environment</ThemedText>
            <ThemedText variant="body">
              {exercise.environment.map(formatLabel).join(', ')}
            </ThemedText>
          </View>
        </Card>

        {/* Body Systems Stressed */}
        {exercise.bodySystemsStressed.length > 0 && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Body Systems Stressed
            </ThemedText>
            <View style={styles.tagRow}>
              {exercise.bodySystemsStressed.map((system) => (
                <View key={system} style={styles.tag}>
                  <ThemedText variant="caption" color={COLORS.primary} style={styles.tagText}>
                    {formatLabel(system)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Log Workout Button */}
        <Button
          title="Log This Workout"
          onPress={() => router.push('/post-workout')}
          style={styles.logButton}
        />
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
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseName: {
    flex: 1,
  },
  travelBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  travelBadgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
  description: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  estimateItem: {
    alignItems: 'center',
    gap: 2,
  },
  estimateScore: {
    fontSize: 36,
  },
  estimateDivider: {
    width: 1,
    height: 60,
    backgroundColor: COLORS.border,
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
  },
  logButton: {
    marginTop: 8,
  },
});
