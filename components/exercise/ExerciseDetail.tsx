/**
 * ExerciseDetail — Full exercise view with video player + form cues.
 * Reuses ProtocolVideoPlayer for video playback.
 */

import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { ProtocolVideoPlayer } from '../recovery/ProtocolVideoPlayer';
import type { ExerciseDemo } from '../../data/exercise-library';
import { EXERCISE_CATEGORY_LABELS } from '../../data/exercise-library';

interface Props {
  exercise: ExerciseDemo;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#00C48C',
  intermediate: '#FFB800',
  advanced: '#FF4444',
};

export function ExerciseDetail({ exercise }: Props) {
  const hasVideo = exercise.videoUrl && !exercise.descriptionOnly;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Video or Placeholder */}
      {hasVideo ? (
        <ProtocolVideoPlayer videoUrl={exercise.videoUrl!} protocolName={exercise.name} />
      ) : (
        <View style={styles.placeholderVideo}>
          <ThemedText variant="body" color={COLORS.textMuted}>
            {exercise.descriptionOnly ? 'Description-based protocol' : 'Video demo coming soon'}
          </ThemedText>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="subtitle" style={styles.title}>{exercise.name}</ThemedText>
        <View style={styles.badges}>
          <View style={styles.catBadge}>
            <ThemedText variant="caption" style={styles.catText}>
              {EXERCISE_CATEGORY_LABELS[exercise.category]}
            </ThemedText>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] + '20' }]}>
            <ThemedText variant="caption" style={[styles.diffText, { color: DIFFICULTY_COLORS[exercise.difficulty] }]}>
              {DIFFICULTY_LABELS[exercise.difficulty]}
            </ThemedText>
          </View>
          {exercise.supportsLymphatic && (
            <View style={styles.lymphBadge}>
              <ThemedText variant="caption" style={styles.lymphText}>Lymphatic</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Form Cues */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionLabel}>FORM CUES</ThemedText>
        {exercise.cues.map((cue, i) => (
          <View key={i} style={styles.cueRow}>
            <ThemedText variant="caption" style={styles.cueNumber}>{i + 1}</ThemedText>
            <ThemedText variant="body" style={styles.cueText}>{cue}</ThemedText>
          </View>
        ))}
      </Card>

      {/* Target Areas */}
      {exercise.targetAreas.length > 0 && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionLabel}>TARGET AREAS</ThemedText>
          <View style={styles.tagRow}>
            {exercise.targetAreas.map((area) => (
              <View key={area} style={styles.tag}>
                <ThemedText variant="caption" style={styles.tagText}>
                  {area.replace(/_/g, ' ')}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Equipment */}
      {exercise.equipment.length > 0 && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionLabel}>EQUIPMENT</ThemedText>
          <View style={styles.tagRow}>
            {exercise.equipment.map((item) => (
              <View key={item} style={styles.equipTag}>
                <ThemedText variant="caption" style={styles.equipText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Duration */}
      {exercise.duration > 0 && (
        <View style={styles.durationRow}>
          <ThemedText variant="caption" color={COLORS.textMuted}>
            Suggested duration: {exercise.duration} seconds
          </ThemedText>
        </View>
      )}
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
  placeholderVideo: {
    height: 180,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catBadge: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  diffBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lymphBadge: {
    backgroundColor: '#4DA6FF20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lymphText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  cueRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  cueNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary + '20',
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },
  cueText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  equipTag: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  equipText: {
    fontSize: 11,
    color: COLORS.warning,
    textTransform: 'capitalize',
  },
  durationRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
