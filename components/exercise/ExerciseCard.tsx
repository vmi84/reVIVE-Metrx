/**
 * ExerciseCard — Compact card for 2-column grid in exercise library.
 * Shows name, category badge, duration, and difficulty.
 */

import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import type { ExerciseDemo, ExerciseCategory } from '../../data/exercise-library';
import { EXERCISE_CATEGORY_LABELS } from '../../data/exercise-library';

interface Props {
  exercise: ExerciseDemo;
  onPress: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#00C48C',
  intermediate: '#FFB800',
  advanced: '#FF4444',
};

export function ExerciseCard({ exercise, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Placeholder thumbnail */}
      <View style={styles.thumbnail}>
        {exercise.descriptionOnly ? (
          <ThemedText variant="caption" color={COLORS.textMuted} style={styles.thumbText}>
            Info
          </ThemedText>
        ) : exercise.videoUrl ? (
          <ThemedText variant="caption" color={COLORS.primary} style={styles.thumbText}>
            Play
          </ThemedText>
        ) : (
          <ThemedText variant="caption" color={COLORS.textMuted} style={styles.thumbText}>
            Demo
          </ThemedText>
        )}
        {exercise.duration > 0 && (
          <View style={styles.durationBadge}>
            <ThemedText variant="caption" style={styles.durationText}>
              {exercise.duration}s
            </ThemedText>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <ThemedText variant="caption" style={styles.name} numberOfLines={2}>
          {exercise.name}
        </ThemedText>
        <View style={styles.metaRow}>
          <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] + '20' }]}>
            <ThemedText variant="caption" style={[styles.diffText, { color: DIFFICULTY_COLORS[exercise.difficulty] }]}>
              {exercise.difficulty[0].toUpperCase()}
            </ThemedText>
          </View>
          {exercise.supportsLymphatic && (
            <View style={styles.lymphBadge}>
              <ThemedText variant="caption" style={styles.lymphText}>L</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    overflow: 'hidden',
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnail: {
    height: 72,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  info: {
    padding: 6,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 4,
  },
  diffBadge: {
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  diffText: {
    fontSize: 8,
    fontWeight: '700',
  },
  lymphBadge: {
    backgroundColor: '#4DA6FF20',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  lymphText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
